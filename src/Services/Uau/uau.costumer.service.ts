import uau from "../../Lib/Uau";

import RedisController from "../../Controllers/redis.controller"

import { RecordPhoneCustomerDTO, RecordCustomerDTO, ResponseCustomerPhones, DeleteCustomerPhones, ResponseFindCustomerWithPersonCode, ResponseFindCustomerWithCPF, CustomerWithCodeOrCPF, ResponseCustomerFindUnits, CustomerAddress, ResponseCustomerFindAdress, CustomersWithSale, ResponseFindCustomersWithSale } from "./uau.customer.dto";
import Console, { ConsoleData } from "../../Lib/Console";
import parseBRDate from "../../Utils/dateParser";
import { costumerValidateCodPes, costumerValidateCPF } from "./uau.customer.validation";

export default class UauCustomerService {
  private redis = new RedisController();
  private api = uau;

  // ✅ - VALIDADO
  async recordCustomer(payload: RecordCustomerDTO) {
    const cpf = String(payload.cpf_person).replace(/\D/g, "")

    await costumerValidateCPF(cpf)

    try {
      const lockAcquired = await this.redis.setCustomerLock(cpf);
      if (!lockAcquired) {
        throw new Error(`O cadastro do CPF ${cpf} já está em processamento.`);
      }

      let formattedDate = parseBRDate(String(payload?.birth_date));

      // Ponto de atenção: Infelizmente, as vezes a api uau coloca como obrigatorio enviar essas informações
      const uauHeader = {
        ddd_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        fone_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        ram_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        tipo_tel: "System.Byte, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        TipoTel_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        ExisteTel_tel: "System.Boolean, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
        Principal_tel: "System.Byte, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
      };
      const phones = payload.dspes_tel_json
      const phoneList = phones.map(p => ({
        ddd_tel: p.ddd_tel.replace(/\D/g, ""),
        fone_tel: p.fone_tel.replace(/\D/g, ""),
        ram_tel: "",
        tipo_tel: 4,
        TipoTel_tel: "",
        ExisteTel_tel: false,
        Principal_tel: p.Principal_tel ? 1 : 0
      }));
      const dspes_tel_json = JSON.stringify([{
        PesTel: [uauHeader, ...phoneList]
      }]);
      const path = "Pessoas/GravarPessoa";
      const body = {
        nao_validar_campos_obrigatorios: true,
        info_pes: {
          cod_pes: 0,
          nome_pes: payload.full_name?.toUpperCase()!,
          tipo_pes: payload.type_person,
          cpf_pes: cpf,
          dtcad_pes: new Date().toISOString(),
          dtnasc_pes: formattedDate,
          usrcad_pes: process.env.UAU_USER!,
          usralt_pes: process.env.UAU_USER!,
          status_pes: 1,
          email_pes: payload.email?.toLowerCase(),
          dspes_tel_json: dspes_tel_json, // A string mágica vai aqui
          atinat_pes: 0,
          cadastradoprefeituragyn_pes: false,
          habilitadoriscosacado_pes: false,
          intext_pes: 0

        },
      };
      const data = await this.api.post(path, body);
      Console({ type: "success", message: `UAU: ${payload.full_name} cadastrado com sucesso.` });
      await this.redis.removeCustomerLock(cpf);
      return data;
    } catch (error: any) {
      await this.redis.removeCustomerLock(cpf);
      const errorMessage = error.response?.data?.message || error.message || "Erro ao gravar no UAU";
      Console({ type: "error", message: `UauCustomerService.recordCustomer: ${errorMessage}` });
      ConsoleData({ type: "error", data: error.response?.data || error });
      throw new Error(errorMessage);
    }
  }

