// ============================================================
// PONTOS DE ATENÇÃO — call feat/uau-unidade-worker-setup → main
// ============================================================
//
// Branch:  feat/uau-unidade-worker-setup
// Commits: 3 (a5119b3 → fd60350 → 01c3717)
// Escopo:  Migração Services/Uau → Services/Erp + Workers ETL
//
// ============================================================



// ? ── DISCUSSÃO — confirmar intenção antes de fechar ────────


// ?     run.ts — runFirstInitial() executa automaticamente ao subir o ETL
// ?
// ?     Arquivo: src/Workers/run.ts (última linha)
// ?
// ?     (async () => await runFirstInitial())()
// ?
// ?     Warm-up intencional
// ?     process.env.RUN_INITIAL === 'true' && runFirstInitial()




// ! [] Lib/Uau.ts — refatoração sólida, pronta para produção
// *
// *     UauApiError:     erro customizado sem vazar dados sensíveis
// *     Auto-retry:      401 limpa cache Redis e retenta 1x (MAX_RETRY = 1)
// *     Timeout auth:    15s separado do timeout geral (45s)
// *     Erros normalizados: timeout | rede | 401 | HTTP 4xx/5xx


// ! [] Services/Erp — 100% migrados, zero consumers em Services/Uau
// *
// *     Customer:     9 métodos + recordCustomer/updateCustomer separados
// *     Development:  findAllDevelopments + findDevelopmentByCode
// *     Unit:         findAllUnits + findUnitsByCode + changeUnitStatus (novo)
// *     Services/Uau: pronta para deleção na call


// ! [] Workers/Erp — todos consumindo exclusivamente Services/Erp
// *
// *     UnitErpWorker:        imports legados removidos, tipos corrigidos
// *     DevelopmentErpWorker: comentário stale corrigido
// *     CustomerErpWorker:    path de cabeçalho corrigido

