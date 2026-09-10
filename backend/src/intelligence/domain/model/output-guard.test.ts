import { describe, expect, it } from 'vitest';
import { examinarSaida, valoresMonetariosDe, valoresPermitidos } from './output-guard';

const dados = { totalEmCentavos: 128_432, categorias: { mercado: 40_000 } };

describe('valoresMonetariosDe — RN-019', () => {
  it('reconhece o valor em qualquer formato usado por um modelo', () => {
    expect(valoresMonetariosDe('gastou R$ 1.284,32 no mes')).toEqual([128_432]);
    expect(valoresMonetariosDe('gastou R$ 1284,32')).toEqual([128_432]);
    expect(valoresMonetariosDe('gastou 1284.32 reais')).toEqual([128_432]);
    expect(valoresMonetariosDe('R$ 400,00 em mercado')).toEqual([40_000]);
  });

  it('nao trata contagem, mes nem porcentagem como dinheiro', () => {
    expect(valoresMonetariosDe('voce tem 3 contas conectadas')).toEqual([]);
    expect(valoresMonetariosDe('em janeiro de 2026')).toEqual([]);
    expect(valoresMonetariosDe('40% do total foi mercado')).toEqual([]);
  });

  it('ignora formato monetario com caracteres invalidos', () => {
    expect(valoresMonetariosDe('R$ abc')).toEqual([]);
    expect(valoresMonetariosDe('R$ ...')).toEqual([]);
  });
});

describe('valoresPermitidos', () => {
  it('ignora dados nulos e tipos primitivos nao numericos', () => {
    expect(Array.from(valoresPermitidos(null))).toEqual([]);
    expect(Array.from(valoresPermitidos('texto'))).toEqual([]);
    expect(Array.from(valoresPermitidos(undefined))).toEqual([]);
  });

  it('coleta numeros em arrays e objetos aninhados', () => {
    const nums = valoresPermitidos([100, { valor: 50.5 }]);
    expect(nums.has(100)).toBe(true);
    expect(nums.has(10000)).toBe(true);
    expect(nums.has(51)).toBe(true);
    expect(nums.has(5050)).toBe(true);
  });
});

