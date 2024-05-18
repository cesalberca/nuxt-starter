import { defineNitroPlugin } from "nitropack/runtime/plugin";
import { runTask } from "nitropack/runtime/task";

export default defineNitroPlugin(async (): Promise<void> => {
  // Skip running migrations in development
  if (import.meta.dev) return;

  await runTask("db:migrate");
});
