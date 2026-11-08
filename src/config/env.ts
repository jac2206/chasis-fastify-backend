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
  jwtSecret: process.env.JWT_SECRET || "secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  dataBase: {
    dataBaseUrl: process.env.DATABASE_URL,
  },
  httpConfig: {
    timeOut: process.env.HTTP_TIME_OUT ? Number(process.env.HTTP_TIME_OUT) : 20000,
  },
};
