// Regras de fronteira de ADR-001 (hexagonal) e ADR-002 (Prisma confinado),
// como configuracao executavel do dependency-cruiser.
//
// Exportada como fabrica para que a MESMA lista de regras rode sobre a arvore
// de producao (backend/src) e sobre as fixtures de teste — e o teste em
// tests/fronteiras/ prove que cada regra reprova o que deveria.
//
// Tabela de origem: ADR-001, secao "Regras de dependencia":
//   domain/          -> so TypeScript e outros domain/; nada de framework, ORM, I/O
//   application/     -> pode domain/; nao pode infrastructure/ nem @nestjs/* (exceto tipo puro)
//   infrastructure/  -> pode tudo; nao pode conter regra de negocio (nao verificavel aqui)
//   <contexto>.module.ts -> pode tudo: unico ponto que conhece o concreto
// Mais ADR-002, regra 2: @prisma/client so em infrastructure/persistence/.

'use strict';

/**
 * @param {string} raiz  caminho, relativo a raiz do repo, da arvore de contextos
 *                       (ex.: "backend/src" ou "tests/fronteiras/fixtures/limpo")
 */
function criarRegras(raiz) {
  const r = raiz.replace(/\\/g, '/').replace(/\/$/, '');
  const DOMAIN = `^${r}/[^/]+/domain/`;
  const APPLICATION = `^${r}/[^/]+/application/`;
  const INFRA = `^${r}/[^/]+/infrastructure/`;
  const PERSISTENCE = `^${r}/[^/]+/infrastructure/persistence/`;
  const MODULE = '\\.module\\.ts$';

  return [
    {
      name: 'dominio-so-importa-dominio',
      comment: 'ADR-001: domain/ importa apenas outros arquivos de domain/. Nada de application/, infrastructure/ ou externo.',
      severity: 'error',
      from: { path: DOMAIN, pathNot: MODULE },
      to: { pathNot: [DOMAIN, 'node_modules/(typescript|tslib)/'], dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'dominio-sem-framework-nem-io',
      comment: 'ADR-001 / ADR-003: um import de @nestjs/*, @prisma/client, axios ou qualquer pacote dentro de domain/ quebra o gate.',
      severity: 'error',
      from: { path: DOMAIN },
      to: {
        dependencyTypes: ['npm', 'npm-dev', 'npm-peer', 'npm-optional', 'npm-no-pkg', 'npm-unknown', 'core'],
        pathNot: 'node_modules/(typescript|tslib)/',
      },
    },
    {
      name: 'application-nao-conhece-infra',
      comment: 'ADR-001: application/ pode domain/, nunca infrastructure/ nem framework (tipo puro de @nestjs/* e tolerado).',
      severity: 'error',
      from: { path: APPLICATION, pathNot: MODULE },
      to: {
        path: [INFRA, 'node_modules/(@nestjs/|@prisma/client/|prisma/|axios/)'],
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'prisma-so-em-persistence',
      comment: 'ADR-002, regra 2: @prisma/client e conhecido apenas por infrastructure/persistence/.',
      severity: 'error',
      from: { path: `^${r}/`, pathNot: PERSISTENCE },
      to: { path: 'node_modules/@prisma/client/' },
    },
    {
      name: 'sem-ciclos',
      comment: 'Dependencia circular entre modulos impede reversao limpa.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'sem-import-irresolvivel',
      comment: 'Import que nao resolve escaparia das outras regras por nao virar node_modules/...; precisa falhar por si.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ];
}

const opcoesComuns = {
  doNotFollow: { path: 'node_modules' },
  tsPreCompilationDeps: true,
  tsConfig: { fileName: 'tsconfig.json' },
  enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require', 'node', 'default', 'types'], mainFields: ['module', 'main', 'types', 'typings'] },
  reporterOptions: { text: { highlightFocused: true } },
};

module.exports = { criarRegras, opcoesComuns };
