// Identity das portas do contexto `access` (ADR-001, regra adicional 3).
export const TOKENS_ACCESS = {
  RepositorioDeAccounts: Symbol.for('access/RepositorioDeAccounts'),
  SessionRepository: Symbol.for('access/SessionRepository'),
  PasswordHasher: Symbol.for('access/PasswordHasher'),
  TokenIssuer: Symbol.for('access/TokenIssuer'),
  CriarAccount: Symbol.for('access/CriarAccount'),
  Authenticate: Symbol.for('access/Authenticate'),
  RenovarSession: Symbol.for('access/RenovarSession'),
  EncerrarSession: Symbol.for('access/EncerrarSession'),
} as const;