  // ✅ - VALIDADO
  async recordPhoneCustomer(cod_pes: number, phones: RecordPhoneCustomerDTO[]) {

    await costumerValidateCodPes(cod_pes)

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));
      if (!lockAcquired) {
        throw new Error(`O cadastro do codigo ${cod_pes} já está em processamento.`);
      }
      const formattedPhones = phones?.map((phone: RecordPhoneCustomerDTO) => {
        return {
          telefone: phone.fone_tel,
          DDD: phone.ddd_tel,
          Complemento: phone.Complemento,
          Tipo: phone.tipo_tel,
          Principal: phone.Principal_tel
        }
      })
      const body = {
        Numero: cod_pes,
        Telefones: formattedPhones
      }
      const data = await this.api.post("Pessoas/ManterTelefone", body);
      Console({ type: "success", message: `UAU: Telefones do cliente(a) ${cod_pes} adicionado com sucesso.` });
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

  // ✅ - VALIDADO
  async findPhonesCustomer(cod_pes: number) {
    await costumerValidateCodPes(cod_pes)
    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));
      if (!lockAcquired) {
        throw new Error(`O cadastro do codigo ${cod_pes} já está em processamento.`);
      }
      const body = {
        Numero: cod_pes,
      }
      const data = await this.api.post("Pessoas/ConsultarTelefones", body) as ResponseCustomerPhones[]
      Console({ type: "success", message: `UAU: Telefones do cliente(a) ${cod_pes} encontrado com sucesso.` });
      await this.redis.removeCustomerLock(String(cod_pes));
      return data;
    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `findPhonesCustomer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }

  }

  // ✅ - VALIDADO
  async deletePhoneCostumer(cod_pes: number, phones: DeleteCustomerPhones[]) {
    await costumerValidateCodPes(cod_pes)
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
      Console({ type: "success", message: `UAU: Telefones do cliente(a) ${cod_pes} removido com sucesso.` });
      await this.redis.removeCustomerLock(String(cod_pes));
      return data;
    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `deletePhoneCostumer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }

  // ✅ - VALIDADO
  async findCostumerWithCode(cod_pes: number) {
    await costumerValidateCodPes(cod_pes)
    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));
      if (!lockAcquired) {
        throw new Error(`cod_pes ${cod_pes} já está em processamento.`);
      }
      const body = {
        codigo_pessoa: cod_pes,
      }
      const data = await this.api.post("Pessoas/ConsultarPessoaPorChave", body) as ResponseFindCustomerWithPersonCode
      const res = data[0].MyTable.slice(1, data[0].MyTable.length)
      Console({ type: "success", message: `UAU: Cliente(a) ${cod_pes} consultado(a) com sucesso.` });
      await this.redis.removeCustomerLock(String(cod_pes));
      return res[0] as CustomerWithCodeOrCPF

    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `findCostumerWithCode: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }


  async findCustomersWithSale() {
    try {

      const body = {}
      const data = await this.api.post("Pessoas/ConsultarPessoasComVenda", body) as ResponseFindCustomersWithSale
      const res = data[0].Pessoas.slice(1, data[0].Pessoas.length) as CustomersWithSale[]
      Console({ type: "success", message: `UAU: Clientes com venda encontrados com sucesso.` });
      return res

    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `findCustomersWithSale: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }

  // ✅ - VALIDADO
  async findCostumerWithCPF(cpf_cnpj: string, status: number = 0) {

    await costumerValidateCPF(cpf_cnpj)
    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cpf_cnpj));
      if (!lockAcquired) {
        throw new Error(`cpf_cnpj ${cpf_cnpj} já está em processamento.`);
      }

      const body = {
        cpf_cnpj,
        status: status
      }

      const data = await this.api.post("Pessoas/ConsultarPessoasPorCPFCNPJ", body) as ResponseFindCustomerWithCPF

      const response = data[0].Pessoas[1] as CustomerWithCodeOrCPF

      Console({ type: "success", message: `UAU: Cliente(a) ${cpf_cnpj} consultado(a) com sucesso.` });

      await this.redis.removeCustomerLock(String(cpf_cnpj));

      return response

    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cpf_cnpj));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `findCostumerWithCPF: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }

  // ✅ - VALIDADO
  async findUnitsCustomer(cod_pes: number) {
    await costumerValidateCodPes(cod_pes)
    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));
      if (!lockAcquired) {
        throw new Error(`cod_pes ${cod_pes} já está em processamento.`);
      }
      const body = {
        CodigoPessoa: cod_pes,
        CpfCnpj: ""
      }
      const data = await this.api.post("Pessoas/ConsultarUnidades", body) as ResponseCustomerFindUnits[]
      Console({ type: "success", message: `UAU: Unidades do cliente(a) ${cod_pes} consultadas com sucesso.` });
      await this.redis.removeCustomerLock(String(cod_pes));
      return data;
    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `findUnitsCustomer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }

  // ✅ - VALIDADO
  async findAdressCostumer(cod_pes: number, tipoEndereco: number = 0) {
    await costumerValidateCodPes(cod_pes)
    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));
      if (!lockAcquired) {
        throw new Error(`cod_pes ${cod_pes} já está em processamento.`);
      }
      const body = {
        codigoPessoa: cod_pes,
        tipoEndereco
      }
      const data = await this.api.post("Pessoas/ConsultarEnderecoPessoasPorChave", body) as ResponseCustomerFindAdress[]
      const response = data[0].MyTable.slice(1, data[0].MyTable.length) as CustomerAddress[]
      Console({ type: "success", message: `UAU: Endereços do cliente ${cod_pes} consultados com sucesso.` });
      await this.redis.removeCustomerLock(String(cod_pes));
      return response;
    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `findAdressCostumer: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }

}
