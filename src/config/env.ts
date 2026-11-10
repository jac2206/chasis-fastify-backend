import dotenv from "dotenv";
import packageJson from "../../package.json";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  appName: packageJson.name,
  appVersion: packageJson.version,
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  showEnv: process.env.SHOW_ENV === "true",
  logLevel: process.env.LOG_LEVEL || "info",
  corsOrigins: (
    process.env.CORS_ORIGINS ||
    "http://localhost:3000,http://localhost:3001,http://localhost:4002"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  dataBase: {
    dataBaseUrl: process.env.DATABASE_URL,
  },
  httpConfig: {
    timeOut: process.env.HTTP_TIME_OUT ? Number(process.env.HTTP_TIME_OUT) : 20000,
  },
};

export const validateEnvironment = (): void => {
  const missingVariables: string[] = [];

  if (!env.jwtSecret?.trim()) {
    missingVariables.push("JWT_SECRET");
  }

  if (!env.dataBase.dataBaseUrl?.trim()) {
    missingVariables.push("DATABASE_URL");
  }

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }
};
