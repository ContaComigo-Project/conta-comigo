import { ContaDTO, SessaoDTO, type CredenciaisDTO, type CriarContaDTO, type SessaoDTO as Sessao } from '@contacomigo/contrato';

// Cliente de acesso da web (HN-001). Fala com a API pelo contrato; nenhuma
// regra de negócio mora aqui.
//
// O token fica em MEMÓRIA, nunca em localStorage (ADR-004, regra 2): o que está
// em localStorage é legível por qualquer script que a página venha a carregar.
// Recarregar a página encerra a sessão do lado da web — a decisão sobre cookie
// seguro e renovação silenciosa é de HT-018.

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let sessaoAtual: Sessao | null = null;

export const sessao = () => sessaoAtual;
export const tokenDeAcesso = () => sessaoAtual?.accessToken ?? null;

export class FalhaDeAcesso extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'FalhaDeAcesso';
  }
}

async function enviar(rota: string, metodo: string, corpo: unknown) {
  let resposta: Response;
  try {
    resposta = await fetch(BASE + rota, {
      method: metodo,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(corpo),
    });
  } catch {
    throw new FalhaDeAcesso('Não foi possível falar com o servidor. Tente de novo.');
  }
  return resposta;
}

/** A mensagem exibida é a que a API devolve: ela é deliberadamente uniforme. */
async function mensagemDeErro(resposta: Response, padrao: string) {
  try {
    const corpo = await resposta.json();
    return typeof corpo?.message === 'string' ? corpo.message : padrao;
  } catch {
    return padrao;
  }
}

export async function criarConta(dados: CriarContaDTO) {
  const resposta = await enviar('/acesso/contas', 'POST', dados);
  if (!resposta.ok) throw new FalhaDeAcesso(await mensagemDeErro(resposta, 'Não foi possível criar a conta.'));

  const conta = ContaDTO.safeParse(await resposta.json());
  if (!conta.success) throw new FalhaDeAcesso('Resposta inesperada do servidor.');
  return conta.data;
}

export async function entrar(credenciais: CredenciaisDTO) {
  const resposta = await enviar('/acesso/sessoes', 'POST', credenciais);
  if (!resposta.ok) throw new FalhaDeAcesso(await mensagemDeErro(resposta, 'E-mail ou senha inválidos.'));

  const nova = SessaoDTO.safeParse(await resposta.json());
  if (!nova.success) throw new FalhaDeAcesso('Resposta inesperada do servidor.');
  sessaoAtual = nova.data;
  return nova.data;
}

export async function sair() {
  const refreshToken = sessaoAtual?.refreshToken;
  sessaoAtual = null;
  if (refreshToken) await enviar('/acesso/sessoes', 'DELETE', { refreshToken });
}
