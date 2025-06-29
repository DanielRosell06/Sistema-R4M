import { PrismaClient } from "../generated/prisma";

let globalPrisma;
if (process.env.NODE_ENV === "development") {
  globalPrisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query"], 
    });
  }
  globalPrisma = global.prisma;
}

export const prisma = globalPrisma;
