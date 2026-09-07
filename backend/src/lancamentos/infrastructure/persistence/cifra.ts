import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// Cifra em repouso (RNF-014, ADR-002 regra 4). Vive na borda da persistencia:
// o dominio nunca ve texto cifrado nem chave.
//
// AES-256-GCM: confidencialidade + autenticacao. IV aleatorio por chamada, entao
// o mesmo texto nunca produz o mesmo cifrado. Formato de saida (base64):
//   <iv>:<tag>:<texto cifrado>
// A chave vem de ENCRYPTION_KEY em hex (32 bytes = 64 caracteres) e nunca do
// repositorio. Sem chave o utilitario RECUSA operar — gravar texto claro por
// omissao seria exatamente o que RNF-014 proibe.

const ALGORITMO = 'aes-256-gcm';
const BYTES_DA_CHAVE = 32;
const BYTES_DO_IV = 12;

export class ChaveDeCifraAusente extends Error {
  constructor() {
    super('ENCRYPTION_KEY nao definida: recusando operar em vez de gravar texto claro.');
    this.name = 'ChaveDeCifraAusente';
  }
}

export class ChaveDeCifraInvalida extends Error {
  constructor() {
    super(`ENCRYPTION_KEY precisa ter ${BYTES_DA_CHAVE} bytes em hex (${BYTES_DA_CHAVE * 2} caracteres).`);
    this.name = 'ChaveDeCifraInvalida';
  }
}

function chaveDe(chaveHex: string | undefined): Buffer {
  if (!chaveHex) throw new ChaveDeCifraAusente();
  if (!/^[0-9a-fA-F]+$/.test(chaveHex) || chaveHex.length !== BYTES_DA_CHAVE * 2) throw new ChaveDeCifraInvalida();
  return Buffer.from(chaveHex, 'hex');
}

export function cifrar(textoClaro: string, chaveHex = process.env.ENCRYPTION_KEY): string {
  const chave = chaveDe(chaveHex);
  const iv = randomBytes(BYTES_DO_IV);
  const cifra = createCipheriv(ALGORITMO, chave, iv);
  const cifrado = Buffer.concat([cifra.update(textoClaro, 'utf8'), cifra.final()]);
  return [iv, cifra.getAuthTag(), cifrado].map((b) => b.toString('base64')).join(':');
}

export function decifrar(textoCifrado: string, chaveHex = process.env.ENCRYPTION_KEY): string {
  const chave = chaveDe(chaveHex);
  const partes = textoCifrado.split(':');
  if (partes.length !== 3) throw new Error('Texto cifrado em formato invalido.');
  const [iv, tag, cifrado] = partes.map((p) => Buffer.from(p, 'base64'));
  const decifra = createDecipheriv(ALGORITMO, chave, iv);
  decifra.setAuthTag(tag);
  // final() lanca se a tag nao bater: chave errada ou texto adulterado.
  return Buffer.concat([decifra.update(cifrado), decifra.final()]).toString('utf8');
}
