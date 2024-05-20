# Nuxt Starter Template

Project template with [Nuxt 3](https://nuxt.com) + [tRPC](https://trpc.io) + [Lucia Auth](https://lucia-auth.com) + [Zenstack](https://zenstack.dev/).

> [!WARNING]
> At the moment this project is in an early stage of development, major changes in its architecture, testing and proper documentation are pending.

## Installation

You need to have installed [pnpm](https://pnpm.io/). In order to do so, we recommend using a JavaScript Tool Manager like [volta](https://volta.sh/).

Once pnpm is installed, you can install the project dependencies:

```bash
pnpm i
```

## Environment Variables

Duplicate `.env.sample` and rename it to `.env`.

During local development you should replace in the `.env` file the NODE_TLS_REJECT_UNAUTHORIZED variable with the following value:

```yaml
NODE_TLS_REJECT_UNAUTHORIZED=0
```

This is necessary because the project uses a self-signed certificate for the HTTPS connection.

## Running

The project uses Docker to run the database and other services, so you need to have Docker installed and running on your machine. Once running, you can start the Docker services with the following command:

```bash
pnpm run docker:start
```

If it's the first launching the project you need to run the following command in order for Prisma to generate the database tables:

```bash
pnpx prisma db push --force-reset
```
