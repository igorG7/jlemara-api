// Tipos derivados da análise do Swagger UAU — seção Venda
// Branch: feat/uau-venda-integration-test
// Auditoria de responses reais: src/Services/Uau/Sale/samples/

// ─── Chave de identificação de uma Venda ─────────────────────────────────────

export type ChaveVenda = {
  Empresa: number;
  Obra: string;
  Venda: number;
};

export type EmpresaObra = {
  codigoEmpresa: number;
  codigoObra: string;
};

// ─── RetornaChavesVendasPorPeriodo ────────────────────────────────────────────

export type RetornaChavesVendasRequest = {
  data_inicio?: string;
  data_fim?: string;
  status_escrituracao?: boolean;
  statusVenda?: string; // "0"=Normal, "1"=Cancelada, "3"=Quitada, "4"=Em acerto, "5"=Aluguel antecipado
  listaEmpresaObra?: EmpresaObra[];
};

// Response: string no formato "01-R001/00001,01-R001/00002,..."
export type RetornaChavesVendasResponse = string;

// ─── ExportarVendasXml ────────────────────────────────────────────────────────

export type ExportarVendasXmlRequest = {
  dados_vendas: {
    dataInicio?: string;
    dataFim?: string;
    statusEscrituracao?: boolean;
    listaVendas?: ChaveVenda[];
  };
};

// ── Estruturas aninhadas da Venda (auditadas via samples/exportarVendasXml.json)

export type VendaCliente = {
  CodigoCliente: string;
  CpfCnpjDoCliente: string;
  EmitirBoleto: string;           // "0"|"1"
  PercentualDoTitular: string;    // ex: "100.000000"
  TipoDeCliente: string;          // "0"=Titular
  Principal: string;              // "0"|"1"
};

export type VendaItem = {
  CodigoProduto: string;          // Produto (unidade)
  CodigoPersonalizacao: string;   // NumPersonalizacao (unidade)
  Preco: string;                  // ex: "43849.110000"
  Quantidade: string;
  Contrato: string;               // "0"|"1"
  ValorComissaoDireta: string;
  PercentualComissao: string;
  NumeroItem: string;
  UnicoItemDimob: string;         // "0"|"1"
};

// Parcela conforme ExportarVendasXml — campos financeiros são strings numéricas
export type VendaParcela = {
  NumeroParcela: string;
  NumeroParcelaGeral: string;
  ParcelaRecebida: string;        // "0"|"1"
  OrigemParcela: string;
  TotalParcelasDoGrupo: string;
  TotalParcelasDoGrupoInformado: string;
  TipoParcela: string;            // "E"=Entrada, "M"=Mensal, "S"=Sinal, etc.
  ValorPrincipal: string;
  ValorResiduo: string;
  DataVencimento: string;
  DataPrimeiraParcelaGrupo: string;
  DataProrrogacao: string;
  Amortizacao: string;
  BeginEndPrice: string;
  FrequenciaVencimento: string;
  DataInicioPrimeiroJuros: string;
  TaxaPrimeiroJuros: string;
  TaxaSegundoJuros: string;
  DataInicioReajuste: string;
  IndiceReajuste: string;
  GrupoPlanoIndexador: string;
  CobrarJurosPrimeiroPeriodo: string;
  DiasCarenciaMultaJurosAtraso: string;
  DiasCarenciaCorrecaoAtraso: string;
  CobrarJurosProRata: string;
  CobrarJurosProRataPrimeiroMes: string;
  MeioRecebimentoPreferencial: string;
  CapPrincipal: string;
  CapAcrescimo: string;
  CapCorrecao: string;
  CapCorrecaoAtraso: string;
  CapDesconto: string;
  CapDescontoAntecipacao: string;
  CapDescontoCondicional: string;
  CapDescontoCusta: string;
  CapJuros: string;
  CapJurosAtraso: string;
  CapMulta: string;
  CapRepasse: string;
  CapTaxaBoleto: string;
  TipoDaCusta: string;
  OrigemCusta: string;
  CobrarMultaCusta: string;
  CobrarJurosAtrasoCusta: string;
  CobrarTaxaAdministracaoCusta: string;
  CobrarImpostoCusta: string;
  CobrarCorrecaoCusta: string;
  RepassarValorLocadorCusta: string;
  PadraoCobranca: string;
  TipoSeguro: string;
  ValorDescontoCondicional: string;
  ValorDescontoCondicionalConfirmado: string;
  ValorPrincipalConfirmado: string;
  ValorAcrescimo: string;
  ValorAcrescimoConfirmado: string;
  ValorDesconto: string;
  ValorDescontoConfirmado: string;
  ValorCorrecaoAtraso: string;
  ValorCorrecaoAtrasoConfirmado: string;
  ValorCorrecaoEmbutida: string;
  ValorCorrecaoEmbutidaConfirmado: string;
  ValorJurosAtraso: string;
  ValorJurosAtrasoConfirmado: string;
  ValorJurosContrato: string;
  ValorJurosContratoConfirmado: string;
  ValorJurosContratoEmbutido: string;
  ValorJurosContratoEmbutidoConfirmado: string;
  ValorMulta: string;
  ValorMultaConfirmado: string;
  ValorCorrecao: string;
  ValorCorrecaoConfirmado: string;
  ValorDescontoAdiantamento: string;
  ValorDescontoAdiantamentoConfirmado: string;
};

