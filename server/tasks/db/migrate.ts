import PrismaInternals from "@prisma/internals";
import PrismaMigrate from "@prisma/migrate";
import { defineTask } from "nitropack/runtime/task";

import { logger } from "~/server/utils/logger";

export default defineTask({
  meta: {
    description: "Run database migrations",
  },
  // The following task uses Prisma's internal APIs to run migrations
  // TODO: replace with a more stable API when available
  // See: https://github.com/prisma/prisma/issues/13549
  run: async () => {
    let migrate;

    try {
      const schemaPathResult = await PrismaInternals.getSchemaPath();
      if (!schemaPathResult?.schemaPath) {
        logger.error("No schema found");
        return { result: false };
      }

      migrate = new PrismaMigrate.Migrate(schemaPathResult?.schemaPath);

      const { migrations } = await migrate.listMigrationDirectories();
      if (migrations.length > 0) {
        logger.info(`${migrations.length} migration(s) found`);
      } else {
        logger.info("No migration found");
      }

      const { appliedMigrationNames } = await migrate.applyMigrations();
      if (appliedMigrationNames.length > 0) {
        logger.info(`The following migration(s) have been applied: ${appliedMigrationNames.join(", ")}`);
      } else {
        logger.info("No pending migrations to apply");
      }

      return { result: true };
    } catch (error) {
      logger.error(error, "Error running migrations");
      return { result: false, error };
    } finally {
      migrate?.stop();
    }
  },
});
