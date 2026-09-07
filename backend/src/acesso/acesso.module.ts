import { Module } from '@nestjs/common';
import { AutenticarUseCase } from './application/autenticar';
import { CriarContaUseCase } from './application/criar-conta';
import { EncerrarSessaoUseCase } from './application/encerrar-sessao';
import { RenovarSessaoUseCase } from './application/renovar-sessao';
import type { EmissorDeToken } from './domain/port/saida/emissor-de-token';
import type { HashDeSenha } from './domain/port/saida/hash-de-senha';
import type { RepositorioDeContas } from './domain/port/saida/repositorio-de-contas';
import type { RepositorioDeSessoes } from './domain/port/saida/repositorio-de-sessoes';
import { TOKENS_ACESSO } from './domain/port/saida/tokens';
import { EmissorJwt } from './infrastructure/cripto/emissor-jwt';
import { HashBcrypt } from './infrastructure/cripto/hash-bcrypt';
import { AcessoController } from './infrastructure/http/acesso.controller';
import { RepositorioDeContasPrisma } from './infrastructure/persistence/repositorio-de-contas-prisma';
import { RepositorioDeSessoesPrisma } from './infrastructure/persistence/repositorio-de-sessoes-prisma';
import { TOKENS } from '../lancamentos/domain/port/saida/tokens';
import { RelogioDoSistema } from '../lancamentos/infrastructure/relogio/relogio-do-sistema';
import type { Relogio } from '../lancamentos/domain/port/saida/relogio';

// Wiring do contexto `acesso`: porta -> adaptador por token (ADR-001).
// A persistencia real dos dois repositorios entra junto da migracao.
@Module({
  controllers: [AcessoController],
  providers: [
    { provide: TOKENS.Relogio, useClass: RelogioDoSistema },
    { provide: TOKENS_ACESSO.HashDeSenha, useFactory: () => new HashBcrypt() },
    { provide: TOKENS_ACESSO.EmissorDeToken, useFactory: () => new EmissorJwt() },
    { provide: TOKENS_ACESSO.RepositorioDeContas, useFactory: () => new RepositorioDeContasPrisma() },
    { provide: TOKENS_ACESSO.RepositorioDeSessoes, useFactory: () => new RepositorioDeSessoesPrisma() },
    {
      provide: TOKENS_ACESSO.CriarConta,
      inject: [TOKENS_ACESSO.RepositorioDeContas, TOKENS_ACESSO.HashDeSenha],
      useFactory: (contas: RepositorioDeContas, hash: HashDeSenha) => new CriarContaUseCase(contas, hash),
    },
    {
      provide: TOKENS_ACESSO.Autenticar,
      inject: [
        TOKENS_ACESSO.RepositorioDeContas,
        TOKENS_ACESSO.RepositorioDeSessoes,
        TOKENS_ACESSO.HashDeSenha,
        TOKENS_ACESSO.EmissorDeToken,
        TOKENS.Relogio,
      ],
      useFactory: (
        contas: RepositorioDeContas,
        sessoes: RepositorioDeSessoes,
        hash: HashDeSenha,
        emissor: EmissorDeToken,
        relogio: Relogio,
      ) => new AutenticarUseCase(contas, sessoes, hash, emissor, relogio),
    },
    {
      provide: TOKENS_ACESSO.RenovarSessao,
      inject: [TOKENS_ACESSO.RepositorioDeSessoes, TOKENS_ACESSO.RepositorioDeContas, TOKENS_ACESSO.EmissorDeToken, TOKENS.Relogio],
      useFactory: (sessoes: RepositorioDeSessoes, contas: RepositorioDeContas, emissor: EmissorDeToken, relogio: Relogio) =>
        new RenovarSessaoUseCase(sessoes, contas, emissor, relogio),
    },
    {
      provide: TOKENS_ACESSO.EncerrarSessao,
      inject: [TOKENS_ACESSO.RepositorioDeSessoes, TOKENS.Relogio],
      useFactory: (sessoes: RepositorioDeSessoes, relogio: Relogio) => new EncerrarSessaoUseCase(sessoes, relogio),
    },
  ],
  exports: [TOKENS_ACESSO.EmissorDeToken],
})
export class AcessoModule {}
