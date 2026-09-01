/**
 * @file mocks/index.ts
 * @description Barrel central para TODOS os dados mockados do app.
 * Estrutura: um arquivo .mock.ts por domínio nesta mesma pasta.
 *
 * Para componentes:
 *   import { mockBudgetCategories, generateMockReply } from '../../mocks';
 *
 * Quando o backend real chegar, substitua cada export abaixo por um hook
 * (ex: export * from '../hooks/useBudget') — os imports nos componentes
 * continuarão funcionando sem alteração.
 */

export * from './user.mock';
export * from './metrics.mock';
export * from './ai-insights.mock';
export * from './spending-categories.mock';
export * from './transactions.mock';
export * from './connected-banks.mock';
export * from './budget.mock';
export * from './chat.mock';
