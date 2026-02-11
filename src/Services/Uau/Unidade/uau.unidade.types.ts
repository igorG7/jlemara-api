export type ResponseFindAllUnidades = {
  Empresa_unid: number;
  Prod_unid: number;
  NumPer_unid: number;
  Obra_unid: string;
  Qtde_unid: number;
  Vendido_unid: number; // Geralmente: 1-Disponível, 2-Reservado, 3-Vendido...
  Codigo_Unid: string | 'null';
  PorcentPr_Unid: number;

  // Colunas Genéricas do UAU (Mapeamento comum: C1=Quadra, C2=Lote, C5=Número, C6=Bairro)
  C1_unid: string;
  C2_unid: string;
  C3_unid: string;
  C4_unid: string;
  C5_unid: string;
  C6_unid: string;
  C7_unid: string;

  // ... De C8 a C45 como strings ou 'null'
  [key: `C${number}_unid`]: string | 'null';

  anexos_unid: number;
  Identificador_unid: string;
  UsrCad_unid: string;
  DataCad_unid: string | Date;
  ValPreco_unid: number | 'null';
  FracaoIdeal_unid: number;
  NumObe_unid: number;
  ObjEspelhoTop_unid: string | 'null';
  ObjEspelhoLeft_unid: string | 'null';
  PorcentComissao_unid: number | 'null';
  CodTipProd_unid: string | 'null';
  NumCategStatus_unid: number | 'null';
  FracaoIdealDecimal_unid: number;
  DataEntregaChaves_unid: string | 'null';
  DataReconhecimentoReceitaMapa_unid: string | 'null';
  UnidadeVendidaDacao_unid: string | 'null';
  Num_Ven: number;
};
