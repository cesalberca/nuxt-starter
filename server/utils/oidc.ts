import type { JWTPayload } from "jose";
import type { AuthorizationServer, Client, IDToken, WWWAuthenticateChallenge } from "oauth4webapi";
import jmespath from "jmespath";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { useRuntimeConfig } from "nitropack/runtime/config";
import {
  authorizationCodeGrantRequest,
  calculatePKCECodeChallenge,
  generateRandomCodeVerifier,
  generateRandomNonce,
  getValidatedIdTokenClaims,
  isOAuth2Error,
  parseWwwAuthenticateChallenges,
  processAuthorizationCodeOpenIDResponse,
  processRefreshTokenResponse,
  processUserInfoResponse,
  refreshTokenGrantRequest,
  userInfoRequest,
  validateAuthResponse,
} from "oauth4webapi";

const config = useRuntimeConfig();

class OIDC {
  public rootUrl: URL;

  public codeVerifierCookieName: string;
  public stateCookieName: string;
  public nonceCookieName: string;

  private client: Client;
  private as: AuthorizationServer;

  private scopes: string;

  private nameAttributePath: string;
  private emailAttributePath: string;
  private roleAttributePath: string;

  constructor(options: OIDCOptions) {
    this.rootUrl = new URL(options.rootUrl);

    this.codeVerifierCookieName = options.codeVerifierCookieName;
    this.stateCookieName = options.stateCookieName;
    this.nonceCookieName = options.nonceCookieName;

    this.client = {
      client_id: options.clientId,
      client_secret: options.clientSecret,
      token_endpoint_auth_method: "client_secret_basic",
    };
    this.as = {
      issuer: options.issuer,
      authorization_endpoint: options.authorizationEndpoint,
      token_endpoint: options.tokenEndpoint,
      userinfo_endpoint: options.userInfoEndpoint,
      end_session_endpoint: options.endSessionEndpoint,
      jwks_uri: options.jwksUri,
    };

    this.scopes = options.scopes;

    this.nameAttributePath = options.nameAttributePath;
    this.emailAttributePath = options.emailAttributePath;
    this.roleAttributePath = options.roleAttributePath;
  }

  get redirectUri(): string {
    return new URL("/login/callback", this.rootUrl).toString();
  }

  public async createAuthorizationUrl(codeVerifier: string, state: string, nonce: string): Promise<URL> {
    const url = new URL(this.as.authorization_endpoint!);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", this.client.client_id);
    url.searchParams.set("redirect_uri", this.redirectUri);
    url.searchParams.set("scope", this.scopes);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge", await calculatePKCECodeChallenge(codeVerifier));
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    return url;
  }

  public async validateAuthorizationCallback(
    callbackUrl: URL,
    codeVerifier: string,
    state: string,
    nonce: string,
  ): Promise<OIDCAuthorizationCode> {
    const params = validateAuthResponse(this.as, this.client, callbackUrl, state);
    if (isOAuth2Error(params)) {
      throw params.error;
    }

    const response = await authorizationCodeGrantRequest(this.as, this.client, params, this.redirectUri, codeVerifier);
    this.handleWWWAuthenticateChallenges(response);

    const result = await processAuthorizationCodeOpenIDResponse(this.as, this.client, response, nonce);
    if (isOAuth2Error(result)) {
      throw result.error;
    }

    const tokens: OIDCTokens = {
      idToken: result.id_token,
      accessToken: result.access_token,
      accessTokenExpiresAt: this.expiresAt(result.expires_in),
      refreshToken: result.refresh_token ?? null,
      refreshTokenExpiresAt: this.expiresAt(result.refresh_expires_in),
    };

    const claims = getValidatedIdTokenClaims(result);

    return { tokens, claims };
  }

  public async refreshAccessToken(refreshToken: string): Promise<Omit<OIDCTokens, "idToken">> {
    const response = await refreshTokenGrantRequest(this.as, this.client, refreshToken);
    this.handleWWWAuthenticateChallenges(response);

    const result = await processRefreshTokenResponse(this.as, this.client, response);
    if (isOAuth2Error(result)) {
      throw result.error;
    }

    const tokens: Omit<OIDCTokens, "idToken"> = {
      accessToken: result.access_token,
      accessTokenExpiresAt: this.expiresAt(result.expires_in),
      refreshToken: result.refresh_token ?? null,
      refreshTokenExpiresAt: this.expiresAt(result.refresh_expires_in),
    };

    return tokens;
  }

