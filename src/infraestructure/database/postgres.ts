import { Pool } from "pg";
import { env } from "../../config/env";
import { logger } from "../logger/logger";

export const pool = new Pool({
  connectionString: env.dataBase.dataBaseUrl,
  ssl: false,
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await pool.query("SELECT 1");
    logger.info("✅ PostgreSQL connected");
  } catch (error) {
    logger.error("❌ Database connection failed", error);
    process.exit(1);
  }
};

export const closeDatabase = async (): Promise<void> => {
  await pool.end();
};
