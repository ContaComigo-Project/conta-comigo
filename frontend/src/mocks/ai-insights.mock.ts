export interface AIInsight {
  id: string;
  type: 'opportunity' | 'alert' | 'goal';
  title: string;
  body: string;
  ctaLabel?: string;
  ctaRoute?: string;
  confidence: number;
  generatedAt: Date;
}

export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight_001',
    type: 'opportunity',
    title: 'Oportunidade de rendimento identificada',
    body: 'Identifiquei R$ 450,00 parados na conta corrente do Nubank que poderiam render aproximadamente R$ 38,70/mês no CDB do Banco Inter com liquidez diária. Além disso, suas metas de economia estão 12% mais próximas este mês!',
    ctaLabel: 'Ver simulação',
    ctaRoute: '/dashboard/investimentos',
    confidence: 94,
    generatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'insight_002',
    type: 'alert',
    title: 'Padrão de gasto incomum',
    body: 'Seus gastos com alimentação aumentaram 28% em relação à média dos últimos 3 meses. Você gastou R$ 1.240,00 nesta categoria em junho. Deseja revisar seu orçamento?',
    ctaLabel: 'Analisar categoria',
    ctaRoute: '/dashboard/expenses',
    confidence: 89,
    generatedAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: 'insight_003',
    type: 'goal',
    title: 'Meta de economia a caminho',
    body: 'Com o ritmo atual de poupança de R$ 680,00/mês, você atingirá a meta de "Viagem de fim de ano - R$ 5.000,00" em aproximadamente 4 meses. Para acelerar, sugerimos reduzir R$ 120,00/mês na categoria Lazer, que atualmente está no verde com margem de 38%.',
    ctaLabel: 'Ajustar meta',
    ctaRoute: '/dashboard/metas',
    confidence: 91,
    generatedAt: new Date(Date.now() - 1000 * 60 * 150),
  },
];
