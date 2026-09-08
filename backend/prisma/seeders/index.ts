// db:seed — demo data for the PoC. Creates an account, an active consent and
// a set of synthetic external accounts and transactions, so the app can be
// opened with data already present. Uses only synthetic data (never real bank
// data). Run: pnpm --filter @contacomigo/backend db:seed
import { hash } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/transactions/infrastructure/persistence/gerado/client';
import { cipherr } from '../../src/transactions/infrastructure/persistence/cipher';

const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? URL_PADRAO }) });

const DEMO_EMAIL = 'demo@contacomigo.app';
const DEMO_SENHA = 'demo123';
const HOLDER = 'demo-holder';

const CONTAS = [
  { id: 'seed-conta-corrente', externalId: 'seed-acc-corrente', institutionId: 'Banco Exemplo', type: 'corrente', balanceInCents: 241_832 },
  { id: 'seed-conta-poupanca', externalId: 'seed-acc-poupanca', institutionId: 'Banco Exemplo', type: 'poupanca', balanceInCents: 1_084_213 },
  { id: 'seed-cartao', externalId: 'seed-acc-cartao', institutionId: 'Banco Exemplo', type: 'cartao-de-credito', balanceInCents: -87_450 },
];

const LANCAMENTOS = [
  { id: 'seed-lanc-1', externalId: 'seed-tx-1', description: 'PAG*MERCADO CENTRAL', amountInCents: -21_850, dueDate: new Date('2026-01-15T14:30:00Z') },
  { id: 'seed-lanc-2', externalId: 'seed-tx-2', description: 'TRANSF RECEBIDA', amountInCents: 850_000, dueDate: new Date('2026-01-20T09:00:00Z') },
  { id: 'seed-lanc-3', externalId: 'seed-tx-3', description: 'UBER *TRIP', amountInCents: -3_490, dueDate: new Date('2026-02-05T18:12:00Z') },
  { id: 'seed-lanc-4', externalId: 'seed-tx-4', description: 'NETFLIX.COM', amountInCents: -5_590, dueDate: new Date('2026-02-10T03:00:00Z') },
  { id: 'seed-lanc-5', externalId: 'seed-tx-5', description: 'RENDIMENTO POUPANCA', amountInCents: 3_870, dueDate: new Date('2026-02-28T23:59:00Z') },
];

async function seed() {
  console.log('seed: inicio');

  // Account demo (the account IS the holder; no admin role exists in this PoC).
  const senhaHash = await hash(DEMO_SENHA, 10);
  await prisma.account.upsert({
    where: { id: HOLDER },
    create: { id: HOLDER, email: DEMO_EMAIL, passwordHash: senhaHash, name: 'Usuário Demo' },
    update: { email: DEMO_EMAIL, passwordHash: senhaHash, name: 'Usuário Demo' },
  });
  console.log(`seed: conta demo criada (${DEMO_EMAIL} / ${DEMO_SENHA})`);

  // Active consent with a ciphered synthetic aggregator credential (RNF-014).
  const agora = new Date();
  const expira = new Date(agora.getTime() + 90 * 24 * 60 * 60_000);
  await prisma.consent.upsert({
    where: { id: 'seed-consent' },
    create: {
      id: 'seed-consent',
      holderId: HOLDER,
      institutionId: 'Banco Exemplo',
      connectionId: 'conexao-1',
      scope: 'accounts-and-transactions',
      credentialCipher: cipherr('token-sintetico-seed'),
      createdAt: agora,
      expiresAt: expira,
      revokedAt: null,
      deletionScheduledAt: null,
      lastSyncAt: agora,
    },
    update: { lastSyncAt: agora },
  });
  console.log('seed: consentimento ativo criado (token cifrado)');

  // External accounts (RN-009: card is a bill, never summed into balance).
  for (const c of CONTAS) {
    await prisma.externalAccount.upsert({
      where: { id: c.id },
      create: { ...c, holderId: HOLDER },
      update: { balanceInCents: c.balanceInCents },
    });
  }
  console.log(`seed: ${CONTAS.length} contas externas criadas`);

  // Transactions with external id (RN-008: no duplicates on re-sync).
  for (const l of LANCAMENTOS) {
    await prisma.transaction.upsert({
      where: { id: l.id },
      create: { ...l, holderId: HOLDER, externalId: l.externalId },
      update: { amountInCents: l.amountInCents },
    });
  }
  console.log(`seed: ${LANCAMENTOS.length} lançamentos criados`);

  console.log('seed: concluído. Entre com demo@contacomigo.app / demo123.');
}

seed()
  .catch((erro) => {
    console.error('seed: falhou', erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });