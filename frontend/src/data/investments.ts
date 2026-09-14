import { ApiSource } from './api-source';

export type AssetClass = 'renda-fixa' | 'acoes' | 'fiis' | 'poupanca' | 'tesouro';

export interface InvestmentAsset {
  id: string;
  name: string;
  code: string;
  category: AssetClass;
  institution: string;
  investedAmountInCents: number;
  currentAmountInCents: number;
  profitabilityPercent: number;
  benchmark: string;
  sharePercent: number;
}

export interface EarningsRecord {
  id: string;
  assetName: string;
  type: 'Rendimento' | 'Dividendo' | 'JCP';
  amountInCents: number;
  paidAt: string;
}

export interface AssetAllocation {
  category: AssetClass;
  label: string;
  color: string;
  totalInCents: number;
  percentage: number;
}

export interface PortfolioSummary {
  totalInvestedInCents: number;
  monthlyEarningsInCents: number;
  totalProfitabilityPercent: number;
  benchmarkRate: string;
  portfolioVsBenchmarkPercent: number;
}

export interface InvestmentsData {
  summary: PortfolioSummary;
  allocations: AssetAllocation[];
  assets: InvestmentAsset[];
  earnings: EarningsRecord[];
}

const BASE_ASSETS: Omit<InvestmentAsset, 'sharePercent'>[] = [
  {
    id: 'asset-1',
    name: 'Tesouro Selic 2029',
    code: 'LFT 2029',
    category: 'tesouro',
    institution: 'Tesouro Direto',
    investedAmountInCents: 1_250_000,
    currentAmountInCents: 1_348_500,
    profitabilityPercent: 7.88,
    benchmark: '100% Selic',
  },
  {
    id: 'asset-2',
    name: 'Tesouro IPCA+ 2035',
    code: 'NTN-B 2035',
    category: 'tesouro',
    institution: 'Tesouro Direto',
    investedAmountInCents: 800_000,
    currentAmountInCents: 874_400,
    profitabilityPercent: 9.3,
    benchmark: 'IPCA + 6,15%',
  },
  {
    id: 'asset-3',
    name: 'CDB Banco Inter 110% CDI',
    code: 'CDB POS 110',
    category: 'renda-fixa',
    institution: 'Banco Inter',
    investedAmountInCents: 1_500_000,
    currentAmountInCents: 1_627_500,
    profitabilityPercent: 8.5,
    benchmark: '110% CDI',
  },
  {
    id: 'asset-4',
    name: 'Poupança Banco Exemplo',
    code: 'POUPANCA',
    category: 'poupanca',
    institution: 'Banco Exemplo',
    investedAmountInCents: 1_000_000,
    currentAmountInCents: 1_084_213,
    profitabilityPercent: 8.42,
    benchmark: 'TR + 0,5% a.m.',
  },
  {
    id: 'asset-5',
    name: 'CSHG Logística FII',
    code: 'HGLG11',
    category: 'fiis',
    institution: 'BTG Pactual',
    investedAmountInCents: 650_000,
    currentAmountInCents: 698_750,
    profitabilityPercent: 7.5,
    benchmark: 'IFIX + 1,8%',
  },
  {
    id: 'asset-6',
    name: 'Maxi Renda FII',
    code: 'MXRF11',
    category: 'fiis',
    institution: 'XP Investimentos',
    investedAmountInCents: 450_000,
    currentAmountInCents: 472_500,
    profitabilityPercent: 5.0,
    benchmark: 'IFIX + 0,9%',
  },
  {
    id: 'asset-7',
    name: 'iShares Ibovespa ETF',
    code: 'BOVA11',
    category: 'acoes',
    institution: 'NuInvest',
    investedAmountInCents: 750_000,
    currentAmountInCents: 828_000,
    profitabilityPercent: 10.4,
    benchmark: '100% IBOV',
  },
  {
    id: 'asset-8',
    name: 'WEG S.A. ON',
    code: 'WEGE3',
    category: 'acoes',
    institution: 'NuInvest',
    investedAmountInCents: 420_000,
    currentAmountInCents: 483_000,
    profitabilityPercent: 15.0,
    benchmark: 'IBOV + 4,6%',
  },
];

