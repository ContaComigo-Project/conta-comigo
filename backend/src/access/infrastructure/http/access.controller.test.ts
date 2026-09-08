import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AccountDTO, SessionDTO } from '@contacomigo/contrato';
import { AccessModule } from '../../access.module';
import { TOKENS_ACCESS } from '../../domain/port/driven/tokens';
import { RepositorioDeAccountsEmMemoria } from '../persistence/account-repository-memory';
import { SessionRepositoryMemory } from '../persistence/session-repository-memory';

// Os seis criterios de HN-001, na fronteira HTTP. Sobe o Nest de verdade em
// porta efemera, com os adaptadores em memory; nao sobe banco nem navegador.
process.env.JWT_SECRET ??= 'segredo-apenas-de-teste-nao-usar-em-lugar-nenhum';

const EMAIL = 'pessoa@exemplo.com';
const SENHA = 'senha-forte-1';

describe('HN-001 — access: cadastro, input e saida', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    // Adaptadores falsos pelos mesmos tokens: sem eles o teste falaria com o
    // PostgreSQL, deixaria account gravada e a segunda execucao encontraria
    // "e-mail duplicado" onde esperava cadastro novo. `test-unitario` continua
    // sem banco (ADR-003); a persistencia real e coberta por test-integracao.
    const modulo = await Test.createTestingModule({ imports: [AccessModule] })
      .overrideProvider(TOKENS_ACCESS.RepositorioDeAccounts)
      .useValue(new RepositorioDeAccountsEmMemoria())
      .overrideProvider(TOKENS_ACCESS.SessionRepository)
      .useValue(new SessionRepositoryMemory())
      .compile();
    app = modulo.createNestApplication({ logger: false });
    await app.listen(0);
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  const post = (route: string, body: unknown) =>
    fetch(url + route, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

  const cadastrar = (email: string, senha = SENHA) => post('/access/accounts', { email, senha });
  const entrar = (email: string, senha: string) => post('/access/sessions', { email, senha });

  it('RF-001 — cadastro cria a account e a response nao carrega senha nem hash', async () => {
    const response = await cadastrar(EMAIL);
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(AccountDTO.safeParse(body).success, JSON.stringify(body)).toBe(true);
    expect(body.email).toBe(EMAIL);

    const texto = JSON.stringify(body);
    expect(texto).not.toContain(SENHA);
    expect(texto).not.toContain('$2'); // prefixo de hash bcrypt
  });

  it('RF-001 — e-mail duplicado e recusado sem revelar que o e-mail existe', async () => {
    await cadastrar('duplicado@exemplo.com');
    const segunda = await cadastrar('duplicado@exemplo.com');

    expect(segunda.status).toBe(400);
    const mensagem = JSON.stringify(await segunda.json()).toLowerCase();
    for (const vazamento of ['ja existe', 'já existe', 'duplicad', 'cadastrado', 'em uso']) {
      expect(mensagem, `a recusa revelou "${vazamento}"`).not.toContain(vazamento);
    }
  });

  it('RF-002 — credencial correta abre session valida', async () => {
    await cadastrar('entra@exemplo.com');
    const response = await entrar('entra@exemplo.com', SENHA);

    expect(response.status).toBe(200);
    const session = await response.json();
    expect(SessionDTO.safeParse(session).success, JSON.stringify(session)).toBe(true);
    expect(session.accessToken.split('.')).toHaveLength(3); // JWT
    expect(session.refreshToken).not.toBe(session.accessToken);
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('RF-002 — senha errada e e-mail inexistente dao a MESMA response', async () => {
    await cadastrar('existe@exemplo.com');

    const senhaErrada = await entrar('existe@exemplo.com', 'senha-errada-9');
    const emailInexistente = await entrar('ninguem@exemplo.com', SENHA);

    expect(senhaErrada.status).toBe(401);
    expect(emailInexistente.status).toBe(401);
    // Mesma mensagem: qualquer diferenca permite enumerar accounts.
    expect(await senhaErrada.text()).toBe(await emailInexistente.text());
  });

  it('RF-002 — o e-mail e normalizado: maiusculas entram na mesma account', async () => {
    await cadastrar('Normaliza@Exemplo.com');
    expect((await entrar('normaliza@exemplo.com', SENHA)).status).toBe(200);
  });

  it('RF-003 — encerrar session invalida o refresh', async () => {
    await cadastrar('sai@exemplo.com');
    const session = await (await entrar('sai@exemplo.com', SENHA)).json();

    const saida = await fetch(url + '/access/sessions', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    expect(saida.status).toBe(204);

    // Renovar com o refresh revogado nao pode devolver session nova.
    const refresh = await post('/access/sessions/refresh', { refreshToken: session.refreshToken });
    expect(refresh.status).toBe(401);
  });

  it('a senha nunca volta na response, nem quando o cadastro falha', async () => {
    const responses = [
      await cadastrar('curta@exemplo.com', 'curta'),
      await entrar('ninguem@exemplo.com', SENHA),
    ];
    for (const r of responses) {
      expect(await r.text()).not.toContain(SENHA);
    }
  });
});
