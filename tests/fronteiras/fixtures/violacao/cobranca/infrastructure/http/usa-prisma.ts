// FIXTURE ILEGAL — @prisma/client fora de infrastructure/persistence/ (ADR-002).
import { PrismaClient } from '@prisma/client';

export const cliente = new PrismaClient();
