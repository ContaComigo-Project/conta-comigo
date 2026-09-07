import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ContaDTO, SessaoDTO } from '@contacomigo/contrato';
import { AcessoModule } from '../../acesso.module';
import { TOKENS_ACESSO } from '../../domain/port/saida/tokens';
import { RepositorioDeContasEmMemoria } from '../persistence/repositorio-de-contas-memoria';
import { RepositorioDeSessoesEmMemoria } from '../persistence/repositorio-de-sessoes-memoria';

// Os seis criterios de HN-001, na fronteira HTTP. Sobe o Nest de verdade em
// porta efemera, com os adaptadores em memoria; nao sobe banco nem navegador.
process.env.JWT_SECRET ??= 'segredo-apenas-de-teste-nao-usar-em-lugar-nenhum';

const EMAIL = 'pessoa@exemplo.com';
const SENHA = 'senha-forte-1';

describe('HN-001 — acesso: cadastro, entrada e saida', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    // Adaptadores falsos pelos mesmos tokens: sem eles o teste falaria com o
    // PostgreSQL, deixaria conta gravada e a segunda execucao encontraria
    // "e-mail duplicado" onde esperava cadastro novo. `test-unitario` continua
    // sem banco (ADR-003); a persistencia real e coberta por test-integracao.
    const modulo = await Test.createTestingModule({ imports: [AcessoModule] })
      .overrideProvider(TOKENS_ACESSO.RepositorioDeContas)
      .useValue(new RepositorioDeContasEmMemoria())
      .overrideProvider(TOKENS_ACESSO.RepositorioDeSessoes)
      .useValue(new RepositorioDeSessoesEmMemoria())
      .compile();
    app = modulo.createNestApplication({ logger: false });
    await app.listen(0);
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  const post = (rota: string, corpo: unknown) =>
    fetch(url + rota, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });

  const cadastrar = (email: string, senha = SENHA) => post('/acesso/contas', { email, senha });
  const entrar = (email: string, senha: string) => post('/acesso/sessoes', { email, senha });

  it('RF-001 — cadastro cria a conta e a resposta nao carrega senha nem hash', async () => {
    const resposta = await cadastrar(EMAIL);
    expect(resposta.status).toBe(201);

    const corpo = await resposta.json();
    expect(ContaDTO.safeParse(corpo).success, JSON.stringify(corpo)).toBe(true);
    expect(corpo.email).toBe(EMAIL);

    const texto = JSON.stringify(corpo);
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

  it('RF-002 — credencial correta abre sessao valida', async () => {
    await cadastrar('entra@exemplo.com');
    const resposta = await entrar('entra@exemplo.com', SENHA);

    expect(resposta.status).toBe(200);
    const sessao = await resposta.json();
    expect(SessaoDTO.safeParse(sessao).success, JSON.stringify(sessao)).toBe(true);
    expect(sessao.accessToken.split('.')).toHaveLength(3); // JWT
    expect(sessao.refreshToken).not.toBe(sessao.accessToken);
    expect(new Date(sessao.expiraEm).getTime()).toBeGreaterThan(Date.now());
  });

  it('RF-002 — senha errada e e-mail inexistente dao a MESMA resposta', async () => {
    await cadastrar('existe@exemplo.com');

    const senhaErrada = await entrar('existe@exemplo.com', 'senha-errada-9');
    const emailInexistente = await entrar('ninguem@exemplo.com', SENHA);

    expect(senhaErrada.status).toBe(401);
    expect(emailInexistente.status).toBe(401);
    // Mesma mensagem: qualquer diferenca permite enumerar contas.
    expect(await senhaErrada.text()).toBe(await emailInexistente.text());
  });

  it('RF-002 — o e-mail e normalizado: maiusculas entram na mesma conta', async () => {
    await cadastrar('Normaliza@Exemplo.com');
    expect((await entrar('normaliza@exemplo.com', SENHA)).status).toBe(200);
  });

  it('RF-003 — encerrar sessao invalida o refresh', async () => {
    await cadastrar('sai@exemplo.com');
    const sessao = await (await entrar('sai@exemplo.com', SENHA)).json();

    const saida = await fetch(url + '/acesso/sessoes', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: sessao.refreshToken }),
    });
    expect(saida.status).toBe(204);

    // Renovar com o refresh revogado nao pode devolver sessao nova.
    const renovacao = await post('/acesso/sessoes/renovacao', { refreshToken: sessao.refreshToken });
    expect(renovacao.status).toBe(401);
  });

  it('a senha nunca volta na resposta, nem quando o cadastro falha', async () => {
    const respostas = [
      await cadastrar('curta@exemplo.com', 'curta'),
      await entrar('ninguem@exemplo.com', SENHA),
    ];
    for (const r of respostas) {
      expect(await r.text()).not.toContain(SENHA);
    }
  });
});
