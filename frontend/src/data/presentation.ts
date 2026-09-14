// Decisoes de APRESENTACAO que o inventario (HT-016) tirou do transporte: cor,
// icone, iniciais e ids legados da UI. Vivem na web, chaveadas pelo id estavel
// do contrato. Reproduzem fielmente o que os mocks exibem hoje — inclusive as
// inconsistencias (Banco Inter com a cor do Itau; icone de Alimentacao diferente
// entre lista e grafico), que HT-018 decide manter ou corrigir.

export interface CategoriaVisual {
  /** id que os componentes do grafico de gastos usam hoje (`cat_food`...). */
  idLegado: string;
  name: string;
  cor: string;
  iconeNoGrafico: string;
  iconeNaLista: string;
}

export const CATEGORIAS: Record<string, CategoriaVisual> = {
  alimentacao: { idLegado: 'cat_food', name: 'Alimentação', cor: '#36b37e', iconeNoGrafico: 'fa-utensils', iconeNaLista: 'fa-basket-shopping' },
  transporte: { idLegado: 'cat_trans', name: 'Transporte', cor: '#0a6d42', iconeNoGrafico: 'fa-car', iconeNaLista: 'fa-car' },
  moradia: { idLegado: 'cat_house', name: 'Moradia', cor: '#219b66', iconeNoGrafico: 'fa-house', iconeNaLista: 'fa-house' },
  saude: { idLegado: 'cat_health', name: 'Saúde', cor: '#001b42', iconeNoGrafico: 'fa-heart-pulse', iconeNaLista: 'fa-pills' },
  lazer: { idLegado: 'cat_entert', name: 'Lazer', cor: '#4ade80', iconeNoGrafico: 'fa-gamepad', iconeNaLista: 'fa-film' },
  outros: { idLegado: 'cat_other', name: 'Outros', cor: '#cbd5e1', iconeNoGrafico: 'fa-ellipsis', iconeNaLista: 'fa-ellipsis' },
  receita: { idLegado: 'cat_income', name: 'Receita', cor: '#16a34a', iconeNoGrafico: 'fa-arrow-trend-up', iconeNaLista: 'fa-arrow-trend-up' },
  investimentos: { idLegado: 'cat_invest', name: 'Investimentos', cor: '#2563eb', iconeNoGrafico: 'fa-chart-line', iconeNaLista: 'fa-chart-line' },
};

export interface BancoVisual {
  idLegado: string;
  name: string;
  cor: string;
  iniciais: string;
}

export const BANCOS: Record<string, BancoVisual> = {
  nubank: { idLegado: 'bank_nubank', name: 'Nubank', cor: '#8B5CF6', iniciais: 'NU' },
  itau: { idLegado: 'bank_itau', name: 'Itaú', cor: '#F97316', iniciais: 'IT' },
  bradesco: { idLegado: 'bank_bradesco', name: 'Bradesco', cor: '#EF4444', iniciais: 'BB' },
  inter: { idLegado: 'bank_inter', name: 'Banco Inter', cor: '#F97316', iniciais: 'BI' },
};

export const idDaCategoriaPeloNome = (name: string) =>
  Object.entries(CATEGORIAS).find(([, c]) => c.name === name)?.[0] ?? 'outros';

export const idDoBancoPeloNome = (name: string) =>
  Object.entries(BANCOS).find(([, b]) => b.name === name)?.[0] ?? name.toLowerCase();
