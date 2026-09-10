// db:seed — synthetic demo data for the PoC, focused ONLY on the demo account.
// Creates the demo account, an active consent, external accounts and several
// months of transactions and monthly budgets, so the semaphore, history,
// diagnosis and charts have real data to show. Uses only synthetic data (never
// real bank data). Run: pnpm --filter @contacomigo/backend db:seed
import { hash } from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/transactions/infrastructure/persistence/gerado/client';
import { cipherr } from '../../src/transactions/infrastructure/persistence/cipher';
import { limparDescricao } from '../../src/transactions/domain/model/readable-description';
import { categorizarPorRegra } from '../../src/transactions/domain/model/category';

const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? URL_PADRAO }) });

const DEMO_EMAIL = 'demo@contacomigo.com';
const DEMO_SENHA = 'demo123';
const HOLDER = 'demo-holder';

const CONTAS = [
  { id: 'seed-conta-corrente', externalId: 'seed-acc-corrente', institutionId: 'Banco Exemplo', type: 'corrente', balanceInCents: 241_832 },
  { id: 'seed-conta-poupanca', externalId: 'seed-acc-poupanca', institutionId: 'Banco Exemplo', type: 'poupanca', balanceInCents: 1_084_213 },
  { id: 'seed-cartao', externalId: 'seed-acc-cartao', institutionId: 'Banco Exemplo', type: 'cartao-de-credito', balanceInCents: -87_450 },
];

// Meses com dados: jan a ago/2026. O corrente é set/2026; os 6 meses fechados
// do histórico (RN-022) são mar..ago, então a janela inteira tem dados.
const MESES = [
  { month: '2026-01', dias: 31 },
  { month: '2026-02', dias: 28 },
  { month: '2026-03', dias: 31 },
  { month: '2026-04', dias: 30 },
  { month: '2026-05', dias: 31 },
  { month: '2026-06', dias: 30 },
  { month: '2026-07', dias: 31 },
  { month: '2026-08', dias: 31 },
];

// Limites mensais por categoria (RN-002). Todas as categorias do catálogo
// ganham limite em todos os meses gerados, para o semáforo e o histórico terem
// comparação e a tela de limites mostrar o perfil completo.
const LIMITES_MENSAIS: readonly { category: string; limitInCents: number }[] = [
  { category: 'alimentacao', limitInCents: 150_000 },
  { category: 'transporte', limitInCents: 80_000 },
  { category: 'moradia', limitInCents: 320_000 },
  { category: 'saude', limitInCents: 70_000 },
  { category: 'lazer', limitInCents: 60_000 },
  { category: 'outros', limitInCents: 100_000 },
  { category: 'receita', limitInCents: 900_000 },
  { category: 'investimentos', limitInCents: 150_000 },
];

// PRNG determinístico: o mesmo seed produz sempre a mesma massa (reprodutível).
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
function entre(min: number, max: number, seed: number): number {
  return Math.round(min + rand(seed) * (max - min));
}

// Template de lançamento por categoria. A descrição leva um termo que a regra
// de classificação (HN-005) reconhece — o rótulo final é derivado, não escrito
// à mão. `count` = nº de lançamentos; `range` = valor em centavos por item.
const GASTOS: readonly { category: string; desc: string; count: number; range: [number, number] }[] = [
  { category: 'alimentacao', desc: 'PAG*MERCADO CENTRAL', count: 4, range: [12_000, 38_000] },
  { category: 'alimentacao', desc: 'IFOOD.COM', count: 2, range: [4_000, 12_000] },
  { category: 'alimentacao', desc: 'RESTAURANTE BOM SABOR', count: 2, range: [5_000, 15_000] },
  { category: 'transporte', desc: 'UBER *TRIP', count: 3, range: [2_500, 5_500] },
  { category: 'transporte', desc: 'POSTO IPIRANGA', count: 2, range: [18_000, 28_000] },
  { category: 'moradia', desc: 'ALUGUEL', count: 1, range: [160_000, 160_000] },
  { category: 'moradia', desc: 'CONDOMINIO', count: 1, range: [45_000, 45_000] },
  { category: 'moradia', desc: 'ENEL ENERGIA', count: 1, range: [14_000, 22_000] },
  { category: 'moradia', desc: 'CLARO INTERNET', count: 1, range: [9_990, 9_990] },
  { category: 'saude', desc: 'FARMACIA SAO JOAO', count: 2, range: [4_500, 12_000] },
  { category: 'saude', desc: 'PLANO DE SAUDE', count: 1, range: [45_000, 45_000] },
  { category: 'lazer', desc: 'NETFLIX.COM', count: 1, range: [5_590, 5_590] },
  { category: 'lazer', desc: 'SPOTIFY AB', count: 1, range: [2_190, 2_190] },
  { category: 'lazer', desc: 'CINEMA UCI', count: 1, range: [4_000, 9_000] },
  { category: 'outros', desc: 'COMPRA AVULSA', count: 2, range: [3_000, 15_000] },
];

interface LancamentoGerado {
  id: string;
  externalId: string;
  description: string;
  amountInCents: number;
  dueDate: Date;
}

