// ============================================================
// PONTOS DE ATENÇÃO — call feat/uau-unidade-worker-setup → main
// ============================================================
//
// Branch atual: feat/uau-unidade-worker-setup
// Commits:      4 (a5119b3 → fd60350 → 01c3717 → cc92d1b)
// Escopo:       Migração Services/Uau → Services/Erp + Workers ETL
//
// Próxima branch: feat/unit (persistência completa da Unidade)
//
// ============================================================


// * ── PONTO 01 | O QUE FOI FEITO  ────────────────────────────────


// * [] run.ts — warm-up controlado por variável de ambiente
// *     RUN_INITIAL=true no .env ativa o ETL inicial ao subir o processo
// *     (async () => process.env.RUN_INITIAL === 'true' && await runFirstInitial())()


// * [] Lib/Uau.ts — refatoração sólida, pronta para produção
// *     UauApiError:     erro customizado sem vazar dados sensíveis
// *     Auto-retry:      401 limpa cache Redis e retenta 1x (MAX_RETRY = 1)
// *     Timeout auth:    15s separado do timeout geral (45s)
// *     Erros normalizados: timeout | rede | 401 | HTTP 4xx/5xx


// * [] Services/Erp — 100% migrados, zero consumers em Services/Uau
// *     Customer:     9 métodos + recordCustomer/updateCustomer separados
// *     Development:  findAllDevelopments + findDevelopmentByCode
// *     Unit:         findAllUnits + findUnitsByCode + changeUnitStatus (novo)
// *     Services/Uau: pronta para deleção na call


// * [] Workers/Erp — todos consumindo exclusivamente Services/Erp
// *     UnitErpWorker:        imports legados removidos, tipos corrigidos
// *     DevelopmentErpWorker: comentário stale corrigido
// *     CustomerErpWorker:    path de cabeçalho corrigido




// ============================================================
// PAUTA DA CALL — feat/unit (persistência de Unidade)
// ============================================================


// ! ── DECISÕES DE ARQUITETURA

// ! [1] Schema da Unit — como tratar as colunas genéricas C1-C45?
// !
// !     O ERP UAU retorna 45 colunas genéricas (C1_unid até C45_unid).
// !     Mapeamento conhecido: C1=Quadra, C2=Lote, C5=Número, C6=Bairro.
// !     C8–C45 variam por empreendimento (podem ser vazias ou 'null').
// !
// !     Opção A — Flat: persistir todos os campos C1–C45 individualmente
// !       + fácil de indexar e filtrar por campo específico
// !       - schema grande (~45 campos extras no documento)
// !
// !     Opção B — Map: persistir como objeto { c1: val, c2: val, ... }
// !       + schema menor, flexível
// !       - não indexável diretamente, queries mais complexas
// !
// !     Opção C — Híbrido: campos nomeados (quadra, lote, numero, bairro)
// !       + semântico, reflete o domínio do negócio
// !       - acoplamento ao mapeamento atual (pode mudar por empreendimento)


// ! [2] Chave composta — índice único no MongoDB
// !
// !     Chave de upsert: Prod_unid + NumPer_unid (par único por unidade no UAU)
// !     Decisão: índice composto único ou campo derivado como _id?
// !
// !     Opção A — Índice composto: { prod_unid: 1, num_per_unid: 1 } unique
// !       + mantém _id nativo do MongoDB
// !       + padrão adotado em Customer (code_person unique)
// !
// !     Opção B — _id derivado: `${prod_unid}-${num_per_unid}`
// !       + evita index extra, lookup direto por _id
// !       - perde auto-geração do Mongo, acoplamento ao ERP


// ! [3] Relacionamento com Customer
// !
// !     Customer possui o campo enterprise: string[] (array de obras)
// !     Unit possui Obra_unid e Num_Ven (número da venda)
// !
// !     Decisão: a Unit deve referenciar o Customer diretamente?
// !     Ou o vínculo é feito pela rota/controller no momento da consulta?
// !
// !     Impacta: design do schema Unit e queries da API


// ? ── DISCUSSÃO — alinhar escopo da branch feat/unit ────────


// ?     O que entra na feat/unit? Sugestão de escopo mínimo:
// ?
// ?     Obrigatório (ETL funciona):
// ?       [ ] Model/Schema Unit (MongoDB + Mongoose)
// ?       [ ] UnitController.registerBatchesUnit() — batch upsert
// ?       [ ] Implementar bloco de persistência no UnitErpWorker
// ?
// ?     Desejável (API consulta):
// ?       [ ] UnitController: findByObra, findByStatus, listAll paginado
// ?       [ ] unit.routes.ts registrada em routes.ts
// ?
// ?     Próxima branch (escopo separado):
// ?       [ ] Rota PATCH /unit/status — integra API → changeUnitStatus → ERP
// ?       [ ] Relacionamento Unit ↔ Customer via Num_Ven


// * ── REFERÊNCIA — padrão de implementação (replicar de Customer) ─


// *     Caminho de referência completo:
// *
// *     src/Models/Customer.ts              → replicar para Unit.ts
// *     src/Controllers/customer.controller.ts  → replicar para unit.controller.ts
// *     src/Routes/customer.routes.ts       → replicar para unit.routes.ts
// *     src/Routes/routes.ts                → registrar routes.use("/unit", unitRoutes)
// *
// *     Método-chave de referência: CustomerController.registerBatchesUnit()
// *       — loop sequencial, reutiliza upsert, rastreia sucesso/falha


// TODO: ── MENORES / FOLLOW-UP ──────────────────────────────


// TODO: Deletar Services/Uau após merge da feat/uau-unidade-worker-setup
// TODO: Adicionar RUN_INITIAL=false ao .env de dev/produção nos ambientes

