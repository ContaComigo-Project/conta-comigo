---
name: open-finance-security-agent
description: Gate especialista em segurança de Open Finance — consentimento, credencial do agregador, isolamento entre titulares, retenção e eliminação de dado financeiro.
document_type: skill
role: gate / especialista de domínio
applies_when:
  - história toca consentimento, conexão com instituição ou sincronização
  - história persiste, exibe, exporta ou envia a IA dado vindo de instituição financeira
  - história cria rota que devolve dado de uma pessoa
uses_rules:
  - test-evidence-quality
  - architecture-boundaries-and-solid
complements:
  - security-specialist-agent
complemented_by:
  - final-reviewer-agent
  - qa-agent
outputs:
  - seção Gates do documento de entrega
  - lista de testes negativos exigidos
max_lines: 300
---

# Skill — Segurança de Open Finance

## Responsabilidade única

O `security-specialist-agent` pergunta o que um atacante consegue fazer.
Esta skill pergunta outra coisa: **o titular consentiu com isto, e o dado dele
está indo só para onde ele autorizou?**

Dado de Open Finance tem três propriedades que mudam o julgamento: ele **não é
nosso** (pertence ao titular, cedido por prazo e finalidade), ele **é
reidentificável** (saldo e lançamento identificam uma pessoa mesmo sem nome), e
o acesso a ele **expira**. Um sistema que trata esse dado como qualquer outro
registro está errado mesmo quando está seguro.

Não substitui o gate de segurança geral — roda junto com ele.

## 1. O produto nunca vê credencial bancária

O modelo de Open Finance é **redirecionamento**: quem autentica a pessoa é a
instituição, não nós. O ContaComigo fala com o agregador (`ADR` do adaptador
Pluggy), e o agregador com o banco.

Reprova na hora, sem discussão:

- campo de senha, agência ou token do banco em qualquer tela, DTO ou tabela;
- qualquer fluxo que peça à pessoa a credencial do banco "para conectar";
- log, print ou mensagem de erro que carregue credencial de instituição.

O que **pode** existir do lado de cá é a credencial **do agregador** (item,
token de conexão), que é nossa e obedece à seção 3.

## 2. Consentimento é dado de primeira classe

Consentimento não é um booleano em `usuario`. É registro próprio, com:

| Atributo | Por quê |
| --- | --- |
| Titular e instituição | `RN-014`: no máximo um ativo por instituição por pessoa |
| Escopo (o que foi autorizado) | Sincronizar conta não autoriza ler cartão |
| Início e **expiração** | `RN-012`: consentimento expirado equivale a ausente |
| Status e momento da revogação | `RN-013`: revogar tem efeito imediato no painel |

Checagens do gate:

1. **Toda leitura de dado de instituição consulta o consentimento antes**, no
   servidor. Consentimento ausente, expirado ou revogado ⇒ o dado não existe
   para aquela requisição.
2. **Expiração é verificada contra o relógio injetado** (porta `Relogio` de
   `ADR-001`), nunca contra `new Date()` espalhado — senão não há como testar.
3. **Reconectar substitui, não acumula** (`RN-014`). Dois consentimentos ativos
   para a mesma instituição é bug de dado, não estado válido.
4. **Revogar não é `UPDATE status`.** `RN-013` exige sumiço imediato do painel e
   exclusão definitiva agendada; a história precisa dizer qual é o prazo e o que
   acontece com sincronização em andamento.

Cenário mínimo esperado:

```gherkin
Cenário: consentimento expirado não devolve dado
  Dado um consentimento que expirou ontem
  Quando o painel pede os lançamentos daquela instituição
  Então a resposta não contém lançamento algum
  E o motivo é a ausência de consentimento, não uma lista vazia
```

## 3. Credencial do agregador é segredo em repouso

Token de conexão e identificador de item do agregador são credenciais de acesso
a dado financeiro de terceiro. Tratamento obrigatório:

- **Cifrados em repouso** na borda da persistência (`RNF-014`, `ADR-002` r.4).
  A chave vem de variável de ambiente, nunca do repositório.
- **Nunca em log**, nem truncados: prefixo de token ainda é material de ataque.
- **Nunca no contrato web↔API.** A web não precisa deles para desenhar tela; se
  um DTO carrega token, o gate reprova.
- **Rotação possível** sem migração manual de dado.

## 4. Isolamento entre titulares (`RN-015`)

