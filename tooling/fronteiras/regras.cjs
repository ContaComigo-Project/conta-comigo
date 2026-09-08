// ADR-001 (hexagonal) and ADR-002 (Prisma confined) boundary rules, as
// executable dependency-cruiser configuration.
//
// Exported as a factory so the SAME rule list runs against the production tree
// (backend/src) and against the test fixtures — and the test in
// tests/fronteiras/ proves that each rule rejects what it should.
//
// Source table: ADR-001, "Dependency rules" section:
//   domain/          -> only TypeScript and other domain/; no framework, ORM, I/O
//   application/     -> may use domain/; not infrastructure/ nor @nestjs/* (except pure type)
//   infrastructure/  -> may use anything; must not hold business rules (not checkable here)
//   <contexto>.module.ts -> may use anything: the only place that knows the concrete
// Plus ADR-002, rule 2: @prisma/client only in infrastructure/persistence/.

'use strict';

/**
 * @param {string} root  path, relative to repo root, of the context tree
 *                       (e.g. "backend/src" or "tests/fronteiras/fixtures/limpo")
 */
function createRules(root) {
  const r = root.replace(/\\/g, '/').replace(/\/$/, '');
  const DOMAIN = `^${r}/[^/]+/domain/`;
  const APPLICATION = `^${r}/[^/]+/application/`;
  const INFRA = `^${r}/[^/]+/infrastructure/`;
  const PERSISTENCE = `^${r}/[^/]+/infrastructure/persistence/`;
  const MODULE = '\\.module\\.ts$';

  return [
    {
      name: 'domain-imports-domain-only',
      comment: 'ADR-001: domain/ imports only other domain/ files. Nothing from application/, infrastructure/ or external.',
      severity: 'error',
      from: { path: DOMAIN, pathNot: MODULE },
      // No exception for `import type`: ADR-001 only tolerates pure types in
      // application/. HT-017 planted an `import type` of the contract in domain/
      // and the gate went green because of the exception that lived here.
      to: { pathNot: [DOMAIN, 'node_modules/(typescript|tslib)/'] },
    },
    {
      name: 'domain-avoids-workspace-transport',
      comment: 'HT-017: workspace packages (packages/*, e.g. @contacomigo/contrato) resolve via symlink, not node_modules — the npm rule does not see them. Transport never enters domain/ nor application/.',
      severity: 'error',
      from: { path: [DOMAIN, APPLICATION], pathNot: MODULE },
      // pnpm symlink may appear as packages/... or node_modules/@contacomigo/...
      to: { path: '(^|/)packages/|node_modules/@contacomigo/' },
    },
    {
      name: 'domain-no-framework-or-io',
      comment: 'ADR-001 / ADR-003: an import of @nestjs/*, @prisma/client, axios or any package inside domain/ breaks the gate.',
      severity: 'error',
      from: { path: DOMAIN },
      to: {
        dependencyTypes: ['npm', 'npm-dev', 'npm-peer', 'npm-optional', 'npm-no-pkg', 'npm-unknown', 'core'],
        pathNot: 'node_modules/(typescript|tslib)/',
      },
    },
    {
      name: 'application-avoids-infrastructure',
      comment: 'ADR-001: application/ may use domain/, never infrastructure/ nor framework (pure type of @nestjs/* is tolerated).',
      severity: 'error',
      from: { path: APPLICATION, pathNot: MODULE },
      to: {
        path: [INFRA, 'node_modules/(@nestjs/|@prisma/client/|prisma/|axios/)'],
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'prisma-only-in-persistence',
      comment: 'ADR-002, rule 2: @prisma/client is known only by infrastructure/persistence/.',
      severity: 'error',
      from: { path: `^${r}/`, pathNot: PERSISTENCE },
      to: { path: 'node_modules/@prisma/client/' },
    },
    {
      name: 'no-cycles',
      comment: 'Circular dependency between modules prevents clean reversal.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-unresolvable-import',
      comment: 'An import that does not resolve would escape the other rules by never becoming node_modules/...; it must fail on its own.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ];
}

const commonOptions = {
  // node_modules stays in doNotFollow, NEVER in "exclude": "exclude" removes the
  // package from the graph and with it the domain/ -> @nestjs/common edge that the
  // rules need to see. HT-009 planted a real import in domain/ and the gate went
  // green because of that; the evidence is in docs/tasks/HT-009/evidencia/.
  // The generated Prisma client (persistence/gerado, gitignored) is treated like
  // node_modules: the edge to it stays in the graph, but we do not enter it — it
  // has internal cycles that are not ours.
  doNotFollow: { path: ['node_modules', '/persistence/gerado/'] },
  exclude: { path: ['(^|/)(dist|coverage)/'] },
  tsPreCompilationDeps: true,
  tsConfig: { fileName: 'tsconfig.json' },
  enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require', 'node', 'default', 'types'], mainFields: ['module', 'main', 'types', 'typings'] },
  reporterOptions: { text: { highlightFocused: true } },
};

module.exports = { createRules, commonOptions };