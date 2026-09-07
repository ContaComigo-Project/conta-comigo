// Identidade do dono do dado. Tipo nominal para que um `string` qualquer nao
// seja aceito por engano onde a barreira de RN-015 depende do titular certo.
export type TitularId = string & { readonly __titular: unique symbol };

export const titularId = (valor: string): TitularId => {
  if (!valor.trim()) throw new Error('TitularId vazio: sem titular nao ha barreira.');
  return valor as TitularId;
};
