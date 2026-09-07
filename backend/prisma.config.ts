import { defineConfig } from 'prisma/config';

// Prisma 7: a URL do banco vive aqui, nao no schema. Sem .env, cai no Postgres
// do docker compose (mesmo valor de .env.example) para `harness setup` funcionar
// em maquina limpa sem passo manual (RNF-007).
const url =
  process.env.DATABASE_URL ??
  'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url },
});
