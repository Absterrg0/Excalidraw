/// <reference path="../global.prisma.d.ts" />

import { PrismaClient } from "@prisma/client";

// Use globalThis.prisma (which is now correctly typed) or create a new PrismaClient instance.
const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma ;
