import { faixaDoSemaforo } from '../domain/faixa-do-semaforo';
import type { RepositorioDeOrcamento } from '../domain/port/saida/repositorio-de-orcamento';

export async function calcularFaixa(repo: RepositorioDeOrcamento, categoria: string) {
  return faixaDoSemaforo(await repo.percentualGasto(categoria));
}