export type ExportarVendasXmlResponse = {
  Vendas?: {
    Venda: ExportarVendasXmlResponseVenda[];
  };
};

export type ExportarVendasXmlResponseVenda = {
  // ── Identificação
  Empresa: string;
  Obra: string;
  Numero: string;
  StatusVenda: string;            // "0"=Normal, "1"=Cancelada, "3"=Quitada, "4"=Em acerto
  DataDaVenda: string;
  DataInicioContrato: string;
  DataFimContrato: string;
  DataDeCadastro: string;
  // ── Partes
  CodigoVendedor: string;
  CpfCnpjVendedor: string;
  Usuario: string;
  // ── Financeiro
  PercentualJurosAtraso: string;
  Multa: string;
  Desconto: string;
  Acrescimo: string;
  ValorProvisaoCurto: string;
  ValorProvisaoLongo: string;
  ValorProvisaoCurtoBaixa: string;
  ValorProvisaoLongoBaixa: string;
  ValorProvisaoCurtoCessao: string;
  ValorProvisaoLongoCessao: string;
  ValorDaFianca: string;
  ValorSeguroIncendio: string;
  ValorDescontoImposto: string;
  ValorPrestacaoDeServicos: string;
  // ── Configurações de cobrança
  ContinuarCobrandoJurosContratualAoAtrasarParcela: string;
  PossuiReajusteAnual: string;
  GerarResiduo: string;
  CarenciaAtraso: string;
  QuantidadeMesesRetroagirCorrecao: string;
  DataBaseResiduo: string;
  PossuiCorrecaoPorAtraso: string;
  PossuiCorrecaoProRata: string;
  CobrarTaxaDeBoleto: string;
  TipoDeVenda: string;
  DiaDoRepasse: string;
  CapProvisaoCurto: string;
  CapProvisaoLongo: string;
  DiasCarenciaCorrecaoPorAtraso: string;
  AnteciparCorrecao: string;
  CobrarJurosPosChave: string;
  TipoDeFianca: string;
  CobrarMultaFracionada: string;
  AnteciparJurosLinear: string;
  PeriodoDeReajuste: string;
  ZerarCorrecaoNegativa: string;
  CobrarJurosPorAtrasoMensal: string;
  CorrecaoCrescente: string;
  EnviarSpedPisCofins: string;
  ContratoCaixaEconomicaFederal: string;
  Atividade: string;
  CobrarCorrecaoMaisProrataMesRecebimento: string;
  CobrarJurosAnual: string;
  PeriodoCobrancaDeJuros: string;
  AnteciparCorrecaoProximoPeriodo: string;
  CodigoUltimaManutencao?: string; // não observado em todos os registros
  TributadoPeloRet: string;
  UtilizarDescontoUltimaParcela: string;
  // ── Estruturas aninhadas
  Clientes: { Cliente: VendaCliente | VendaCliente[] };
  Itens: { Item: VendaItem | VendaItem[] };
  Parcelas: { Parcela: VendaParcela[] };
  Comissoes: { Comissao: any[] };
  Comentarios: { Comentario: any[] };
};

// ─── ConsultarResumoVenda ─────────────────────────────────────────────────────
// Auditado: samples/consultarResumoVenda.json

export type ConsultarResumoVendaRequest = {
  empresa: number;
  obra: string;
  num_ven: number;
  data_calculo?: string;
  data_correcao?: string;
};

export type ParcelasPorTipo = {
  tipoParcela?: string;             // "E"=Entrada, "M"=Mensal, "S"=Sinal
  descricaoTipoParcela?: string;
  quantidadeParcelaAPagar?: number;
  totalParcelaAPagar?: number;
  quantidadeParcelaPaga?: number;
  totalParcelaPaga?: number;
};

