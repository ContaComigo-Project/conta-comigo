import { createHash, randomBytes } from 'node:crypto';

// O refresh e um valor aleatorio de 256 bits — nao um JWT. ADR-004 pede
// revogacao real, e um JWT so seria revogavel com lista de bloqueio, que e a
// mesma tabela sem o beneficio.
//
// O hash e SHA-256, nao bcrypt: bcrypt existe para resistir a forca bruta sobre
// segredo de baixa entropia (senha escolhida por gente). Um valor aleatorio de
// 256 bits nao tem o que ser adivinhado, e bcrypt aqui so custaria latencia em
// cada refresh. O que importa e o mesmo nos dois casos: o banco guarda o
// hash, nunca o valor.
export const gerarRefresh = () => randomBytes(32).toString('base64url');
export const refreshTokenHash = (refresh: string) => createHash('sha256').update(refresh).digest('hex');

export const DURACAO_DO_REFRESH_EM_DIAS = 30;
