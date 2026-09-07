import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { LancamentosModule } from '../../../lancamentos/lancamentos.module';
import { AgregacaoModule } from '../../agregacao.module';
import { TOKENS } from '../../../lancamentos/domain/port/saida/tokens';
import { TOKENS_AGREGACAO } from '../../domain/port/saida/tokens';
import { RelogioFixo } from '../../../lancamentos/infrastructure/relogio/relogio-fixo';
import { RepositorioDeLancamentosEmMemoria } from '../../../lancamentos/infrastructure/persistence/repositorio-em-memoria';
import { titularId } from '../../../lancamentos/domain/model/titular';
import { EmissorJwt } from '../../../acesso/infrastructure/cripto/emissor-jwt';
import { falha } from '../../domain/model/resultado-da-agregacao';
import type { AgregadorOpenFinance } from '../../domain/port/saida/agregador-open-finance';

// RNF-005 — falha de integração externa degrada, não derruba.
//
// O painel numérico vive do que já está no banco. Se a indisponibilidade do
// agregador o esvaziasse, a pessoa perderia acesso ao próprio histórico por
// causa de um provedor de terceiro — exatamente o que o requisito proíbe.
const TITULAR = titularId('titular-a');

/** Agregador completamente fora: toda chamada falha. */
const agregadorFora: AgregadorOpenFinance = {
  async listarContas() {
    return falha('indisponivel', 'provedor fora do ar');
  },
  async listarLancamentos() {
    return falha('indisponivel', 'provedor fora do ar');
  },
};

describe('RNF-005 — o painel sobrevive ao provedor fora', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [LancamentosModule, AgregacaoModule] })
      .overrideProvider(TOKENS_AGREGACAO.AgregadorOpenFinance)
      .useValue(agregadorFora)
      .overrideProvider(TOKENS.Relogio)
      .useValue(new RelogioFixo(new Date('2026-01-15T12:00:00Z')))
      .overrideProvider(TOKENS.RepositorioDeLancamentos)
      .useValue(
        new RepositorioDeLancamentosEmMemoria([
          { id: 'ja-no-banco-1', titularId: TITULAR, descricao: 'mercado', valorEmCentavos: 12_000, dataDeCompetencia: new Date('2026-01-10T12:00:00Z') },
          { id: 'ja-no-banco-2', titularId: TITULAR, descricao: 'farmacia', valorEmCentavos: 3_000, dataDeCompetencia: new Date('2026-01-12T12:00:00Z') },
        ]),
      )
      .compile();

    app = modulo.createNestApplication({ logger: false });
    await app.listen(0);
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  const autorizado = () => ({ authorization: `Bearer ${new EmissorJwt().emitir(TITULAR).valor}` });

  it('a consulta de lançamentos responde normalmente', async () => {
    const resposta = await fetch(url + '/lancamentos', { headers: autorizado() });

    expect(resposta.status).toBe(200);
    const corpo = await resposta.json();
    expect(corpo.estado).toBe('ok');
    expect(corpo.dados.map((l: { id: string }) => l.id).sort()).toEqual(['ja-no-banco-1', 'ja-no-banco-2']);
  });

  it('o resumo do mês continua somando o que já está no banco', async () => {
    const resposta = await fetch(url + '/lancamentos/resumo-do-mes', { headers: autorizado() });

    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({ mes: { ano: 2026, mes: 1 }, quantidade: 2, totalEmCentavos: 15_000 });
  });

  it('o agregador realmente está fora — o teste não passa por acidente', async () => {
    const resultado = await agregadorFora.listarContas('qualquer');
    expect(resultado.tipo).toBe('falha');
  });
});