A regra mais fácil de violar sem perceber: `GET /lancamentos/:id` que busca por
id e devolve o que achar. Se o id de outra pessoa retorna conteúdo, a barreira
não existe.

Padrão exigido:

- **O titular vem da sessão, nunca do parâmetro.** `?titularId=` no request é
  vetor de ataque, não funcionalidade.
- **O filtro por titular acontece na consulta**, não depois em memória — filtrar
  depois já vazou pelo log e pela métrica.
- **Recurso de outro titular responde como inexistente.** Distinguir "não é seu"
  de "não existe" confirma ao atacante que o id é válido.

Teste negativo obrigatório **por rota** (`RNF-013`), sem exceção:

| Caso | Resposta esperada |
| --- | --- |
| Sem credencial | Recusa de autenticação |
| Credencial de outro titular | Mesma resposta de recurso inexistente |
| Credencial válida, recurso próprio | Conteúdo |

Rota nova sem esses três casos: **reprovado**. Não há "adiciono o teste depois".

## 5. Log e telemetria não carregam dado financeiro (`RNF-015`)

Vale para log de aplicação, log de erro, rastro de exceção, métrica, mensagem de
fila e payload enviado a serviço externo de observabilidade.

Nunca aparecem em texto claro: valor de lançamento, saldo, descrição de
lançamento, número de conta ou cartão, documento pessoal, e-mail, nome do
titular, token de qualquer natureza.

O que **pode** aparecer: identificador opaco do recurso, identificador do
titular, nome da operação, duração, resultado. Isso basta para investigar.

Sinal de violação recorrente: `console.log(objeto)` ou
`logger.error(err, { request })` — o objeto inteiro vaza tudo que ele carrega.
O gate procura por serialização de objeto de domínio em log.

## 6. Minimização, retenção e eliminação

1. **Só sincronize o que uma história aprovada usa.** Trazer "todo o histórico
   porque a API oferece" cria passivo sem finalidade.
2. **Prazo declarado.** Todo dado financeiro persistido tem resposta para "por
   quanto tempo fica e o que o apaga".
3. **Eliminação real** (`RN-016`): excluir conta apaga ou anonimiza dado pessoal
   **e** financeiro, incluindo cópias em cache, fila e índice de busca.
   Anonimizar significa que o registro deixa de ser reidentificável — remover o
   nome e manter valor, data e instituição não anonimiza nada.
4. **Derivados contam.** Insight de IA, resumo e exportação gerados a partir do
   dado também precisam sumir.

## 7. Fronteira com a IA

Reforça `RN-017` a `RN-019`, do lado do dado:

- O provedor de IA recebe o **mínimo** necessário, e a história declara
  exatamente quais campos saem.
- Identificador direto do titular não vai para o modelo.
- Resposta de IA nunca é a fonte de um número financeiro exibido (`RN-019`).
- Dado de um titular jamais aparece na resposta gerada para outro (`RN-015`
  vale também para a saída do modelo).

## Roteiro do gate

1. A história cria ou toca rota que devolve dado de pessoa? → seção 4, com os
   três testes negativos.
2. Toca consentimento? → seção 2, com o cenário de expiração.
3. Persiste credencial de agregador? → seção 3.
4. Escreve log novo? → seção 5.
5. Sincroniza ou guarda dado novo? → seção 6, com prazo declarado.
6. Manda algo ao provedor de IA? → seção 7, com a lista de campos.

## Veredito

| Resultado | Condição |
| --- | --- |
| Aprovado | Itens aplicáveis do roteiro atendidos, com teste negativo em disco |
| Aprovado com ressalva | Lacuna sem exposição de dado, registrada com dono e história |
| Reprovado | Credencial bancária pedida ou armazenada; dado de um titular acessível a outro; leitura sem verificar consentimento; credencial de agregador em claro ou em log; dado financeiro em log |

Reprovação por exposição de dado **não** aceita ressalva: volta para
`Em execução`.

## Antipadrões

- Consentimento como campo booleano em usuário.
- Verificar expiração só na tela.
- `titularId` vindo do corpo ou da query da requisição.
- Filtrar por titular em memória, depois de buscar tudo.
- Responder 403 para recurso de outro titular (confirma que o id existe).
- Logar o objeto de erro inteiro "só em desenvolvimento".
- Guardar payload bruto do agregador "para depurar depois".