  public async getUserProfile(accessToken: string, sub: string): Promise<OIDCUserProfile> {
    const response = await userInfoRequest(this.as, this.client, accessToken);
    this.handleWWWAuthenticateChallenges(response);

    const result = await processUserInfoResponse(this.as, this.client, sub, response);
    if (isOAuth2Error(result)) {
      throw result.error;
    }

    const profile: OIDCUserProfile = {
      sub: result.sub,
      name: jmespath.search(result, this.nameAttributePath),
      email: jmespath.search(result, this.emailAttributePath),
      role: jmespath.search(result, this.roleAttributePath),
    };

    return profile;
  }

  public async createEndSessionUrl(idToken: string): Promise<URL | null> {
    if (!this.as.end_session_endpoint) {
      return null;
    }

    const url = new URL(this.as.end_session_endpoint);
    url.searchParams.set("client_id", this.client.client_id);
    url.searchParams.set("post_logout_redirect_uri", this.rootUrl.toString());
    url.searchParams.set("id_token_hint", idToken);
    return url;
  }

  public async validateBackchannelLogoutToken(logoutToken: string): Promise<JWTPayload> {
    const JWKS = createRemoteJWKSet(new URL(this.as.jwks_uri!));
    const { payload } = await jwtVerify(logoutToken, JWKS, {
      issuer: this.as.issuer,
      audience: this.client.client_id,
      maxTokenAge: "2 minutes",
      // TODO: Keycloak uses a too generic type, revisit this later
      // See: https://github.com/keycloak/keycloak/issues/19220
      // typ: "logout+jwt",
    });

    if (!payload.sid && !payload.sub) {
      throw new Error("Logout token must contain either sub claim or sid claim, or both");
    }

    if (!(payload.events as Record<string, unknown>)?.["http://schemas.openid.net/event/backchannel-logout"]) {
      throw new Error("Logout token must contain events claim with correct schema");
    }

    if (payload.nonce) {
      throw new Error("Logout token must not contain nonce claim");
    }

    return payload;
  }

  public generateCodeVerifier(): string {
    return generateRandomCodeVerifier();
  }

  public generateState(data?: Record<string, unknown>): string {
    const rand = new Uint32Array(4);
    crypto.getRandomValues(rand);
    const state = [data, ...rand];
    const encoded = btoa(JSON.stringify(state)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    return encoded;
  }

  public parseState(state: string): Record<string, unknown> | null {
    const decoded = JSON.parse(atob(state.replace(/-/g, "+").replace(/_/g, "/")));
    if (Array.isArray(decoded) && decoded.length > 0) {
      return decoded[0];
    }
    return null;
  }

  public generateNonce(): string {
    return generateRandomNonce();
  }

  private handleWWWAuthenticateChallenges(response: Response): void {
    let challenges: WWWAuthenticateChallenge[] | undefined;
    if ((challenges = parseWwwAuthenticateChallenges(response))) {
      throw new Error(`TODO: Handle WWW-Authenticate Challenges: ${challenges.join(", ")}`);
    }
  }

  private expiresAt(expiresIn: unknown): Date | null {
    if (typeof expiresIn === "number") {
      return new Date(Date.now() + expiresIn * 1000);
    }
    return null;
  }
}

export interface OIDCOptions {
  rootUrl: string;
  clientId: string;
  clientSecret: string;
  codeVerifierCookieName: string;
  stateCookieName: string;
  nonceCookieName: string;
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  endSessionEndpoint?: string;
  jwksUri: string;
  scopes: string;
  nameAttributePath: string;
  emailAttributePath: string;
  roleAttributePath: string;
}

export interface OIDCTokens {
  idToken: string;
  accessToken: string;
  accessTokenExpiresAt: Date | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;
}

export interface OIDCAuthorizationCode {
  tokens: OIDCTokens;
  claims: IDToken;
}

export interface OIDCUserProfile {
  sub: string;
  name: string;
  email: string;
  role: string;
}

export const initializeOIDC = () => {
  return new OIDC(config.auth.oidc);
};
