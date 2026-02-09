import RedisController from "../redis.controller";
import Console, { ConsoleData } from "../../Lib/Console";
import uau from "../../Lib/Uau";

type ResponseFindUnits = {
  Empresa: number,
  DescricaoEmpresa: string;
  Obra: string;
  DescricaoObra: string;
  Venda: number,
  Produto: number,
  DescricaoProduto: string;
  Identificador: string;
}
type ResponseFindPhones = {
  Telefone: string;
  DDD: string;
  Complemento: string;
  Tipo: number,
}
export type ResponseFindCostumerWithCode = [
  {
    MyTable: CostumerWithCode[]
  }
]
export type CostumerWithCode = {
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
export type ResponseFindCostumerWithCPF = [
  {
    Pessoas: CustomerWithCPF[]
  }
]

export type ResponseFindAdressCostumer = {
  MyTable: CustomerAddress[]
}
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
export type CustomerWithCPF = {
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
export type RecordInfoPesDTO = {
  cod_pes?: number;
  nome_pes?: string;
  tipo_pes?: number;
  cpf_pes?: string;
  dtcad_pes?: string | Date;
  dtnasc_pes?: string | Date;
  intext_pes?: number;
  usrcad_pes?: string;
  usralt_pes?: string;
  status_pes?: number;
  tratamento_pes?: string;
  siglaobr_pes?: string;
  email_pes?: string;
  endwww_pes?: string;
  matricula_pes?: string;
  atinat_pes?: number;
  dataalt_pes?: string | Date;
  nomefant_pes?: string;
  anexos_pes?: number;
  inscrmunic_pes?: string;
  inscrest_pes?: string;
  siglaemp_pes?: number;
  login_pes?: string;
  senha_pes?: string;
  cnae_pes?: string;
  datacadportal_pes?: string | Date;
  cadastradoprefeituragyn_pes?: boolean;
  habilitadoriscosacado_pes?: boolean;
  cei_pes?: string;
};
export type RecordPhoneDTO = {
  telefone: string;
  DDD: string;
  Complemento?: string;
  Tipo?: number;
  Principal?: number;
};

/**
 * UAU CUSTOMER CONTROLLER
 * Interface de comunicação direta com o ERP UAU para operações de Pessoa.
 */
export default class UauCustomerController {
  private redis = new RedisController();
  private api = uau;

  async recordCustomer(payload: RecordInfoPesDTO) {
    // 1. Sanitização básica
    const cpf = String(payload.cpf_pes).replace(/\D/g, "");
    if (!cpf) throw new Error("CPF é obrigatório para o cadastro.");

    try {
      // 2. Tenta adquirir Lock no Redis
      const lockAcquired = await this.redis.setCustomerLock(cpf);

      if (!lockAcquired) {
        throw new Error(`O cadastro do CPF ${cpf} já está em processamento.`);
      }

      // --- CONVERSÃO DE DATA (DD/MM/YYYY -> YYYY-MM-DD) ---
      let dataFormatada = payload.dtnasc_pes;
      if (typeof payload.dtnasc_pes === 'string' && payload.dtnasc_pes.includes('/')) {
        const [dia, mes, ano] = payload.dtnasc_pes.split('/');
        dataFormatada = `${ano}-${mes}-${dia}`; // Formato que o .NET entende melhor
      }
      // 3. Montagem do cabeçalho técnico exigido pelo UAU (mscorlib)
      const uauHeader = {
        ddd_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        fone_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        ram_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        tipo_tel: "System.Byte, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        TipoTel_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        ExisteTel_tel: "System.Boolean, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        Principal_tel: "System.Byte, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
      };

      const phones = [
        {
          ddd: "031",
          numero: "40028922",
          principal: true
        },
        {
          ddd: "031",
          numero: "89887789",
          principal: false
        },
        {
          ddd: "031",
          numero: "456885635",
          principal: false
        },
      ]

      // 4. Mapeamento dos telefones reais
      const phoneList = phones.map(p => ({
        ddd_tel: p.ddd.replace(/\D/g, ""),
        fone_tel: p.numero.replace(/\D/g, ""),
        ram_tel: "",
        tipo_tel: 4,
        TipoTel_tel: "",
        ExisteTel_tel: false,
        Principal_tel: p.principal ? 1 : 0
      }));

      // 3. Serialização Dupla (JSON dentro de Array dentro de JSON)
      // O campo dspes_tel_json espera uma STRING que seja um JSON.

      const dspes_tel_json = JSON.stringify([{
        PesTel: [uauHeader, ...phoneList]
      }]);
      // 3. Preparação do payload para o UAU
      const path = "Pessoas/GravarPessoa";
      const body = {
        nao_validar_campos_obrigatorios: true,
        info_pes: {
          cod_pes: 0,
          nome_pes: payload.nome_pes?.toUpperCase(),
          tipo_pes: payload.tipo_pes,
          cpf_pes: cpf,
          dtcad_pes: new Date().toISOString(),
          dtnasc_pes: dataFormatada,
          usrcad_pes: process.env.UAU_USER!,
          usralt_pes: process.env.UAU_USER!,
          status_pes: 1,
          email_pes: payload.email_pes?.toLowerCase(),
          dspes_tel_json: dspes_tel_json, // A string mágica vai aqui


          atinat_pes: 0,
          cadastradoprefeituragyn_pes: false,
          habilitadoriscosacado_pes: false,
          intext_pes: 0


        },
      };

      // 4. Chamada à API
      const data = await this.api.post(path, body);
      console.log(data)
      Console({ type: "success", message: `UAU: ${payload.nome_pes} cadastrado com sucesso.` });

      // 5. Liberação imediata da trava após sucesso
      await this.redis.removeCustomerLock(cpf);

      return data;

    } catch (error: any) {
      // 6. Tratamento de erro e liberação da trava (Safety Net)
      await this.redis.removeCustomerLock(cpf);

      const errorMessage = error.response?.data?.message || error.message || "Erro ao gravar no UAU";

      Console({ type: "error", message: `UauCustomerController.recordCustomer: ${errorMessage}` });
      ConsoleData({ type: "error", data: error.response?.data || error });

      throw new Error(errorMessage);
    }
  }
  async recordPhoneCostumer(cod_pes: number, phones: RecordPhoneDTO[]) {
    // 1. Sanitização básica
    if (!cod_pes) throw new Error("cod_pes é obrigatório para o cadastro.");

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));

      if (!lockAcquired) {
        throw new Error(`O cadastro do codigo ${cod_pes} já está em processamento.`);
      }
      const body = {
        Numero: cod_pes,
        Telefones: phones
      }

      const data = await this.api.post("Pessoas/ManterTelefone", body);
      Console({ type: "success", message: `UAU: Telefones do cliente(a) ${cod_pes} cadastrado/adicionado com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return data;

    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `recordPhoneCustomer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }
  async findPhonesCostumer(cod_pes: number) {
    // 1. Sanitização básica
    if (!cod_pes) throw new Error("cod_pes é obrigatório para o cadastro.");

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));

      if (!lockAcquired) {
        throw new Error(`O cadastro do codigo ${cod_pes} já está em processamento.`);
      }

      const body = {
        Numero: cod_pes,
      }

      const data = await this.api.post("Pessoas/ConsultarTelefones", body) as ResponseFindPhones[]
      console.log(data)
      Console({ type: "success", message: `UAU: Telefones do cliente(a) ${cod_pes} cadastrado/adicionado com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return data;

    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `recordPhoneCustomer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }
  async deletePhoneCostumer(cod_pes: number, phones: RecordPhoneDTO[]) {
    if (!cod_pes) throw new Error("cod_pes é obrigatório para o cadastro.");

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));
      if (!lockAcquired) {
        throw new Error(`O cadastro do cod_pes ${cod_pes} já está em processamento.`);
      }

      const body = {
        Numero: cod_pes,
        Telefones: phones
      }

      const data = await this.api.post("Pessoas/ExcluirTelefone", body);

      console.log(data)

      Console({ type: "success", message: `UAU: Telefones do cliente(a) ${cod_pes} removido com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return data;

    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `recordPhoneCustomer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }
  async findCostumerWithCode(cod_pes: number) {

    if (!cod_pes) throw new Error("cod_pes é obrigatório para o cadastro.");

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));
      if (!lockAcquired) {
        throw new Error(`cod_pes ${cod_pes} já está em processamento.`);
      }

      const body = {
        codigo_pessoa: cod_pes,
      }

      const data = await this.api.post("Pessoas/ConsultarPessoaPorChave", body) as ResponseFindCostumerWithCode

      console.log(data[0].MyTable.slice(1, data[0].MyTable.length))
      Console({ type: "success", message: `UAU: Cliente(a) ${cod_pes} consultadas com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return data

    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `recordPhoneCustomer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }
  async findCostumerWithCPF(cpf_cnpj: string, status: number) {

    if (!cpf_cnpj) throw new Error("cpf_cnpj é obrigatório para o cadastro.");

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cpf_cnpj));
      if (!lockAcquired) {
        throw new Error(`cpf_cnpj ${cpf_cnpj} já está em processamento.`);
      }

      const body = {
        cpf_cnpj,
        status
      }

      const data = await this.api.post("Pessoas/ConsultarPessoasPorCPFCNPJ", body) as ResponseFindCostumerWithCPF



      const response = data[0].Pessoas.slice(1, data[0].Pessoas.length) as CustomerWithCPF[]
      console.log(response)
      Console({ type: "success", message: `UAU: Cliente(a) ${cpf_cnpj} consultadas com sucesso.` });

      await this.redis.removeCustomerLock(String(cpf_cnpj));

      return response

    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cpf_cnpj));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `recordPhoneCustomer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }
  async findUnitsCostumer(cod_pes: number) {

    if (!cod_pes) throw new Error("cod_pes é obrigatório para o cadastro.");

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));
      if (!lockAcquired) {
        throw new Error(`cod_pes ${cod_pes} já está em processamento.`);
      }

      const body = {
        CodigoPessoa: cod_pes,
        CpfCnpj: ""
      }

      const data = await this.api.post("Pessoas/ConsultarUnidades", body) as ResponseFindUnits[]

      console.log(data)

      Console({ type: "success", message: `UAU: Unidades do cliente(a) ${cod_pes} consultadas com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return data;

    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `recordPhoneCustomer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }
  async findAdressCostumer(cod_pes: number, tipoEndereco: number = 0) {

    if (!cod_pes) throw new Error("cod_pes é obrigatório para o cadastro.");

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));
      if (!lockAcquired) {
        throw new Error(`cod_pes ${cod_pes} já está em processamento.`);
      }

      const body = {
        codigoPessoa: cod_pes,
        tipoEndereco
      }

      const data = await this.api.post("Pessoas/ConsultarEnderecoPessoasPorChave", body) as ResponseFindAdressCostumer[]

      console.log(data[0].MyTable)

      Console({ type: "success", message: `UAU: Unidades do cliente(a) ${cod_pes} consultadas com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return data;

    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `recordPhoneCustomer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }




}
