export type ResponseUnitUauType = {
  Empresa_unid: number; // company - Empresa responsavel
  Prod_unid: number; // product_unit - produto que comporta as unidades
  NumPer_unid: number; // unit_code - número de identificação
  Obra_unid: string; // development_code - numero de identificação da obra
  Qtde_unid: number; // quantity_unit - quantidade disponivel para venda
  Vendido_unid: number; // status_unit - descreve a atual situação da unidade [0 ... 8]
  Codigo_Unid: string; // X
  PorcentPr_Unid: number; // X
  C1_unid: string; // block - descreve a quadra (quarteirão)
  C2_unid: string; // lot - lote (terreno)
  C3_unid: string; //
  C4_unid: string;
  C5_unid: string | "null";
  C6_unid: string | "null";
  C7_unid: string | "null";
  C8_unid: string | "null";
  C9_unid: string | "null";
  C10_unid: string | "null";
  C11_unid: string | "null";
  C12_unid: string | "null";
  C13_unid: string | "null";
  C14_unid: string | "null";
  C15_unid: string | "null";
  C16_unid: string | "null";
  C17_unid: string | "null";
  C18_unid: string | "null";
  C19_unid: string | "null";
  C20_unid: string | "null";
  C21_unid: string | "null";
  C22_unid: string | "null";
  C23_unid: string | "null";
  C24_unid: string | "null";
  C25_unid: string | "null";
  C26_unid: string | "null";
  C27_unid: string | "null";
  C28_unid: string | "null";
  C29_unid: string | "null";
  C30_unid: string | "null";
  C31_unid: string | "null";
  C32_unid: string | "null";
  C33_unid: string | "null";
  C34_unid: string | "null";
  C35_unid: string | "null";
  C36_unid: string | "null";
  C37_unid: string | "null";
  C38_unid: string | "null";
  C39_unid: string | "null";
  C40_unid: string | "null";
  C41_unid: string | "null";
  C42_unid: string | "null";
  C43_unid: string | "null";
  C44_unid: string | "null";
  C45_unid: string | "null";
  anexos_unid: number; // attachment_count - contagem de anexos/informações vinculadas a unidade
  Identificador_unid: string; // identifier_unit - numero do lote - abreviação do nome do bairro - quadra
  UsrCad_unid: string; // X
  DataCad_unid: string; // registration_date - data de cadastro da unidade no uau
  ValPreco_unid: number; // X
  FracaoIdeal_unid: string | "null"; // X
  NumObe_unid: string | "null"; // X
  ObjEspelhoTop_unid: string | "null"; // X
  ObjEspelhoLeft_unid: string | "null"; // X
  PorcentComissao_unid: string | "null"; // X
  CodTipProd_unid: string | "null"; // code_type_product - descreve o tipo do produto (casa , apartamento , lote...)
  NumCategStatus_unid: number; // category_status - um sub status para descrever o estado atual do imovel
  FracaoIdealDecimal_unid: string | "null"; // X
  DataEntregaChaves_unid: string | "null"; // X
  DataReconhecimentoReceitaMapa_unid: string | "null"; // X
  UnidadeVendidaDacao_unid: string | "null"; // X
  Num_Ven: string | "null"; // sale_number - padrão 0, se diferente possui venda atrelada
};