export type TotaisAReceber = {
  valorSaldoDevedor?: number;
  valorPrincipal?: number;
  valorJuros?: number;
  valorCorrecao?: number;
  // ↓ INDICADORES DE INADIMPLÊNCIA — usar para scoreAdimplencia (ver VENDA_STUDY.md seção 9)
  valorMulta?: number;              // multas acumuladas sobre parcelas em atraso
  valorJurosAtraso?: number;        // juros de mora acumulados
  totalParcelasAtrasadas?: number;  // parcelas vencidas não pagas hoje → critério de classificação de risco
  percentualAtrasadas?: number;     // % das parcelas abertas em atraso → agravante no score
  // ↑ ─────────────────────────────────────────────────────────────────────────────────────────
  valorResiduoNaoGerado?: number;
  outrosValores?: number;
  totalParcelas?: number;
};

export type TotaisRecebidos = {
  valorTotalRecebido?: number;
  valorPrincipal?: number;
  valorJuros?: number;
  valorCorrecao?: number;
  valorMulta?: number;
  valorJurosAtraso?: number;
  valorDescontoAcrescimo?: number;
  valorAcrescimo?: number;
  valorDesconto?: number;
  outrosValores?: number;
  totalParcelas?: number;
  // ↓ INDICADORES HISTÓRICOS — confirmados na auditoria (resumoVendasAudit.json)
  totalRecebidasAtrasadas?: number;        // histórico: quantas parcelas foram pagas com atraso → agravante no score
  percentualRecebidasAtrasadas?: number;   // % histórico de pagamentos em atraso (>30% = perfil de risco)
  totalRecebidasAdiantadas?: number;       // histórico: parcelas pagas antes do vencimento → atenuante no score
  percentualRecebidasAdiantadas?: number;  // % de antecipações (>20% = bom pagador)
  mediaDiasAdiantamento?: number;          // média de dias de antecipação (clientes que antecipam tendem a valores altos)
  // ↑ ──────────────────────────────────────────────────────────────────────────────────────────────────────────
};

// Auditado em lote: samples/resumoVendasAudit.json (7 vendas reais — R0123, R0194)
// Todos os campos abaixo confirmados como sempre presentes na resposta da API.
//
// Para calcular score de inadimplência, usar:
//   totaisareceber[0].totalParcelasAtrasadas  → risco atual
//   totaisareceber[0].percentualAtrasadas     → severidade atual
//   totaisrecebido[0].totalRecebidasAtrasadas → histórico de comportamento
//   totaisrecebido[0].mediaDiasAdiantamento   → perfil de bom pagador
//
// Ver fórmula completa em VENDA_STUDY.md seção 9.4
export type ResumoVenda = {
  codigoEmpresa: number;
  codigoObra: string;
  numeroVenda: number;
  dataCalculo: string;           // ISO datetime — data de referência do cálculo UAU
  totalParcelas: number;
  totalDesconto: number;
  totalAPagarComDesconto: number; // saldo devedor atual (valor principal do snapshot)
  parcelasportipo: ParcelasPorTipo[];   // sempre 3 elementos: E (Entrada), M (Mensal), S (Sinal)
  totaisareceber: TotaisAReceber[];     // sempre 1 elemento — leitura via [0]
  totaisrecebido: TotaisRecebidos[];    // sempre 1 elemento — leitura via [0]
  descontoantecipacao: Record<string, any> | null; // null em todos os registros auditados
};

// ─── ConsultarParcelasDaVenda ─────────────────────────────────────────────────
// Auditado: samples/consultarParcelasDaVenda.json
// NOTA: o endpoint retorna [{MyTable: [...]}]. Quando não há boletos gerados
//       o MyTable contém apenas metadados de schema (nomes de tipo .NET) — não dados reais.
//       Usar venda com boletos gerados para obter registros reais.

export type ConsultarParcelasDaVendaRequest = {
  empresa: number;
  obra: string;
  num_venda: number;
  data_calculo: string;
  boleto_antecipado: boolean;
  somenteParcelasAptasBoleto?: boolean;
};

// Schema dos campos de parcela reajustada (sufixo _reaj) — derivado da auditoria
export type ParcelaDaVenda = {
  Empresa_reaj: number;
  Obra_reaj: string;
  NumVenda_reaj: number;
  Valor_reaj: number;
  JurosParc_reaj: number;
  Correcao_reaj: number;
  Juros_reaj: number;
  Multa_reaj: number;
  Residuo_reaj: number;
  DescAntec_reaj: number;
  CorrecaoAtr_reaj: number;
  CorrecaoEmb_reaj: number;
  TaxaBol_reaj: number;
  DataVenc_reaj: string;
  DataCalculo_reaj: string;
  blnReaj_reaj: number;                        // flag 0|1
  NumParc_reaj: number;
  Tipo_reaj: string;                           // "E"|"M"|"S" etc.
  DesconsiderarNoDescQuitacao_reaj: boolean;
  NumParcGer_reaj: number;
  Principal_reaj: number;
  JurosReal_reaj: number;
  DescCusta_reaj: number;
  DescImposto_reaj: number;
  TemIdxData_reaj: number;                     // flag 0|1
  DataIniJuros_reaj: string;
  ValorDescAnt_reaj: number;
  DebitoAutomatico_reaj: number;               // flag 0|1
};

