// Production boundary check (ADR-001 / ADR-002). Runs on `harness lint`.
// The rules live in tooling/boundaries/regras.cjs, shared with the test that
// proves they block (tests/boundaries/boundaries.test.ts).
'use strict';
const { createRules, commonOptions } = require('./tooling/boundaries/regras.cjs');

module.exports = {
  forbidden: createRules('backend/src'),
  options: {
    ...commonOptions,
    // Fixtures are deliberately illegal code: outside the production lint.
    // node_modules does NOT belong here — see comment in commonOptions.
    exclude: { path: [...commonOptions.exclude.path, '^tests/boundaries/fixtures/'] },
  },
};