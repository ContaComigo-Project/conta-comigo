import { randomUUID } from 'node:crypto';
import type { Conta } from '../domain/model/conta';
import { email as fazerEmail, EmailInvalido } from '../domain/model/email';
import { CadastroRecusado, type CriarConta } from '../domain/port/entrada/acesso';
import type { HashDeSenha } from '../domain/port/saida/hash-de-senha';
import type { RepositorioDeContas } from '../domain/port/saida/repositorio-de-contas';

export class CriarContaUseCase implements CriarConta {
  constructor(
    private readonly contas: RepositorioDeContas,
    private readonly hash: HashDeSenha,
  ) {}

  async executar(emailEmTexto: string, senhaEmClaro: string): Promise<Conta> {
    let email;
    try {
      email = fazerEmail(emailEmTexto);
    } catch (erro) {
      // E-mail malformado e e-mail ja existente dao a MESMA recusa: distinguir
      // permitiria enumerar quem tem conta (RF-001).
      if (erro instanceof EmailInvalido) throw new CadastroRecusado();
      throw erro;
    }

    if (await this.contas.porEmail(email)) throw new CadastroRecusado();

    const conta: Conta = { id: randomUUID(), email, hashDaSenha: await this.hash.gerar(senhaEmClaro) };
    await this.contas.salvar(conta);
    return conta;
  }
}