export type ParcelaDaVendaPayload = {
  MyTable: ParcelaDaVenda[];
};

// ─── BuscarParcelasAReceber ───────────────────────────────────────────────────
// ✅ Auditado: samples/resumoVendasAudit.json (via fluxo paralelo com 20 vendas reais)
//
// PADRÃO IDÊNTICO ao ConsultarParcelasDaVenda:
//   endpoint retorna array onde [0] é metadado de schema .NET — usar .slice(1) no service.
//
// Campos chave descobertos:
//   EmBancoPrc = 1         → boleto já gerado no banco para essa parcela
//   Status_Prc = 0         → parcela em aberto (a receber)
//   IdxReaj_Prc = "IGPM"  → índice de reajuste aplicado
//   ValorReaj              → valor corrigido na data de consulta
//   nome_pes               → nome do cliente embutido (útil para logs)

export type BuscarParcelasAReceberRequest = {
  empresa?: number;
  obra?: string;
  num_ven?: number;
  data_calculo?: string;
  valor_presente?: boolean;
};

export type ParcelaAReceber = {
  // ── Identificação da parcela
  Empresa_prc: number;
  Obra_Prc: string;
  NumVend_prc: number;
  NumParc_Prc: number;        // número da parcela dentro do grupo de vencimento
  NumParcGer_Prc: number;     // número geral — identificador único da parcela no contrato
  Tipo_Prc: string;           // "E"=Entrada, "M"=Mensal, "S"=Sinal, "1"=Custas
  Status_Prc: number;         // 0=aberta, 1=paga

  // ── Datas
  Data_Prc: string;           // vencimento atual (pode diferir do original após prorrogação)
  DataPror_Prc: string;       // data de prorrogação
  DtParc_Prc: string;         // data original de criação da parcela no contrato

  // ── Valores base
  Valor_Prc: number;          // valor nominal da parcela
  ValorTaxaBol_prc: number;   // taxa de boleto bancário (ex: R$ 2,50)
  ValorResiduo_Prc: number;

  // ── Valores calculados na data de consulta (valor presente)
  ValorReaj: number;           // valor reajustado pelo índice na data de consulta
  vlrJurosParcela: number;     // juros do contrato incidentes
  vlrCorrecao: number;         // correção monetária (ex: IGPM)
  vlrJurosAtraso: number;      // juros de mora por atraso
  ValorMulta: number;          // multa por atraso
  vlrPrincReal: number;        // principal real (sem juros embutidos)
  vlrJurosReal: number;        // juros reais separados
  vlrTxBoleto: number;         // taxa de boleto calculada
  vlrDescAdiantamento: number; // desconto por antecipação

  // ── Vínculo com a venda e cliente
  Cliente_Prc: number;         // código do cliente (cod_pes)
  nome_pes: string;            // nome do cliente — auditado na resposta real
  Data_Ven: string;            // data de assinatura da venda
  EmBancoPrc: number;          // 1 = boleto gerado no banco — chave para saber se tem boleto

  // ── Configuração financeira
  IdxReaj_Prc: string;         // índice de reajuste ("IGPM", "INCC", "IPCA", etc.)
  JurosParc_Prc: number;       // taxa de juros do contrato
  TotParc_Prc: number;         // total de parcelas do grupo

  [key: string]: unknown;      // demais campos de configuração UAU (caps, flags de cobrança, dados da venda)
};

// ─── ConsultarUnidadesCompradasPorCPFCNPJ ────────────────────────────────────
// [AUDITAR] — executar audit.unidadesPorCPF() e inspecionar samples/

export type ConsultarUnidadesCompradasRequest = {
  CpfCnpj: string;
};

export type UnidadeComprada = {
  Empresa?: number;
  Obra?: string;
  Venda?: number;
  StatusVenda?: number;
  DataVenda?: string;
  Produto?: number;
  CodPerson?: number;
  DescPerson?: string;
  AnexosUnid?: string;
  IdentificadorUnid?: string;
  UsrCadUnid?: string;
  DataCadUnid?: string;
  ValPrecoUnid?: string;
  FracaoIdealUnid?: string;
  FracaoIdealDecimalUnid?: string;
  DataEntregChavesUnid?: string;
  DataRecReceitaMapaUnid?: string;
  UnidadeVendidaDacao?: string;
  // Colunas genéricas (mapeamento varia por empreendimento)
  [key: `C${number}Unid`]: string | null | undefined;
};
