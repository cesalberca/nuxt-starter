import { defineI18nLocale } from "#i18n";

export default defineI18nLocale(() => ({
  layouts: {
    default: {
      title: "{page}",
      description: "Mi aplicación increíble",
    },
  },
  menu: {
    home: {
      label: "Inicio",
    },
    public: {
      label: "Público",
    },
    private: {
      label: "Privado",
    },
  },
  pages: {
    home: {
      title: "Inicio",
      description: "¡Hola, mundo!",
    },
    public: {
      title: "Public",
      description: "Esta es una página pública, cualquiera puede verla.",
    },
    private: {
      title: "Privado",
      description: "Esta es una página privada, solo los usuarios autenticados pueden verla.",
    },
    profile: {
      title: "Hola, {name}",
      name: "Nombre",
      email: "Correo electrónico",
      save: "Guardar",
    },
  },
  components: {
    authButton: {
      signIn: "Iniciar sesión",
      signOut: "Cerrar sesión",
    },
  },
}));
