# Venda UAU — Call de Alinhamento

> **Branch:** `feat/uau-venda-integration-test`
> **Objetivo da call:** validar modelo, decidir arquitetura, definir próximos passos.

---

## Status Atual

| Item | Status |
|---|---|
| Exploração da API         | ✅ 52 endpoints mapeados |
| `ConsultarResumoVenda`    | ✅ auditado — 20 vendas reais |
| `BuscarParcelasAReceber`  | ✅ auditado — padrão `.slice(1)` aplicado |
| `ConsultarParcelasDaVenda`| ⚠️ schema .NET mapeado — dados reais pendentes |
| `ExportarVendasXml`   | ✅ auditado |
| Worker ETL | ✅ `sale.uau.worker.ts` — resumo + parcelas em paralelo |
| Model Mongoose | ✅ `src/Models/Sale.ts` criado |

---

## Chave Universal

```
empresa  →  sempre 1
obra     →  "R0155", "R0123", "J0001" ...
numVen   →  número do contrato
```

**Status de uma venda:**

| Código | Significado |
|:---:|---|
| `0` | Normal |
| `1` | Cancelada |
| `3` | Quitada |
| `4` | Em acerto |
| `5` | Aluguel antecipado |

> ❓ **O worker só sincroniza `status=0` (Normal). Quitadas e canceladas entram no escopo?**

---

## O que o ERP entrega por venda

Dois endpoints, duas chamadas paralelas por venda no worker:

### 1 — `ConsultarResumoVenda` (snapshot financeiro)

| Campo | Significado |
|---|---|
| `totalAPagarComDesconto` | Saldo devedor atual |
| `parcelasportipo[]` | E / M / S — quantidade + valores a pagar e pagos |
| `totaisareceber[0].totalParcelasAtrasadas` | Parcelas vencidas não pagas **hoje** |
| `totaisareceber[0].percentualAtrasadas` | % das parcelas abertas em atraso |
| `totaisareceber[0].valorMulta` | Multas acumuladas |
| `totaisrecebido[0].totalRecebidasAtrasadas` | Histórico: pagas com atraso |
| `totaisrecebido[0].mediaDiasAdiantamento` | Histórico: dias médios de antecipação |

### 2 — `BuscarParcelasAReceber` (parcelas em aberto)

| Campo | Significado |
|---|---|
| `Data_Prc` | Vencimento atual |
| `Valor_Prc` | Valor nominal |
| `ValorReaj` | Valor corrigido pelo índice na data de sync |
| `EmBancoPrc` | `1` = boleto gerado no banco |
| `IdxReaj_Prc` | Índice aplicado (`"IGPM"`, `"INCC"`, ...) |
| `ValorMulta` / `vlrJurosAtraso` | Encargos por atraso |
| `nome_pes` | Nome do cliente — embutido na resposta |
| `Cliente_Prc` | `cod_pes` — FK para Customer |

> ⚠️ **Padrão crítico:** todo endpoint que retorna array tem `[0]` como schema .NET.
> Fix universal: `.slice(1)` no service antes de retornar.
> Confirmado em: `ConsultarParcelasDaVenda`, `BuscarParcelasAReceber`.

---

## Score de Adimplência

Calculado **localmente** a partir do resumo — sem chamada extra.

```typescript
function calcularScoreAdimplencia(resumo: ResumoVenda): number {
  const rec  = resumo.totaisareceber[0];
  const pago = resumo.totaisrecebido[0];

  const penalidade =
    (rec?.totalParcelasAtrasadas  ?? 0) * 10 +   // -10 por parcela atrasada hoje
    (rec?.percentualAtrasadas     ?? 0) *  2 +   // -2  por % de atraso atual
    (pago?.percentualRecebidasAtrasadas ?? 0) * 1; // -1  por % histórico de atraso

  const bonus =
    (pago?.percentualRecebidasAdiantadas ?? 0) * 0.5; // bom pagador

  return Math.max(0, Math.min(100, 100 - penalidade + bonus));
}
```

**Classificação rápida:**

| Score | Perfil |
|:---:|---|
| `totalParcelasAtrasadas = 0` | 🟢 Verde — Adimplente |
| `1 a 3 atrasadas` | 🟡 Amarelo — Atenção |
| `> 3 atrasadas` | 🔴 Vermelho — Inadimplente |

> ❓ **Essa fórmula é suficiente para o produto atual? Ou precisamos de outra granularidade?**
> ❓ **O score precisa ser visível para o cliente final no app? Ou é interno?**

---

## Amostra Real da Auditoria

> **R0155 / Venda 15** — contrato ativo com boleto gerado (`EmBancoPrc = 1`)

| Indicador | Valor |
|---|---|
| Saldo devedor | R$ 60.364 |
| Parcelas mensais em aberto | 94 |
| Valor mensal atual (IGPM) | R$ 350,65 |
| Taxa de boleto por parcela | R$ 2,50 |
| Pagas no histórico | 59 total |
| Pagas com atraso | 38 (64%) → **alto risco** |
| Dias médios de antecipação | 256 — paradoxo: quando antecipa, antecipa muito |

