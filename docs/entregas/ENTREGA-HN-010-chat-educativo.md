---
name: entrega-hn-010
description: Documento de entrega da HN-010 — chat educativo que responde dúvidas sobre os próprios números, sempre acompanhado do aviso de não aconselhamento financeiro.
document_type: delivery
story_key: HN-010
version: v0.30.0
max_lines: 300
---

# ENTREGA — `HN-010` — Chat educativo com aviso permanente

- **Data:** 2026-09-09
- **Tipo:** Negócio
- **Versão:** `v0.30.0`
- **Commit:** `[preenchido no fechamento]`
- **Tag:** `v0.30.0` → `[mesmo hash]`

## O que foi entregue

- **Chat educativo (RF-020)**: `POST /intelligence/chat` responde dúvidas em
  linguagem simples usando **os próprios números da pessoa** — o modelo recebe o
  resumo do gasto por categoria (agregado, sem identidade) e a guarda de saída
  valida o texto (RN-017/RN-019).
- **Aviso permanente (RF-021/RN-018)**: toda resposta `ok` carrega o aviso de
  não aconselhamento — entregue pelo backend junto da resposta, para a tela não
  conseguir esquecê-lo.
- **Degradação (RN-021)**: provedor indisponível, teto diário ou resposta
  bloqueada (ex.: tentativa de recomendação de produto) viram **estado
  estruturado**, nunca erro.

## Requisitos atendidos

| Requisito | Como foi atendido | Evidência |
| --- | --- | --- |
| `RF-020` — responder dúvidas sobre os próprios números | Resumo do gasto da pessoa enviado ao modelo; resposta com linguagem simples | teste (payload) |
| `RF-021` — aviso permanente em toda superfície de IA | Aviso entregue em toda resposta `ok` | teste RN-018 + API |
| `RN-018` — aviso não pode ser omitido | Backend entrega o aviso junto da resposta | teste |
| `RN-019` — número vem dos dados | Payload só com `categoria`/`totalEmCentavos`, sem identidade | teste |
| `RN-017` — sem recomendação de produto | Guarda de saída bloqueia; estado `ia-bloqueou` | teste |
| `RN-021` — falha do provedor degrada | `ia-indisponivel` / `teto-atingido` | testes |

## Critérios de aceite

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Resposta usa dado da pessoa e linguagem sem jargão | Aprovado | resumo do gasto no payload |
| Aviso visível em toda superfície com saída de IA | Aprovado | aviso em toda resposta `ok` |
| Aviso não pode ser fechado/rolado para fora | Aprovado (UI) | widget fixo; backend obriga o aviso |

## Evidência de verificação

```
$ curl POST /intelligence/chat -H "Bearer <token>" -d '{"pergunta":"Onde estou gastando mais?"}'
  → {"estado":"ok","resposta":"Esta e uma resposta simulada, apenas educativa: ...",
     "aviso":"O Consultor IA é educativo e usa seus números, mas não é aconselhamento
              financeiro. Não recomenda produtos, investimentos, crédito ou instituições. ..."}
```

## Evidência de testes

```
$ pnpm run test:unit
 Test Files  54 passed (54)   Tests  308 passed (308)

$ pnpm run test:integration
 Test Files  4 passed (4)     Tests  22 passed (22)

$ pnpm run test:functional
 3 passed

$ pnpm run lint:boundaries
✔ no dependency violations found

$ pnpm run build   → ✓ built   |  auditoria: 100%
```

## Refatoração feita após os funcionais verdes

Foi corrigido um bug de bootstrap: o `TokenIdentity` do `TransactionsModule`
depende do `TokenIssuer` (AccessModule), então o `IntelligenceModule` precisou
importar também o `AccessModule` — a API não resolvia a dependência e o chat
respondia 500. O aviso de não aconselhamento vive no domínio
(`AVISO_DE_NAO_ACONSELHAMENTO`), compartilhado por qualquer superfície de IA.

## Gates

| Gate | Responsável | Resultado | Observação |
| --- | --- | --- | --- |
| QA | `qa-agent` | Aprovado | RF-020/RN-018/RN-021 provadas com teste; payload inspecionado |
| Segurança | `open-finance-security-agent` | Aprovado | IA sem identidade; guarda RN-017/019 |
| SRE | `sre-agent` | Aprovado | API sobe; degradação estruturada; teto diário respeitado |
| Arquitetura | `architect-reviewer-agent` | Aprovado | Regra no domínio; portas da IA reutilizadas; fronteiras intactas |
| Revisão final | `final-reviewer-agent` | Aprovado | Critérios com evidência; MINOR (`v0.30.0`) |

## Decisões tomadas durante a execução

| Decisão | Motivo | Impacto futuro |
| --- | --- | --- |
| Aviso entregue pelo backend junto da resposta | RN-018 não depende da boa vontade da tela | Toda superfície herda o aviso |
| Endpoint no contexto `intelligence` | O chat é saída de IA; guard e identidade próprios | Uma rota para o `AIChatWidget` |
| Resumo top-5 por categoria | RF-020 com dado da pessoa, sem expor identificadores | Padrão para `pergunta-livre` |

## Dívida assumida

| Item | Motivo | Onde foi registrada |
| --- | --- | --- |
| Trocar `generateMockReply` pelo endpoint real no widget | Integração via `HT-018` | Kanban |
| Aviso não-fechável persistente na UI | Já presente no widget; revisar em `HT-018` | Kanban |

## Verificação de fechamento

- [ ] Testes e gates aplicáveis verdes
- [ ] Commit semântico contém a chave `HN-010`
- [ ] Commit não contém arquivos de outra história
- [ ] Tag `v0.30.0` aponta para o mesmo hash do commit
- [ ] `KANBAN-OFICIAL.md` atualizado