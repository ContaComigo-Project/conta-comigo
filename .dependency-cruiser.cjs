// Checagem de fronteiras de producao (ADR-001 / ADR-002). Roda em `harness lint`.
// As regras vivem em tooling/fronteiras/regras.cjs, compartilhadas com o teste
// que prova que elas bloqueiam (tests/fronteiras/fronteiras.test.ts).
'use strict';
const { criarRegras, opcoesComuns } = require('./tooling/fronteiras/regras.cjs');

module.exports = {
  forbidden: criarRegras('backend/src'),
  options: {
    ...opcoesComuns,
    // Fixtures sao codigo deliberadamente ilegal: fora do lint de producao.
    exclude: { path: ['(^|/)(dist|coverage|node_modules)/', '^tests/fronteiras/fixtures/'] },
  },
};