function gerarLancamentosDoMes(month: string, dias: number, idxMes: number): LancamentoGerado[] {
  const lancamentos: LancamentoGerado[] = [];

  // Receita do mês (salário) no dia 5.
  lancamentos.push({
    id: `seed-${month}-salario`,
    externalId: `seed-${month}-ext-salario`,
    description: 'SALARIO',
    amountInCents: 850_000,
    dueDate: new Date(`${month}-05T08:00:00Z`),
  });

  // Gasto fixo de moradia no início, gastos variáveis espalhados pelo mês.
  let seq = 0;
  for (const g of GASTOS) {
    for (let i = 0; i < g.count; i += 1) {
      const seed = idxMes * 10_000 + seq * 131 + i;
      const dia = 1 + Math.floor(rand(seed) * (dias - 1));
      const hora = 8 + Math.floor(rand(seed + 1) * 12);
      const valor = entre(g.range[0], g.range[1], seed + 2);
      lancamentos.push({
        id: `seed-${month}-${seq}`,
        externalId: `seed-${month}-ext-${seq}`,
        description: g.desc,
        amountInCents: -valor,
        dueDate: new Date(`${month}-${String(dia).padStart(2, '0')}T${String(hora).padStart(2, '0')}:${String(Math.floor(rand(seed + 3) * 60)).padStart(2, '0')}:00Z`),
      });
      seq += 1;
    }
  }

  // Uma transferência recebida esporádica (nem todo mês), para variar a receita.
  if (idxMes % 2 === 0) {
    lancamentos.push({
      id: `seed-${month}-pix`,
      externalId: `seed-${month}-ext-pix`,
      description: 'PIX RECEBIDO',
      amountInCents: 40_000,
      dueDate: new Date(`${month}-18T12:00:00Z`),
    });
  }

  // Rendimento da poupança no último dia (investimentos).
  lancamentos.push({
    id: `seed-${month}-rendimento`,
    externalId: `seed-${month}-ext-rendimento`,
    description: 'RENDIMENTO POUPANCA',
    amountInCents: 3_870,
    dueDate: new Date(`${month}-${String(dias).padStart(2, '0')}T23:59:00Z`),
  });

  return lancamentos;
}

async function seed() {
  console.log('seed: inicio');

  // Conta demo (a conta É o titular; não existe papel de admin nesta PoC).
  const senhaHash = await hash(DEMO_SENHA, 10);
  await prisma.account.upsert({
    where: { id: HOLDER },
    create: { id: HOLDER, email: DEMO_EMAIL, passwordHash: senhaHash, name: 'Usuário Demo' },
    update: { email: DEMO_EMAIL, passwordHash: senhaHash, name: 'Usuário Demo' },
  });
  console.log(`seed: conta demo criada (${DEMO_EMAIL} / ${DEMO_SENHA})`);

  // Consentimento ativo com credencial sintética cifrada (RNF-014).
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

  // Contas externas (RN-009: cartão é fatura, nunca somado ao saldo).
  for (const c of CONTAS) {
    await prisma.externalAccount.upsert({
      where: { id: c.id },
      create: { ...c, holderId: HOLDER },
      update: { balanceInCents: c.balanceInCents },
    });
  }
  console.log(`seed: ${CONTAS.length} contas externas criadas`);

  // Reset das transações e orçamentos antigos do demo (seed determinístico).
  await prisma.transaction.deleteMany({ where: { holderId: HOLDER } });
  await prisma.monthlyBudget.deleteMany({ where: { holderId: HOLDER } });
  await prisma.budgetAlert.deleteMany({ where: { holderId: HOLDER } });

  // Lançamentos por mês. Descrição legível e categoria vêm das MESMAS regras
  // determinísticas que a sincronização usa (HN-004/HN-005): o demo mostra o
  // comportamento real, não rótulo escrito à mão.
  let totalLancamentos = 0;
  for (let i = 0; i < MESES.length; i += 1) {
    const { month, dias } = MESES[i];
    const lancamentos = gerarLancamentosDoMes(month, dias, i);
    for (const l of lancamentos) {
      const readableDescription = limparDescricao(l.description);
      const category = categorizarPorRegra(readableDescription, l.amountInCents);
      const categoryOrigin = category === null ? null : 'automatica';
      await prisma.transaction.create({
        data: { ...l, readableDescription, category, categoryOrigin, holderId: HOLDER },
      });
    }
    totalLancamentos += lancamentos.length;
    console.log(`seed: ${month} -> ${lancamentos.length} lançamentos`);
  }

  // Limites mensais por categoria (RN-002) em todos os meses gerados.
  for (const { month } of MESES) {
    for (const limite of LIMITES_MENSAIS) {
      await prisma.monthlyBudget.upsert({
        where: { holderId_month_category: { holderId: HOLDER, month, category: limite.category } },
        create: { holderId: HOLDER, month, category: limite.category, limitInCents: limite.limitInCents },
        update: { limitInCents: limite.limitInCents },
      });
    }
  }
  console.log(`seed: ${MESES.length * LIMITES_MENSAIS.length} limites mensais criados`);

  console.log(`seed: concluído (${totalLancamentos} lançamentos, ${MESES.length} meses). Entre com ${DEMO_EMAIL} / ${DEMO_SENHA}.`);
}

seed()
  .catch((erro) => {
    console.error('seed: falhou', erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });