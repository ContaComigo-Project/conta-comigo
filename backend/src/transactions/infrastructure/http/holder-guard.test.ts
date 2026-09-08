import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { TransactionsModule } from '../../transactions.module';
import { TOKENS } from '../../domain/port/driven/tokens';
import { FixedClock } from '../clock/fixed-clock';
import { RepositorioDeTransactionsEmMemoria } from '../persistence/in-memory-repository';
import { holderId } from '../../domain/model/holder';
import { JwtIssuer } from '../../../access/infrastructure/crypto/jwt-issuer';

// RNF-013 e RN-015 — os tres casos negativos que a skill open-finance-security
// exige de TODA route que devolve dado de pessoa. Sem eles, o gate reprova.
//
// O repositorio em memory carrega dado dos dois holderes de proposito: e assim
// que um filtro ausente aparece — a route devolveria o dado alheio junto.
const A = holderId('holder-a');
const B = holderId('holder-b');

// Desde HN-001 a identity vem de um access token assinado, nao mais de um
// cabecalho forjavel. A guarda, o filtro e estes testes nao mudaram — so a
// forma de dizer quem e quem.
const emissor = new JwtIssuer();
const comoHolder = (t: typeof A) => ({ authorization: `Bearer ${emissor.emitir(t).valor}` });

const transaction = (id: string, dono: typeof A, description: string) => ({
  id,
  holderId: dono,
  description,
  amountInCents: 10_00,
  externalId: null,
  dueDate: new Date('2026-01-10T12:00:00Z'),
});

describe('RNF-013 / RN-015 — GET /transactions so devolve dado do proprio holder', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [TransactionsModule] })
      .overrideProvider(TOKENS.Clock)
      .useValue(new FixedClock(new Date('2026-01-15T12:00:00Z')))
      .overrideProvider(TOKENS.RepositorioDeTransactions)
      .useValue(
        new RepositorioDeTransactionsEmMemoria([
          transaction('de-a-1', A, 'mercado do A'),
          transaction('de-a-2', A, 'farmacia do A'),
          transaction('de-b-1', B, 'restaurante do B'),
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
    fetch(baseUrl + '/transactions', { headers: cabecalhos });

  it('token invalido tambem e ausencia de credencial', async () => {
    expect((await pedir({ authorization: 'Bearer nao-e-um-token' })).status).toBe(401);
    expect((await pedir({ authorization: 'Basic abc' })).status).toBe(401);
  });

  it('sem credencial: recusa a autenticacao e nao devolve conteudo', async () => {
    const response = await pedir();
    expect(response.status).toBe(401);
    expect(await response.text()).not.toContain('mercado do A');
  });

  it('credencial vazia tambem e ausencia de credencial', async () => {
    expect((await pedir({ authorization: '   ' })).status).toBe(401);
  });

  it('holder B recebe apenas o proprio transaction — nada do holder A', async () => {
    const response = await pedir(comoHolder(B));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.estado).toBe('ok');
    expect(body.dados.map((l: { id: string }) => l.id)).toEqual(['de-b-1']);
    expect(JSON.stringify(body)).not.toContain('do A');
  });

  it('holder A recebe os dois transactions dele', async () => {
    const body = await (await pedir(comoHolder(A))).json();
    expect(body.dados.map((l: { id: string }) => l.id).sort()).toEqual(['de-a-1', 'de-a-2']);
  });

  it('o resumo do mes tambem respeita o holder', async () => {
    const response = await fetch(baseUrl + '/transactions/month-summary', { headers: comoHolder(B) });
    expect((await response.json()).quantidade).toBe(1);
  });

  it('o holder NAO vem da requisicao: parametro de query e ignorado', async () => {
    // Se `?holderId=` funcionasse, seria o vetor de ataque que a skill proibe.
    const response = await fetch(baseUrl + '/transactions?holderId=' + A, { headers: comoHolder(B) });
    const body = await response.json();
    expect(body.dados.map((l: { id: string }) => l.id)).toEqual(['de-b-1']);
  });

  it('o contrato nao expoe o holder: holderId nao viaja no DTO', async () => {
    const body = await (await pedir(comoHolder(A))).json();
    expect(Object.keys(body.dados[0])).not.toContain('holderId');
  });
});
