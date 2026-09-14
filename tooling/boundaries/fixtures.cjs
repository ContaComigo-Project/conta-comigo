// dependency-cruiser config for the tests/boundaries/ FIXTURES.
// The context root is inferred from the target passed on the command line, so
// the same rule factory serves both the "violation" and the "clean" trees.
'use strict';
const { createRules, commonOptions } = require('./regras.cjs');

const alvo = process.argv.find((a) => a.includes('tests/boundaries/fixtures/'));
const raiz = alvo ? alvo.replace(/\\/g, '/').replace(/\/+$/, '') : 'tests/boundaries/fixtures/clean';

module.exports = { forbidden: createRules(raiz), options: commonOptions };