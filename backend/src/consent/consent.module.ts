import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { AggregationModule } from '../aggregation/aggregation.module';
import { TOKENS_AGGREGATION } from '../aggregation/domain/port/driven/tokens';
import { ConnectInstitutionUseCase } from './application/connect-institution';
import { ListConnectionsUseCase } from './application/list-connections';
import { SyncInstitutionUseCase } from './application/sync-institution';
import type { OpenFinanceAggregator } from '../aggregation/domain/port/driven/open-finance-aggregator';
import { TOKENS_CONSENT } from './domain/port/driven/consent-repository';
import { ConsentController } from './infrastructure/http/consent.controller';
import { TokenIdentity } from './infrastructure/http/token-identity';
import { ConsentRepositoryPrisma } from './infrastructure/persistence/consent-repository-prisma';
import { CredentialCipherAes } from './infrastructure/persistence/credential-cipher-aes';

// Wiring (ADR-001): port -> adapter by token. The consent context consumes the
// aggregation port (imported module) and the access token issuer.
@Module({
  imports: [AccessModule, AggregationModule],
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
      inject: [TOKENS_CONSENT.ConsentRepository, TOKENS_AGGREGATION.OpenFinanceAggregator],
      useFactory: (repo: InstanceType<typeof ConsentRepositoryPrisma>, aggregator: OpenFinanceAggregator) =>
        new SyncInstitutionUseCase(repo, aggregator),
    },
  ],
})
export class ConsentModule {}