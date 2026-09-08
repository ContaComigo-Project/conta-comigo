// FIXTURE ILEGAL — @prisma/client dentro de domain/ (ADR-002).
import { PrismaClient } from '@prisma/client';

export const cliente = new PrismaClient();