describe('examinarSaida — RNF-017', () => {
  it('aprova texto coerente com os dados', () => {
    const veredito = examinarSaida('Voce gastou R$ 1.284,32 no mes, com destaque para mercado.', dados);

    expect(veredito.aprovado).toBe(true);
  });

  it('RN-019 — bloqueia valor que o painel nao tem', () => {
    const veredito = examinarSaida('Voce gastou cerca de R$ 1.300,00 neste mes.', dados);

    expect(veredito.aprovado).toBe(false);
    expect(veredito.aprovado === false && veredito.motivo).toBe('valor-divergente');
    // O motivo carrega amostra curta para diagnostico, nunca o texto inteiro.
    expect(veredito.aprovado === false && veredito.amostra.length).toBeLessThanOrEqual(80);
  });

  it('RN-019 — texto sem numero nenhum passa: a guarda nao exige numero', () => {
    expect(examinarSaida('Seu mes seguiu o padrao dos anteriores.', dados).aprovado).toBe(true);
  });

  it('RN-019 — porcentagem e contagem nao bloqueiam', () => {
    expect(examinarSaida('Mercado representou 31% do total, em 2 categorias.', dados).aprovado).toBe(true);
  });

  it('RN-017 — bloqueia recomendacao de produto financeiro', () => {
    const proibidos = [
      'Invista em CDB para render mais.',
      'Considere o Tesouro Direto.',
      'Vale a pena pedir um empréstimo pessoal.',
      'O cartão de crédito do Banco Exemplo tem cashback.',
      'sugiro aplicar em ações',
      'CONTRATE UM FINANCIAMENTO',
      'abra uma conta em uma corretora',
    ];

    for (const texto of proibidos) {
      const veredito = examinarSaida(texto, dados);
      expect(veredito.aprovado, texto).toBe(false);
      expect(veredito.aprovado === false && veredito.motivo).toBe('recomendacao-de-produto');
    }
  });

  it('RN-017 — palavras legitimas contendo sufixos de produto nao bloqueiam (ex: movimentacoes)', () => {
    const veredito = examinarSaida('Suas movimentações de mercado foram normais.', dados);
    expect(veredito.aprovado).toBe(true);
  });

  it('RN-017 — falar de habito nao e recomendar produto', () => {
    const permitidos = [
      'Voce pode poupar reduzindo gasto com delivery.',
      'Compare seus gastos com os meses anteriores.',
      'Anotar as despesas ajuda a perceber padroes.',
    ];

    for (const texto of permitidos) {
      expect(examinarSaida(texto, dados).aprovado, texto).toBe(true);
    }
  });

  it('RN-017 — explicar o produto perguntado é permitido; recomendar bloqueia', () => {
    // Perguntou sobre consórcio → a explicação educativa passa (não é recomendação).
    const explicacao = examinarSaida(
      'O consórcio é uma compra coletiva: um grupo contribui mensalmente e, a cada contemplado, recebe a carta de crédito.',
      dados,
      'como funciona um consorcio?',
    );
    expect(explicacao.aprovado).toBe(true);

    // Mas recomendar consórcio, mesmo na pergunta sobre ele, bloqueia (verbo).
    const recomendacao = examinarSaida(
      'Vale a pena contratar um consórcio para o seu caso.',
      dados,
      'como funciona um consorcio?',
    );
    expect(recomendacao.aprovado === false && recomendacao.motivo).toBe('recomendacao-de-produto');

    // Produto não solicitado na resposta bloqueia, mesmo sem verbo.
    const naoPedido = examinarSaida('O CDB do Banco X paga 110% do CDI.', dados, 'onde estou gastando mais?');
    expect(naoPedido.aprovado === false && naoPedido.motivo).toBe('recomendacao-de-produto');
  });

  it('RN-017 — perguntar a preferência do usuário (financiar/consórcio/à vista) é permitido', () => {
    // Elicitação educativa: pergunta delegando a escolha ao usuário, sem sugerir via.
    const elicita = examinarSaida(
      'Pretende financiar, usar consórcio ou pagar à vista?',
      dados,
      'quero comprar uma casa de 350 mil',
    );
    expect(elicita.aprovado).toBe(true);

    // Interrogativa com verbo de recomendação continua bloqueada.
    const sugestiva = examinarSaida(
      'Vale a pena contratar um financiamento para a casa?',
      dados,
      'quero comprar uma casa de 350 mil',
    );
    expect(sugestiva.aprovado === false && sugestiva.motivo).toBe('recomendacao-de-produto');
  });

  it('RNF-017 — bloqueia resposta vazia, gigante ou com bloco de codigo', () => {
    const vazia = examinarSaida('   ', dados);
    const gigante = examinarSaida('a'.repeat(4_001), dados);
    const comCodigo = examinarSaida('Segue o script:\n```js\nfetch("http://x")\n```', dados);

    expect(vazia.aprovado === false && vazia.motivo).toBe('formato-invalido');
    expect(gigante.aprovado === false && gigante.motivo).toBe('formato-invalido');
    expect(comCodigo.aprovado === false && comCodigo.motivo).toBe('formato-invalido');
  });

  it('RNF-017 — o exame de formato vem antes: texto vazio nao e avaliado por valor', () => {
    const veredito = examinarSaida('', {});

    expect(veredito.aprovado === false && veredito.motivo).toBe('formato-invalido');
  });

  it('valor presente em dado aninhado tambem e aceito', () => {
    const veredito = examinarSaida('Mercado somou R$ 400,00.', dados);

    expect(veredito.aprovado).toBe(true);
  });

  it('aceita array de valores diretamente na raiz dos dados', () => {
    const veredito = examinarSaida('Gastou R$ 100,00.', [10000]);
    expect(veredito.aprovado).toBe(true);
  });
});
