import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { LancamentosModule } from '../../lancamentos.module';
import { TOKENS } from '../../domain/port/saida/tokens';
import { RelogioFixo } from '../relogio/relogio-fixo';
import { RepositorioDeLancamentosEmMemoria } from '../persistence/repositorio-em-memoria';
import { titularId } from '../../domain/model/titular';

// RNF-013 e RN-015 — os tres casos negativos que a skill open-finance-security
// exige de TODA rota que devolve dado de pessoa. Sem eles, o gate reprova.
//
// O repositorio em memoria carrega dado dos dois titulares de proposito: e assim
// que um filtro ausente aparece — a rota devolveria o dado alheio junto.
const A = titularId('titular-a');
const B = titularId('titular-b');

const lancamento = (id: string, dono: typeof A, descricao: string) => ({
  id,
  titularId: dono,
  descricao,
  valorEmCentavos: 10_00,
  dataDeCompetencia: new Date('2026-01-10T12:00:00Z'),
});

describe('RNF-013 / RN-015 — GET /lancamentos so devolve dado do proprio titular', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [LancamentosModule] })
      .overrideProvider(TOKENS.Relogio)
      .useValue(new RelogioFixo(new Date('2026-01-15T12:00:00Z')))
      .overrideProvider(TOKENS.RepositorioDeLancamentos)
      .useValue(
        new RepositorioDeLancamentosEmMemoria([
          lancamento('de-a-1', A, 'mercado do A'),
          lancamento('de-a-2', A, 'farmacia do A'),
          lancamento('de-b-1', B, 'restaurante do B'),
        ]),
      )
      .compile();

    app = modulo.createNestApplication({ logger: false });
    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  const pedir = (cabecalhos: Record<string, string> = {}) =>
    fetch(baseUrl + '/lancamentos', { headers: cabecalhos });

  it('sem credencial: recusa a autenticacao e nao devolve conteudo', async () => {
    const resposta = await pedir();
    expect(resposta.status).toBe(401);
    expect(await resposta.text()).not.toContain('mercado do A');
  });

  it('credencial vazia tambem e ausencia de credencial', async () => {
    expect((await pedir({ 'x-titular-id': '   ' })).status).toBe(401);
  });

  it('titular B recebe apenas o proprio lancamento — nada do titular A', async () => {
    const resposta = await pedir({ 'x-titular-id': B });
    expect(resposta.status).toBe(200);
    const corpo = await resposta.json();
    expect(corpo.estado).toBe('ok');
    expect(corpo.dados.map((l: { id: string }) => l.id)).toEqual(['de-b-1']);
    expect(JSON.stringify(corpo)).not.toContain('do A');
  });

  it('titular A recebe os dois lancamentos dele', async () => {
    const corpo = await (await pedir({ 'x-titular-id': A })).json();
    expect(corpo.dados.map((l: { id: string }) => l.id).sort()).toEqual(['de-a-1', 'de-a-2']);
  });

  it('o resumo do mes tambem respeita o titular', async () => {
    const resposta = await fetch(baseUrl + '/lancamentos/resumo-do-mes', { headers: { 'x-titular-id': B } });
    expect((await resposta.json()).quantidade).toBe(1);
  });

  it('o titular NAO vem da requisicao: parametro de query e ignorado', async () => {
    // Se `?titularId=` funcionasse, seria o vetor de ataque que a skill proibe.
    const resposta = await fetch(baseUrl + '/lancamentos?titularId=' + A, { headers: { 'x-titular-id': B } });
    const corpo = await resposta.json();
    expect(corpo.dados.map((l: { id: string }) => l.id)).toEqual(['de-b-1']);
  });

  it('o contrato nao expoe o titular: titularId nao viaja no DTO', async () => {
    const corpo = await (await pedir({ 'x-titular-id': A })).json();
    expect(Object.keys(corpo.dados[0])).not.toContain('titularId');
  });
});
