import { defineI18nLocale } from "#i18n";

export default defineI18nLocale(() => ({
  layouts: {
    default: {
      title: "{page}",
      description: "My awesome app",
    },
  },
  menu: {
    home: {
      label: "Home",
    },
    public: {
      label: "Public",
    },
    private: {
      label: "Private",
    },
  },
  pages: {
    home: {
      title: "Home",
      description: "Hello, world!",
    },
    public: {
      title: "Public",
      description: "This is a public page, anyone can see it.",
    },
    private: {
      title: "Private",
      description: "This is a private page, only authenticated users can see it.",
    },
    profile: {
      title: "Hello, {name}",
      name: "Name",
      email: "Email",
      save: "Save",
    },
  },
  components: {
    authButton: {
      signIn: "Sign in",
      signOut: "Sign out",
    },
  },
}));
