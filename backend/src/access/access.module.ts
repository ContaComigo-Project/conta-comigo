import { Module } from '@nestjs/common';
import { AuthenticateUseCase } from './application/authenticate';
import { CriarAccountUseCase } from './application/create-account';
import { EncerrarSessionUseCase } from './application/end-session';
import { RenovarSessionUseCase } from './application/renew-session';
import type { TokenIssuer } from './domain/port/driven/token-issuer';
import type { PasswordHasher } from './domain/port/driven/password-hasher';
import type { RepositorioDeAccounts } from './domain/port/driven/account-repository';
import type { SessionRepository } from './domain/port/driven/session-repository';
import { TOKENS_ACCESS } from './domain/port/driven/tokens';
import { JwtIssuer } from './infrastructure/crypto/jwt-issuer';
import { BcryptHasher } from './infrastructure/crypto/bcrypt-hasher';
import { AccessController } from './infrastructure/http/access.controller';
import { RepositorioDeAccountsPrisma } from './infrastructure/persistence/account-repository-prisma';
import { SessionRepositoryPrisma } from './infrastructure/persistence/session-repository-prisma';
import { TOKENS } from '../transactions/domain/port/driven/tokens';
import { SystemClock } from '../transactions/infrastructure/clock/system-clock';
import type { Clock } from '../transactions/domain/port/driven/clock';

// Wiring do contexto `access`: porta -> adaptador por token (ADR-001).
// A persistencia real dos dois repositorios entra junto da migracao.
@Module({
  controllers: [AccessController],
  providers: [
    { provide: TOKENS.Clock, useClass: SystemClock },
    { provide: TOKENS_ACCESS.PasswordHasher, useFactory: () => new BcryptHasher() },
    { provide: TOKENS_ACCESS.TokenIssuer, useFactory: () => new JwtIssuer() },
    { provide: TOKENS_ACCESS.RepositorioDeAccounts, useFactory: () => new RepositorioDeAccountsPrisma() },
    { provide: TOKENS_ACCESS.SessionRepository, useFactory: () => new SessionRepositoryPrisma() },
    {
      provide: TOKENS_ACCESS.CriarAccount,
      inject: [TOKENS_ACCESS.RepositorioDeAccounts, TOKENS_ACCESS.PasswordHasher],
      useFactory: (accounts: RepositorioDeAccounts, hash: PasswordHasher) => new CriarAccountUseCase(accounts, hash),
    },
    {
      provide: TOKENS_ACCESS.Authenticate,
      inject: [
        TOKENS_ACCESS.RepositorioDeAccounts,
        TOKENS_ACCESS.SessionRepository,
        TOKENS_ACCESS.PasswordHasher,
        TOKENS_ACCESS.TokenIssuer,
        TOKENS.Clock,
      ],
      useFactory: (
        accounts: RepositorioDeAccounts,
        sessions: SessionRepository,
        hash: PasswordHasher,
        emissor: TokenIssuer,
        clock: Clock,
      ) => new AuthenticateUseCase(accounts, sessions, hash, emissor, clock),
    },
    {
      provide: TOKENS_ACCESS.RenovarSession,
      inject: [TOKENS_ACCESS.SessionRepository, TOKENS_ACCESS.RepositorioDeAccounts, TOKENS_ACCESS.TokenIssuer, TOKENS.Clock],
      useFactory: (sessions: SessionRepository, accounts: RepositorioDeAccounts, emissor: TokenIssuer, clock: Clock) =>
        new RenovarSessionUseCase(sessions, accounts, emissor, clock),
    },
    {
      provide: TOKENS_ACCESS.EncerrarSession,
      inject: [TOKENS_ACCESS.SessionRepository, TOKENS.Clock],
      useFactory: (sessions: SessionRepository, clock: Clock) => new EncerrarSessionUseCase(sessions, clock),
    },
  ],
  exports: [TOKENS_ACCESS.TokenIssuer, TOKENS_ACCESS.RepositorioDeAccounts, TOKENS_ACCESS.SessionRepository],
})
export class AccessModule {}
