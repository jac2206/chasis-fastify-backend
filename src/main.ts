import { env, validateEnvironment } from "./config/env";
import { prisma } from "./infraestructure/database/prisma";
import { logger } from "./infraestructure/logger/logger";
import { createServer } from "./server";
import { printEnvironmentVariables } from "./util/env-printer";

async function bootstrap() {
  validateEnvironment();
  const app = createServer();

  try {
    await prisma.$connect();
    logger.info("Prisma connected to PostgreSQL");

    await app.listen({ port: env.port, host: "0.0.0.0" });
    console.log(`${env.appName} v${env.appVersion}`);
    console.log(`Environment: ${env.nodeEnv}`);
    console.log(`Running on port ${env.port}`);

    if (env.showEnv) {
      printEnvironmentVariables();
    }

    const shutdown = async () => {
      logger.info("Shutting down gracefully");

      try {
        await app.close();
        await prisma.$disconnect();
        process.exit(0);
      } catch (error) {
        logger.error("Failed to shutdown cleanly", error);
        process.exit(1);
      }
    };

    const handleShutdown = () => {
      void shutdown();
    };

    process.on("SIGINT", handleShutdown);
    process.on("SIGTERM", handleShutdown);
  } catch (error) {
    logger.error("Application bootstrap failed", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

void bootstrap().catch((error: unknown) => {
  logger.error("Unhandled bootstrap failure", error);
  process.exit(1);
});
