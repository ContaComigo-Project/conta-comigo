import type { Conta } from '../../domain/model/conta';
import type { Email } from '../../domain/model/email';
import type { RepositorioDeContas } from '../../domain/port/saida/repositorio-de-contas';

// Adaptador falso (ADR-001: todo adaptador nasce com implementacao falsa).
export class RepositorioDeContasEmMemoria implements RepositorioDeContas {
  private readonly porId_ = new Map<string, Conta>();

  async porEmail(email: Email): Promise<Conta | null> {
    return [...this.porId_.values()].find((c) => c.email === email) ?? null;
  }

  async porId(id: string): Promise<Conta | null> {
    return this.porId_.get(id) ?? null;
  }

  async salvar(conta: Conta): Promise<void> {
    this.porId_.set(conta.id, conta);
  }
}