const DEFAULT_EARNINGS: EarningsRecord[] = [
  { id: 'earn-1', assetName: 'Maxi Renda FII (MXRF11)', type: 'Rendimento', amountInCents: 4_250, paidAt: '2026-08-15' },
  { id: 'earn-2', assetName: 'CSHG Logística FII (HGLG11)', type: 'Rendimento', amountInCents: 5_800, paidAt: '2026-08-14' },
  { id: 'earn-3', assetName: 'Poupança Banco Exemplo', type: 'Rendimento', amountInCents: 3_870, paidAt: '2026-08-31' },
  { id: 'earn-4', assetName: 'WEG S.A. (WEGE3)', type: 'Dividendo', amountInCents: 2_940, paidAt: '2026-08-18' },
  { id: 'earn-5', assetName: 'CDB Banco Inter', type: 'JCP', amountInCents: 11_420, paidAt: '2026-07-31' },
  { id: 'earn-6', assetName: 'Poupança Banco Exemplo', type: 'Rendimento', amountInCents: 3_870, paidAt: '2026-07-31' },
];

const CATEGORY_COLORS: Record<AssetClass, { label: string; color: string }> = {
  'tesouro': { label: 'Tesouro Direto', color: '#0ea5e9' },
  'renda-fixa': { label: 'Renda Fixa / CDB', color: '#36b37e' },
  'poupanca': { label: 'Poupança', color: '#10b981' },
  'fiis': { label: 'Fundos Imobiliários (FIIs)', color: '#8b5cf6' },
  'acoes': { label: 'Ações Brasil', color: '#f59e0b' },
};

export async function getInvestmentsData(): Promise<InvestmentsData> {
  const api = new ApiSource();
  let earningsFromApi: EarningsRecord[] = [];

  try {
    const transactionsResult = await api.listarTransactions();
    if (transactionsResult.estado === 'ok') {
      const rendimentos = transactionsResult.dados
        .filter((t) => t.category?.id === 'investimentos' && t.amountInCents > 0)
        .map((t) => ({
          id: t.id,
          assetName: t.description || 'Rendimento de Aplicação',
          type: 'Rendimento' as const,
          amountInCents: t.amountInCents,
          paidAt: t.dueDate.slice(0, 10),
        }));

      if (rendimentos.length > 0) {
        earningsFromApi = rendimentos;
      }
    }
  } catch {
    // Graceful fallback to default demo data if API call fails
  }

  const earnings = earningsFromApi.length > 0 ? earningsFromApi : DEFAULT_EARNINGS;

  const totalCurrentInCents = BASE_ASSETS.reduce((acc, a) => acc + a.currentAmountInCents, 0);
  const totalInvestedInCents = BASE_ASSETS.reduce((acc, a) => acc + a.investedAmountInCents, 0);

  const assets: InvestmentAsset[] = BASE_ASSETS.map((asset) => ({
    ...asset,
    sharePercent: Math.round((asset.currentAmountInCents / totalCurrentInCents) * 1000) / 10,
  }));

  // Allocations by class
  const classMap = new Map<AssetClass, number>();
  for (const asset of assets) {
    classMap.set(asset.category, (classMap.get(asset.category) ?? 0) + asset.currentAmountInCents);
  }

  const allocations: AssetAllocation[] = Array.from(classMap.entries()).map(([category, totalInCents]) => ({
    category,
    label: CATEGORY_COLORS[category].label,
    color: CATEGORY_COLORS[category].color,
    totalInCents,
    percentage: Math.round((totalInCents / totalCurrentInCents) * 1000) / 10,
  }));

  allocations.sort((a, b) => b.totalInCents - a.totalInCents);

  const totalProfitPercent = Math.round(((totalCurrentInCents - totalInvestedInCents) / totalInvestedInCents) * 1000) / 10;
  const recentMonthEarnings = earnings.slice(0, 4).reduce((sum, e) => sum + e.amountInCents, 0);

  const summary: PortfolioSummary = {
    totalInvestedInCents: totalCurrentInCents,
    monthlyEarningsInCents: recentMonthEarnings,
    totalProfitabilityPercent: totalProfitPercent,
    benchmarkRate: '100% CDI (10,40% a.a.)',
    portfolioVsBenchmarkPercent: 1.8,
  };

  return {
    summary,
    allocations,
    assets,
    earnings,
  };
}
