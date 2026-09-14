// E-mail como valor do dominio: normalizado uma vez, comparado sempre igual.
// Sem isso, "Pessoa@Exemplo.com" e "pessoa@exemplo.com" viram duas accounts.
export type Email = string & { readonly __email: unique symbol };

export function email(valor: string): Email {
  const normalizado = valor.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) throw new EmailInvalido();
  return normalizado as Email;
}

export class EmailInvalido extends Error {
  constructor() {
    super('E-mail invalido.');
    this.name = 'EmailInvalido';
  }
}
