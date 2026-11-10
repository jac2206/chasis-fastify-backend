import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../../config/env";
import { PrismaClient } from "../../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: env.dataBase.dataBaseUrl,
  ssl: false,
});

export const prisma = new PrismaClient({
  adapter,
});
