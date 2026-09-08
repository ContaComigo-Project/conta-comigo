// dependency-cruiser config for the tests/fronteiras/ FIXTURES.
// The context root is inferred from the target passed on the command line, so
// the same rule factory serves both the "violacao" and the "limpo" trees.
'use strict';
const { createRules, commonOptions } = require('./regras.cjs');

const alvo = process.argv.find((a) => a.includes('tests/fronteiras/fixtures/'));
const raiz = alvo ? alvo.replace(/\\/g, '/').replace(/\/+$/, '') : 'tests/fronteiras/fixtures/limpo';

module.exports = { forbidden: createRules(raiz), options: commonOptions };