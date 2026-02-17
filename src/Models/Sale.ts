// src/Models/Sale.ts
//
// * Entidade MongoDB — Venda (sincronizada do ERP UAU)
//
// Fontes de dados:
//   ConsultarResumoVenda    → snapshot financeiro (saldo, inadimplência, score)
//   BuscarParcelasAReceber  → parcelas em aberto com valores calculados
//
// Chave de upsert: { empresa, obra, numeroVenda }
// Sincronizado por: SaleUauWorker (cron noturno + delta 30 dias)
// Referências:
//   obras       → via obra (string)
//   unidades    → via obra + numeroVenda  ←→  Unidade.Num_Ven
//   clientes    → via parcelasAbertas[0].codCliente  ←→  Customer.code_person

import mongoose, { Schema } from "mongoose";

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

export type ParcelaAberta = {
  numParc: number;       // número da parcela dentro do grupo de vencimento
  numParcGer: number;    // identificador único no contrato (NumParcGer_Prc)
  tipo: string;          // "E"=Entrada | "M"=Mensal | "S"=Sinal | "1"=Custas
  vencimento: string;    // data de vencimento atual (Data_Prc — ISO)
  valor: number;         // valor nominal (Valor_Prc)
  valorAtualizado: number; // valor corrigido pelo índice na data de sync (ValorReaj)
  taxaBoleto: number;    // taxa bancária por parcela (ValorTaxaBol_prc)
  temBoleto: boolean;    // EmBancoPrc === 1 → boleto gerado no banco
  indice: string;        // índice de reajuste ("IGPM", "INCC", "IPCA", ...)
  jurosAtraso: number;   // juros de mora acumulados (vlrJurosAtraso)
  multa: number;         // multa acumulada (ValorMulta)
  codCliente: number;    // Cliente_Prc → referência ao Customer.code_person
};

export type ResumoPortipo = {
  aPagar: number;        // quantidade de parcelas a pagar
  pagas: number;         // quantidade de parcelas pagas
  totalAPagar: number;   // valor total ainda a pagar
  totalPago: number;     // valor total já pago
};

export type StatusVenda = 0 | 1 | 3 | 4 | 5;
// 0=Normal | 1=Cancelada | 3=Quitada | 4=Em acerto | 5=Aluguel antecipado

// ─── Interface principal ──────────────────────────────────────────────────────

export interface SaleType {
  _id?: string;

  // ── Identidade (chave de upsert — compound unique index)
  empresa: number;        // sempre 1 no contexto atual
  obra: string;           // ex: "R0155"
  numeroVenda: number;    // número do contrato

  // ── Snapshot financeiro (de ConsultarResumoVenda)
  dataCalculo: string;    // data de referência do cálculo UAU (ISO)
  saldoDevedor: number;   // totaisareceber[0].valorSaldoDevedor
  totalParcelas: number;
  parcelasAtrasadas: number;    // totaisareceber[0].totalParcelasAtrasadas
  percentualAtrasadas: number;  // totaisareceber[0].percentualAtrasadas
  valorMulta: number;           // totaisareceber[0].valorMulta
  valorJurosAtraso: number;     // totaisareceber[0].valorJurosAtraso
  totalRecebido: number;        // totaisrecebido[0].valorTotalRecebido
  histAtrasadas: number;        // totaisrecebido[0].totalRecebidasAtrasadas
  mediaDiasAdiantamento: number; // totaisrecebido[0].mediaDiasAdiantamento

  // ── Score de adimplência (calculado localmente — VENDA_STUDY.md seção 9.4)
  scoreAdimplencia: number; // 0–100 | 100 = adimplente perfeito

  // ── Resumo por tipo de parcela (de parcelasportipo[])
  parcelasEntrada: ResumoPortipo;
  parcelasMensal: ResumoPortipo;
  parcelasSinal: ResumoPortipo;

  // ── Parcelas em aberto (de BuscarParcelasAReceber — embutidas)
  // Objetivo: extrato completo sem depender da UAU para leitura
  parcelasAbertas: ParcelaAberta[];

  // ── Controle de sync
  syncedAt: Date;         // timestamp da última sincronização pelo worker
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Sub-schemas (sem _id para documentos embutidos) ─────────────────────────

const ParcelaAbertaSchema = new Schema<ParcelaAberta>(
  {
    numParc: { type: Number, required: true },
    numParcGer: { type: Number, required: true },
    tipo: { type: String, required: true },
    vencimento: { type: String, required: true },
    valor: { type: Number, required: true },
    valorAtualizado: { type: Number, required: true },
    taxaBoleto: { type: Number, default: 0 },
    temBoleto: { type: Boolean, default: false },
    indice: { type: String, default: "" },
    jurosAtraso: { type: Number, default: 0 },
    multa: { type: Number, default: 0 },
    codCliente: { type: Number, required: true },
  },
  { _id: false }
);

const ResumoPortipoSchema = new Schema<ResumoPortipo>(
  {
    aPagar: { type: Number, required: true },
    pagas: { type: Number, required: true },
    totalAPagar: { type: Number, required: true },
    totalPago: { type: Number, required: true },
  },
  { _id: false }
);

// ─── Schema principal ─────────────────────────────────────────────────────────

const SaleSchema = new Schema<SaleType>(
  {
    // ── Identidade
    empresa: { type: Number, required: true },
    obra: { type: String, required: true, trim: true },
    numeroVenda: { type: Number, required: true },

    // ── Snapshot financeiro
    dataCalculo: { type: String, required: true },
    saldoDevedor: { type: Number, required: true },
    totalParcelas: { type: Number, required: true },
    parcelasAtrasadas: { type: Number, default: 0 },
    percentualAtrasadas: { type: Number, default: 0 },
    valorMulta: { type: Number, default: 0 },
    valorJurosAtraso: { type: Number, default: 0 },
    totalRecebido: { type: Number, default: 0 },
    histAtrasadas: { type: Number, default: 0 },
    mediaDiasAdiantamento: { type: Number, default: 0 },

    // ── Score
    scoreAdimplencia: { type: Number, required: true, min: 0, max: 100 },

    // ── Parcelas por tipo
    parcelasEntrada: { type: ResumoPortipoSchema, required: true },
    parcelasMensal: { type: ResumoPortipoSchema, required: true },
    parcelasSinal: { type: ResumoPortipoSchema, required: true },

    // ── Parcelas abertas
    parcelasAbertas: { type: [ParcelaAbertaSchema], default: [] },

    // ── Sync
    syncedAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Índices ──────────────────────────────────────────────────────────────────

// Chave de upsert — par único por contrato
SaleSchema.index({ empresa: 1, obra: 1, numeroVenda: 1 }, { unique: true });

// Cross-reference com Unidade (Unidade.Num_Ven = Sale.numeroVenda para uma dada obra)
SaleSchema.index({ obra: 1, numeroVenda: 1 });

// Queries de inadimplência / risco de carteira
SaleSchema.index({ scoreAdimplencia: 1 });
SaleSchema.index({ parcelasAtrasadas: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const Sale =
  mongoose.models.Sale || mongoose.model<SaleType>("Sale", SaleSchema);

export default Sale;
