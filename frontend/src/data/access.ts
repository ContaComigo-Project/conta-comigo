import { AccountDTO, AccountProfileDTO, SessionDTO, type CredentialsDTO, type CreateAccountDTO, type SessionDTO as Session } from '@contacomigo/contract';

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
  const response = await fetch(`${BASE}/access/sessions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credenciais),
  });
  if (!response.ok) throw new AccessFailure(await errorMessage(response, 'E-mail ou senha inválidos.'));

  const nova = SessionDTO.safeParse(await response.json());
  if (!nova.success) throw new AccessFailure('Resposta inesperada do servidor.');
  sessionAtual = nova.data;
  return nova.data;
}

/** Restaura a sessão via refresh token em cookie httpOnly (HT-018): o F5 e a
 *  navegação direta deixam de expulsar a pessoa. O access token continua só em
 *  memória; o cookie é invisível para scripts (ADR-004). */
export async function restoreSession(): Promise<boolean> {
  if (sessionAtual) return true;
  try {
    const response = await fetch(`${BASE}/access/sessions/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!response.ok) return false;
    const nova = SessionDTO.safeParse(await response.json());
    if (!nova.success) return false;
    sessionAtual = nova.data;
    return true;
  } catch {
    return false;
  }
}

export async function signOut() {
  const refreshToken = sessionAtual?.refreshToken;
  sessionAtual = null;
  await fetch(`${BASE}/access/sessions`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(refreshToken ? { refreshToken } : {}),
  }).catch(() => undefined);
}

/** Perfil do titular autenticado — o nome vem do banco (HN-001). */
export async function getProfile(): Promise<AccountProfileDTO> {
  const token = getAccessToken();
  if (!token) throw new AccessFailure('Sem sessão.');
  const response = await fetch(`${BASE}/access/accounts/me`, { headers: { authorization: `Bearer ${token}` } });
  if (!response.ok) throw new AccessFailure('Não foi possível buscar o perfil.');
  const perfil = AccountProfileDTO.safeParse(await response.json());
  if (!perfil.success) throw new AccessFailure('Resposta inesperada do servidor.');
  return perfil.data;
}
