// Config do dependency-cruiser para as FIXTURES de tests/fronteiras/.
// A raiz de contextos e inferida do alvo passado na linha de comando, para que
// a mesma fabrica de regras sirva a arvore "violacao" e a arvore "limpo".
'use strict';
const { criarRegras, opcoesComuns } = require('./regras.cjs');

const alvo = process.argv.find((a) => a.includes('tests/fronteiras/fixtures/'));
const raiz = alvo ? alvo.replace(/\\/g, '/').replace(/\/+$/, '') : 'tests/fronteiras/fixtures/limpo';

module.exports = { forbidden: criarRegras(raiz), options: opcoesComuns };