> ❓ **Caso real: 64% de atraso histórico + 256 dias de antecipação média. Como tratar esse paradoxo no score?**

---

## Modelo Proposto — `Sale.ts`

> Arquivo: `src/Models/Sale.ts`

**Chave de upsert:** `{ empresa, obra, numeroVenda }` — compound unique index

```
Venda
 ├── Snapshot financeiro       ← ConsultarResumoVenda
 │    ├── saldoDevedor
 │    ├── parcelasAtrasadas
 │    ├── scoreAdimplencia      ← calculado localmente
 │    └── parcelasEntrada / Mensal / Sinal  (resumo por tipo)
 │
 └── parcelasAbertas[]         ← BuscarParcelasAReceber
      ├── vencimento
      ├── valorAtualizado
      ├── temBoleto
      ├── indice
      └── codCliente            ← FK → Customer.code_person
```

**Índices:**

| Índice | Motivo |
|---|---|
| `{ empresa, obra, numeroVenda }` unique | Upsert key |
| `{ obra, numeroVenda }` | Cross-reference com Unidade |
| `{ scoreAdimplencia }` | Queries de risco de carteira |
| `{ parcelasAtrasadas }` | Filtrar inadimplentes |

---

## Relações entre Collections

```
Sale.obra + Sale.numeroVenda  ←→  Unidade.Num_Ven
Sale.parcelasAbertas[n].codCliente  ←→  Customer.code_person
```

> ❓ **A Unidade já guarda `Num_Ven`. Fazemos lookup no backend ou desnormalizamos o CPF na Sale também?**
> ❓ **Quando uma unidade muda de status (vendida → disponível), a Sale precisa ser tombada?**

---

## Volume e Capacidade

| Cenário | Vendas ativas | Tempo de sync completo |
|---|---|---|
| Conservador | ~25.000 | ~4–6h (CHUNK=10, 2 calls/venda) |
| Realista | ~18.000 | ~3–4h |

**Delta diário:** janela de 30 dias → capta novos contratos + renegociações.
**On-demand:** `POST /sync/venda/:obra/:numVen` → refresh individual.

> ❓ **Qual a frequência aceitável de defasagem dos dados para o produto?**
> ❓ **O cliente abre o app e vê dados de ontem — isso é aceitável?**

---

## ⚠️ Pontos de Atenção Arquitetural

**1. Parcelas embutidas vs. collection separada**

Embedding (atual): 94 parcelas × campos essenciais ≈ 50–100KB/documento.
Dentro do limite 16MB MongoDB. Leitura O(1). Simples.

Separado: queries mais flexíveis, mas join necessário.

> ❓ **Precisamos de queries cross-venda por data de vencimento? (ex: "todas as parcelas vencendo esta semana")**
> Se sim → collection separada faz mais sentido.

**2. Histórico de snapshots**

O modelo atual só guarda o estado atual (upsert sempre sobrescreve).
Se quisermos comparar saldo de hoje vs. 30 dias atrás, precisamos de histórico.

> ❓ **Histórico de inadimplência ao longo do tempo é requisito?**

**3. Renegociação**

UAU tem endpoints de renegociação (`RenegociarVenda`, `BuscaParcRenegWeb`).
Quando uma venda é renegociada, as parcelas mudam completamente.
O delta de 30 dias captura — mas o timing pode gerar inconsistência transitória.

> ❓ **O produto precisa reagir a uma renegociação em tempo real ou o delta de 24h é aceitável?**

**4. Boleto**

`GerarBoletoBancario` existe na UAU. `EmBancoPrc = 1` indica boleto já gerado.
O backend vai gerar boletos ou apenas exibir o que a UAU já gerou?

> ❓ **Geração de boleto é responsabilidade do backend ou fica na UAU?**

---

## Endpoints Ainda não Auditados

| Endpoint | Prioridade | Por que importa |
|---|---|---|
| `ConsultarParcelasDaVenda` | Alta | Usar R0155/15 — `EmBancoPrc=1` confirmado |
| `ConsultarUnidadesCompradasPorCPFCNPJ` | Média | Cross-reference cliente ↔ unidades ↔ vendas |
| `ConsultarHistoricos` | Baixa | Histórico de renegociações e manutenções |
| `BuscarParcelasRecebidas` | Baixa | Histórico de pagamentos |

---

## Próximos Passos (pós-call)

- [ ] Implementar `formatSaleAndSave()` no worker — transformar `SaleSnapshot` → `Sale`
- [ ] Implementar `calcularScoreAdimplencia()` — pode ser `src/Utils/scoreAdimplencia.ts`
- [ ] Registrar `SaleUauWorker` no cron — horário: 02:00
- [ ] Endpoint on-demand `POST /sync/venda/:obra/:numVen`
- [ ] Auditar `ConsultarParcelasDaVenda` com R0155/15
- [ ] Limpar bloco de auditoria do `src/server.ts`
