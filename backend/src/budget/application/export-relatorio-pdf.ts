import PDFDocument from 'pdfkit';
import { mesDeReferencia } from '../../transactions/domain/reference-month';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { HolderId } from '../../transactions/domain/model/holder';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import { categoriasDoMes } from './por-categoria-do-mes';

const MESES_NO_RELATORIO = 6;

const MARGEM = 50;
const LARGURA_UTIL = 595.28 - MARGEM * 2; // A4 em pontos

// Paleta do produto (TODAY's brand): verde principal e verde escuro.
const VERDE = '#36b37e';
const VERDE_ESCURO = '#0a6d42';
const AZUL_ESCURO = '#001b42';
const CINZA = '#64748b';
const BRANCO = '#ffffff';

const NOME_DO_MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// Apresentação do documento: nome legível da categoria (a UI usa o mesmo mapa).
const NOME_DA_CATEGORIA: Record<string, string> = {
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  moradia: 'Moradia',
  saude: 'Saúde',
  lazer: 'Lazer',
  receita: 'Receita',
  investimentos: 'Investimentos',
  outros: 'Outros',
};

function real(centavos: number): string {
  return `R$ ${(centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function nomeDoMes(month: string): string {
  const [ano, mes] = month.split('-').map(Number);
  const nome = NOME_DO_MES[mes - 1] ?? month;
  return `${nome[0].toUpperCase()}${nome.slice(1)} de ${ano}`;
}

const COR_DA_FAIXA: Record<string, string> = {
  verde: '#16a34a',
  amarela: '#d97706',
  vermelha: '#dc2626',
  'sem-limite': CINZA,
};

function rotuloDaFaixa(band: string): string {
  switch (band) {
    case 'verde':
      return 'Dentro do limite';
    case 'amarela':
      return 'Atenção';
    case 'vermelha':
      return 'Estourado';
    default:
      return 'Sem limite';
  }
}

// RF-023: relatório do histórico em PDF com os MESMOS números do painel
// (RN-019). Os valores vêm do consolidado; nenhum é citado pelo modelo.
export class ExportarRelatorioPDF {
  constructor(
    private readonly repo: BudgetRepository,
    private readonly transactions: RepositorioDeTransactions,
    private readonly clock: Clock,
  ) {}

  async executar(holderId: string, month?: string): Promise<Buffer> {
    const corrente = mesDeReferencia(this.clock.agora());
    const transacoes = await this.transactions.listarDoHolder(holderId as HolderId);

    const meses: Array<{
      month: string;
      categorias: Array<{ category: string; spentInCents: number; limitInCents: number | null; band: string }>;
    }> = [];
    const alvos = month ? [month] : Array.from({ length: MESES_NO_RELATORIO }, (_, i) => {
      const d = new Date(Date.UTC(corrente.ano, corrente.mes - 1 - 1 - i, 1));
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    });
    for (const alvo of alvos) {
      const monthAtual = alvo;
      const limites = await this.repo.listarDoMes(holderId, monthAtual);
      const categorias = await categoriasDoMes(limites, transacoes, monthAtual);
      if (categorias.length === 0) continue;
      meses.push({
        month: monthAtual,
        categorias: categorias.map((c) => ({
          category: c.category,
          spentInCents: c.spentInCents,
          limitInCents: c.limitInCents,
          band: c.band,
        })),
      });
    }

    const doc = new PDFDocument({ size: 'A4', margin: MARGEM });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const pronto = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Rodapé em todas as páginas.
    doc.on('pageAdded', () => escreverRodape(doc));

    escreverCabecalho(doc, this.clock.agora());

    for (const m of meses) {
      doc.moveDown(0.6);
      escreverSecaoMes(doc, m);
    }

    escreverRodape(doc);
    doc.end();

    return pronto;
  }
}

function escreverCabecalho(doc: PDFKit.PDFDocument, agora: Date): void {
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(VERDE_ESCURO)
    .text('ContaComigo', { align: 'center' });

  doc
    .fontSize(13)
    .fillColor(AZUL_ESCURO)
    .text('Relatório de Orçamento', { align: 'center' });

  const data = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(agora);
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(CINZA)
    .text(`Gerado em ${data} · Dados consolidados via Open Finance`, { align: 'center' });

  doc.moveDown(0.4);
  doc
    .moveTo(MARGEM, doc.y)
    .lineTo(MARGEM + LARGURA_UTIL, doc.y)
    .lineWidth(1.2)
    .strokeColor(VERDE)
    .stroke();
  doc.moveDown(0.6);
}

function escreverSecaoMes(
  doc: PDFKit.PDFDocument,
  mes: { month: string; categorias: Array<{ category: string; spentInCents: number; limitInCents: number | null; band: string }> },
): void {
  // Título do mês.
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(AZUL_ESCURO)
    .text(nomeDoMes(mes.month));

  const colunas = [
    { label: 'Categoria', width: LARGURA_UTIL * 0.42 },
    { label: 'Gasto', width: LARGURA_UTIL * 0.19 },
    { label: 'Limite', width: LARGURA_UTIL * 0.19 },
    { label: 'Faixa', width: LARGURA_UTIL * 0.2 },
  ];

  const linhas = mes.categorias.map((c) => [
    NOME_DA_CATEGORIA[c.category] ?? c.category,
    real(c.spentInCents),
    c.limitInCents === null ? 'sem limite' : real(c.limitInCents),
    rotuloDaFaixa(c.band),
  ]);

  const larguraTabela = colunas.reduce((s, c) => s + c.width, 0);
  const alturaLinha = 18;
  const inicioX = MARGEM + (LARGURA_UTIL - larguraTabela) / 2;

  // Cabeçalho da tabela.
  let y = doc.y + 4;
  doc.rect(inicioX, y, larguraTabela, alturaLinha).fill(VERDE);
  let x = inicioX;
  colunas.forEach((col, i) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(BRANCO)
      .text(col.label, x + 6, y + 6, { width: col.width - 12 });
    x += col.width;
  });
  y += alturaLinha;

  // Linhas da tabela (fundo alternado).
  linhas.forEach((celulas, i) => {
    doc.rect(inicioX, y, larguraTabela, alturaLinha).fill(i % 2 === 0 ? '#f8fafc' : BRANCO);
    x = inicioX;
    celulas.forEach((valor, col) => {
      const cor = col === 3 ? COR_DA_FAIXA[mes.categorias[i].band] ?? CINZA : CINZA;
      doc
        .font(col === 0 ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(9)
        .fillColor(cor)
        .text(valor, x + 6, y + 6, { width: colunas[col].width - 12 });
      x += colunas[col].width;
    });
    y += alturaLinha;
  });

  // Linha de fechamento da tabela.
  doc.moveTo(inicioX, y).lineTo(inicioX + larguraTabela, y).lineWidth(0.6).strokeColor('#e2e8f0').stroke();
  doc.y = y;
}

function escreverRodape(doc: PDFKit.PDFDocument): void {
  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor(CINZA)
    .text('ContaComigo — seus números, sempre seus.', MARGEM, 595.28 - 40, { align: 'left' });
}