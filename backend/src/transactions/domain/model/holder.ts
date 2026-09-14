// Identity do dono do dado. Tipo nominal para que um `string` qualquer nao
// seja aceito por engano onde a barreira de RN-015 depende do holder certo.
export type HolderId = string & { readonly __holder: unique symbol };

export const holderId = (valor: string): HolderId => {
  if (!valor.trim()) throw new Error('HolderId vazio: sem holder nao ha barreira.');
  return valor as HolderId;
};
