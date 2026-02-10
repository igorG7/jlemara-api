

export type RecordCustomerDTO = {
  cpf_person: string;
  birth_date: Date | string;
  full_name: string;
  type_person: string;
  email: string;
  dspes_tel_json: RecordPhoneCustomerDTO[]
};
export type RecordPhoneCustomerDTO = {
  ddd_tel: string;
  fone_tel: string;
  ram_tel: string;
  tipo_tel: number;
  ExisteTel_tel: boolean;
  Principal_tel: number;
  Complemento?: string;
  TipoTel_tel?: string; // validar necessidade
};
export type ResponseCustomerFindUnits = {
  Empresa: number,
  DescricaoEmpresa: string;
  Obra: string;
  DescricaoObra: string;
  Venda: number,
  Produto: number,
  DescricaoProduto: string;
  Identificador: string;
};
export type ResponseCustomerFindAdress = {
  MyTable: CustomerAddress[]
};
export type ResponseCustomerPhones = {
  Telefone: string;
  DDD: string;
  Complemento: string;
  Tipo: number,
};
export type ResponseFindCustomerWithPersonCode = [
  {
    MyTable: CustomerWithCodeOrCPF[]
  }
];
export type ResponseFindCustomerWithCPF = [
  {
    Pessoas: CustomerWithCodeOrCPF[]
  }
];
export type DeleteCustomerPhones = {
  telefone: string;
  DDD: string;
  Complemento?: string;
  Tipo?: number;
  Principal?: number;
};
export type CustomerWithCodeOrCPF = {
  cod_pes: number;
  nome_pes: string;
  tipo_pes: number;
  cpf_pes: string;
  dtcad_pes: string;
  dtnasc_pes: string;
  IntExt_pes: number;
  UsrCad_pes: string;
  UsrAlt_pes: string;
  Status_pes: number;
  Tratamento_pes: string;
  Email_pes: string;
  EndWWW_pes: string;
  Matricula_Pes: string | 'null';
  Empreendimento_Ppes: string | 'null';
  ForCli_Ppes: string | 'null';
  Aval_Prod_Serv_Ppes: string | 'null';
  Atd_Entrega_Ppes: string | 'null';
  AtInat_pes: number;
  DataAlt_pes: string;
  NomeFant_Pes: string;
  Anexos_pes: number;
  InscrMunic_pes: string;
  inscrest_pes: string;
  Login_pes: string;
  Senha_pes: string;
  CNAE_pes: string | 'null';
  DataCadPortal_pes: string;
  CadastradoPrefeituraGyn_pes: boolean;
  HabilitadoRiscoSacado_pes: boolean;
  CEI_Pes: string | 'null';
  IntegradoEDI_pes: string | 'null';
  BloqueioLgpd_Pes: number;
  CliDDA_PPes: string | 'null';
};
export type CustomerAddress = {
  CodPes_pend: number;
  Tipo_pend: number;
  Endereco_pend: string;
  Bairro_pend: string;
  Cidade_pend: string;
  UF_pend: string;
  CEP_pend: string;
  NumEnd_pend: string;
  ComplEndereco_pend: string | 'null';
  ReferEnd_pend: string | 'null';
  Proprio_pend: number;
  NumCid_pend: number;
  NumBrr_pend: string | 'null';
  NumLogr_pend: string | 'null';
  CodEmp_pend: string | 'null';
  NomeEmp_pend: string | 'null';
  TipoEndEmp_pend: string | 'null';
};
