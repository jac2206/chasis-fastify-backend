import { env } from "./config/env";
import { logger } from "./infraestructure/logger/logger";
import { prisma } from "./infraestructure/database/prisma";
import { printEnvironmentVariables } from "./util/env-printer";
import { createServer } from "./server";

async function bootstrap() {
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

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("Application bootstrap failed", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
