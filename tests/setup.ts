// Ambiente mínimo para a suíte. Não substitui configuração de execução: são
// valores que só existem para o teste rodar de forma determinística.
//
// O segredo abaixo é de teste e está no repositório de propósito — ele não abre
// nada. O segredo real vem de `.env` e nunca é versionado (RNF-012); a prova de
// que a API recusa operar sem ele está em `emissor-jwt`, que lança
// `SegredoDeTokenAusente` em vez de assinar com um valor padrão.
process.env.JWT_SECRET ??= 'segredo-de-teste-sem-valor-fora-da-suite';

// bcrypt com custo real transformaria a suíte em minutos; o custo de produção
// está declarado em `HashBcrypt`.
process.env.NODE_ENV ??= 'test';
