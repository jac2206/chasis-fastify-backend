import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

import { env } from "../../config/env";

const adapter = new PrismaPg({
  connectionString: env.dataBase.dataBaseUrl,
  ssl: false,
});

export const prisma = new PrismaClient({
  adapter,
});
