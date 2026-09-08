import { AccountDTO, SessionDTO, type CredentialsDTO, type CreateAccountDTO, type SessionDTO as Session } from '@contacomigo/contract';

// Cliente de access da web (HN-001). Fala com a API pelo contrato; nenhuma
// regra de negócio mora aqui.
//
// O token fica em MEMÓRIA, nunca em localStorage (ADR-004, regra 2): o que está
// em localStorage é legível por qualquer script que a página venha a carregar.
// Recarregar a página encerra a sessão do lado da web — a decisão sobre cookie
// seguro e renovação silenciosa é de HT-018.

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let sessionAtual: Session | null = null;

export const session = () => sessionAtual;
export const getAccessToken = () => sessionAtual?.accessToken ?? null;

export class AccessFailure extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'AccessFailure';
  }
}

async function enviar(route: string, metodo: string, body: unknown) {
  let response: Response;
  try {
    response = await fetch(BASE + route, {
      method: metodo,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AccessFailure('Não foi possível falar com o servidor. Tente de novo.');
  }
  return response;
}

/** A mensagem exibida é a que a API devolve: ela é deliberadamente uniforme. */
async function errorMessage(response: Response, padrao: string) {
  try {
    const body = await response.json();
    return typeof body?.mensagem === 'string' ? body.mensagem : padrao;
  } catch {
    return padrao;
  }
}

export async function createAccount(dados: CreateAccountDTO) {
  const response = await enviar('/access/accounts', 'POST', dados);
  if (!response.ok) throw new AccessFailure(await errorMessage(response, 'Não foi possível criar a conta.'));

  const account = AccountDTO.safeParse(await response.json());
  if (!account.success) throw new AccessFailure('Resposta inesperada do servidor.');
  return account.data;
}

export async function signIn(credenciais: CredentialsDTO) {
  const response = await enviar('/access/sessions', 'POST', credenciais);
  if (!response.ok) throw new AccessFailure(await errorMessage(response, 'E-mail ou senha inválidos.'));

  const nova = SessionDTO.safeParse(await response.json());
  if (!nova.success) throw new AccessFailure('Resposta inesperada do servidor.');
  sessionAtual = nova.data;
  return nova.data;
}

export async function signOut() {
  const refreshToken = sessionAtual?.refreshToken;
  sessionAtual = null;
  if (refreshToken) await enviar('/access/sessions', 'DELETE', { refreshToken });
}
