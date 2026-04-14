import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { configDotenv } from "dotenv";

configDotenv();

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: "stdout", level: "query" }, // Log every SQL query
    { emit: "stdout", level: "error" }, // Log errors
    { emit: "stdout", level: "warn" }, // Log warnings
  ],
});
