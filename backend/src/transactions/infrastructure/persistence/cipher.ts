import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// Cipher em repouso (RNF-014, ADR-002 regra 4). Vive na borda da persistencia:
// o dominio nunca ve texto cipherdo nem chave.
//
// AES-256-GCM: confidencialidade + autenticacao. IV aleatorio por chamada, entao
// o mesmo texto nunca produz o mesmo cipherdo. Formato de saida (base64):
//   <iv>:<tag>:<texto cipherdo>
// A chave vem de ENCRYPTION_KEY em hex (32 bytes = 64 caracteres) e nunca do
// repositorio. Sem chave o utilitario RECUSA operar — gravar texto claro por
// omissao seria exatamente o que RNF-014 proibe.

const ALGORITMO = 'aes-256-gcm';
const BYTES_DA_CHAVE = 32;
const BYTES_DO_IV = 12;

export class ChaveDeCipherAusente extends Error {
  constructor() {
    super('ENCRYPTION_KEY nao definida: recusando operar em vez de gravar texto claro.');
    this.name = 'ChaveDeCipherAusente';
  }
}

export class ChaveDeCipherInvalida extends Error {
  constructor() {
    super(`ENCRYPTION_KEY precisa ter ${BYTES_DA_CHAVE} bytes em hex (${BYTES_DA_CHAVE * 2} caracteres).`);
    this.name = 'ChaveDeCipherInvalida';
  }
}

function chaveDe(chaveHex: string | undefined): Buffer {
  if (!chaveHex) throw new ChaveDeCipherAusente();
  if (!/^[0-9a-fA-F]+$/.test(chaveHex) || chaveHex.length !== BYTES_DA_CHAVE * 2) throw new ChaveDeCipherInvalida();
  return Buffer.from(chaveHex, 'hex');
}

export function cipherr(textoClaro: string, chaveHex = process.env.ENCRYPTION_KEY): string {
  const chave = chaveDe(chaveHex);
  const iv = randomBytes(BYTES_DO_IV);
  const cipher = createCipheriv(ALGORITMO, chave, iv);
  const cipherdo = Buffer.concat([cipher.update(textoClaro, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), cipherdo].map((b) => b.toString('base64')).join(':');
}

export function decipherr(textoCipherdo: string, chaveHex = process.env.ENCRYPTION_KEY): string {
  const chave = chaveDe(chaveHex);
  const partes = textoCipherdo.split(':');
  if (partes.length !== 3) throw new Error('Texto cipherdo em formato invalido.');
  const [iv, tag, cipherdo] = partes.map((p) => Buffer.from(p, 'base64'));
  const decipher = createDecipheriv(ALGORITMO, chave, iv);
  decipher.setAuthTag(tag);
  // final() lanca se a tag nao bater: chave errada ou texto adulterado.
  return Buffer.concat([decipher.update(cipherdo), decipher.final()]).toString('utf8');
}
