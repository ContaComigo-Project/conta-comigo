// Identidade das portas do contexto `acesso` (ADR-001, regra adicional 3).
export const TOKENS_ACESSO = {
  RepositorioDeContas: Symbol.for('acesso/RepositorioDeContas'),
  RepositorioDeSessoes: Symbol.for('acesso/RepositorioDeSessoes'),
  HashDeSenha: Symbol.for('acesso/HashDeSenha'),
  EmissorDeToken: Symbol.for('acesso/EmissorDeToken'),
  CriarConta: Symbol.for('acesso/CriarConta'),
  Autenticar: Symbol.for('acesso/Autenticar'),
  RenovarSessao: Symbol.for('acesso/RenovarSessao'),
  EncerrarSessao: Symbol.for('acesso/EncerrarSessao'),
} as const;
