import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { AggregationModule } from '../aggregation/aggregation.module';
import { TOKENS_AGGREGATION } from '../aggregation/domain/port/driven/tokens';
import { TransactionsModule } from '../transactions/transactions.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { TOKENS_INTELLIGENCE } from '../intelligence/domain/port/driven/tokens';
import type { AiAdvisor } from '../intelligence/domain/port/driven/ai-advisor';
import { MakeDescriptionsReadable } from '../transactions/application/make-descriptions-readable';
import { AdvisorDescriptionTranslator } from '../transactions/infrastructure/ai/advisor-description-translator';
import { TOKENS } from '../transactions/domain/port/driven/tokens';
import { ConnectInstitutionUseCase } from './application/connect-institution';
import { ListConnectionsUseCase } from './application/list-connections';
import { SyncInstitutionUseCase } from './application/sync-institution';
import { RevokeConsentUseCase } from './application/revoke-consent';
import { DeleteAccountUseCase } from './application/delete-account';
import type { OpenFinanceAggregator } from '../aggregation/domain/port/driven/open-finance-aggregator';
import { TOKENS_CONSENT } from './domain/port/driven/consent-repository';
import { ConsentController } from './infrastructure/http/consent.controller';
import { TokenIdentity } from './infrastructure/http/token-identity';
import { ConsentRepositoryPrisma } from './infrastructure/persistence/consent-repository-prisma';
import { CredentialCipherAes } from './infrastructure/persistence/credential-cipher-aes';
import type { RepositorioDeAccounts } from '../access/domain/port/driven/account-repository';
import type { SessionRepository } from '../access/domain/port/driven/session-repository';
import { TOKENS_ACCESS } from '../access/domain/port/driven/tokens';
import type { RepositorioDeTransactions } from '../transactions/domain/port/driven/transaction-repository';
import type { ExternalAccountRepository } from '../transactions/domain/port/driven/external-account-repository';

// Wiring (ADR-001): port -> adapter by token. The consent context consumes the
// aggregation port (imported module) and the access token issuer.
@Module({
  imports: [AccessModule, AggregationModule, TransactionsModule, IntelligenceModule],
  controllers: [ConsentController],
  providers: [
    { provide: TOKENS_CONSENT.ConsentRepository, useFactory: () => new ConsentRepositoryPrisma() },
    { provide: TOKENS_CONSENT.CredentialCipher, useClass: CredentialCipherAes },
    { provide: TOKENS_CONSENT.Identity, useClass: TokenIdentity },
    {
      provide: TOKENS_CONSENT.ConnectInstitution,
      inject: [TOKENS_CONSENT.ConsentRepository, TOKENS_CONSENT.CredentialCipher, TOKENS_AGGREGATION.OpenFinanceAggregator],
      useFactory: (repo: InstanceType<typeof ConsentRepositoryPrisma>, cipher: CredentialCipherAes, aggregator: OpenFinanceAggregator) =>
        new ConnectInstitutionUseCase(repo, cipher, aggregator),
    },
    {
      provide: TOKENS_CONSENT.ListConnections,
      inject: [TOKENS_CONSENT.ConsentRepository],
      useFactory: (repo: InstanceType<typeof ConsentRepositoryPrisma>) => new ListConnectionsUseCase(repo),
    },
    {
      provide: TOKENS_CONSENT.SyncInstitution,
      inject: [
        TOKENS_CONSENT.ConsentRepository,
        TOKENS_AGGREGATION.OpenFinanceAggregator,
        TOKENS.ExternalAccountRepository,
        TOKENS.RepositorioDeTransactions,
        TOKENS_INTELLIGENCE.AiAdvisor,
      ],
      useFactory: (
        repo: InstanceType<typeof ConsentRepositoryPrisma>,
        aggregator: OpenFinanceAggregator,
        contas: ExternalAccountRepository,
        lancamentos: RepositorioDeTransactions,
        advisor: AiAdvisor,
      ) =>
        // HN-004: a limpeza semantica entra na sincronizacao. O tradutor e um
        // adaptador sobre a porta de IA — o caso de uso nao sabe que ha modelo.
        new SyncInstitutionUseCase(
          repo,
          aggregator,
          contas,
          lancamentos,
          new MakeDescriptionsReadable(new AdvisorDescriptionTranslator(advisor)),
        ),
    },
    {
      provide: TOKENS_CONSENT.RevokeConsent,
      inject: [TOKENS_CONSENT.ConsentRepository],
      useFactory: (repo: InstanceType<typeof ConsentRepositoryPrisma>) => new RevokeConsentUseCase(repo),
    },
    {
      provide: TOKENS_CONSENT.DeleteAccount,
      inject: [
        TOKENS_ACCESS.RepositorioDeAccounts,
        TOKENS_ACCESS.SessionRepository,
        TOKENS_CONSENT.ConsentRepository,
        TOKENS.RepositorioDeTransactions,
      ],
      useFactory: (
        accounts: RepositorioDeAccounts,
        sessions: SessionRepository,
        consents: InstanceType<typeof ConsentRepositoryPrisma>,
        transactions: RepositorioDeTransactions,
      ) => new DeleteAccountUseCase(accounts, sessions, consents, transactions),
    },
  ],
})
export class ConsentModule {}