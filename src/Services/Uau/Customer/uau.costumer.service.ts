// src\Services\Uau\Customer\uau.customer.service.ts
import uau from "../../../Lib/Uau";

import RedisController from "../../../Controllers/redis.controller"

import { RecordPhoneCustomerDTO, RecordCustomerDTO, ResponseCustomerPhones, DeleteCustomerPhones, ResponseFindCustomerWithPersonCode, ResponseFindCustomerWithCPF, CustomerWithCodeOrCPF, ResponseCustomerFindUnits, CustomerAddress, ResponseCustomerFindAdress, CustomersWithSale, ResponseFindCustomersWithSale } from "./uau.customer.dto";
import Console, { ConsoleData } from "../../../Lib/Console";
import parseBRDate from "../../../Utils/dateParser";
import { customerValidateCodPes, customerValidateCPF } from "./uau.customer.validation";

export default class UauCustomerService {
  private redis = new RedisController();
  private api = uau;


  async recordCustomer(payload: RecordCustomerDTO) {

    const cpf = String().replace(/\D/g, "")

    await customerValidateCPF(cpf)

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

      await this.redis.removeCustomerLock(String(cpf));

      const message = error.response?.data?.message || error.message || "Erro desconhecido";

      Console({ type: "error", message: `Erro em recordCustomer: ${message}` });


      if (error.response) {
        console.log(error.response.data);
      }

      throw new Error(message);
    }
  }

  async recordPhoneCustomer(cod_pes: number, phones: RecordPhoneCustomerDTO[]) {

    await customerValidateCodPes(cod_pes)

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

      const path = "Pessoas/ManterTelefone"

      const body = {
        Numero: cod_pes,
        Telefones: formattedPhones
      }

      const data = await this.api.post(path, body);

      Console({ type: "success", message: `UAU: Telefones do cliente(a) ${cod_pes} adicionado com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return data;

    } catch (error: any) {

      await this.redis.removeCustomerLock(String(cod_pes));


      const message = error.response?.data?.message || error.message || "Erro desconhecido";

      Console({ type: "error", message: `Erro em recordPhoneCustomer: ${message}` });


      if (error.response) {
        console.log(error.response.data);
      }

      throw new Error(message);
    }
  }

  async findPhonesCustomer(cod_pes: number) {

    await customerValidateCodPes(cod_pes)

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));

      if (!lockAcquired) {
        throw new Error(`O cadastro do codigo ${cod_pes} já está em processamento.`);
      }

      const path = "Pessoas/ConsultarTelefones"

      const body = {
        Numero: cod_pes,
      }

      const data = await this.api.post(path, body) as ResponseCustomerPhones[]

      Console({ type: "success", message: `UAU: Telefones do cliente(a) ${cod_pes} encontrado com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return data;
    } catch (error: any) {

      await this.redis.removeCustomerLock(String(cod_pes));


      const message = error.response?.data?.message || error.message || "Erro desconhecido";

      Console({ type: "error", message: `Erro em findPhonesCustomer: ${message}` });


      if (error.response) {
        console.log(error.response.data);
      }

      throw new Error(message);
    }

  }

  async deletePhonecustomer(cod_pes: number, phones: DeleteCustomerPhones[]) {

    await customerValidateCodPes(cod_pes)

    try {

      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));

      if (!lockAcquired) {
        throw new Error(`O cadastro do cod_pes ${cod_pes} já está em processamento.`);
      }

      const path = "Pessoas/ExcluirTelefone"

      const body = {
        Numero: cod_pes,
        Telefones: phones
      }

      const data = await this.api.post(path, body);

      Console({ type: "success", message: `UAU: Telefones do cliente(a) ${cod_pes} removido com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return data;
    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));


      const message = error.response?.data?.message || error.message || "Erro desconhecido";

      Console({ type: "error", message: `Erro em deletePhonecustomer: ${message}` });


      if (error.response) {
        console.log(error.response.data);
      }

      throw new Error(message);
    }
  }

  async findCustomerWithCode(cod_pes: number) {

    await customerValidateCodPes(cod_pes)

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));

      if (!lockAcquired) {
        throw new Error(`cod_pes ${cod_pes} já está em processamento.`);
      }

      const path = "Pessoas/ConsultarPessoaPorChave"

      const body = {
        codigo_pessoa: cod_pes,
      }

      const data = await this.api.post(path, body) as ResponseFindCustomerWithPersonCode

      const res = data[0].MyTable.slice(1, data[0].MyTable.length)

      Console({ type: "success", message: `UAU: Cliente(a) ${cod_pes} consultado(a) com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return res[0] as CustomerWithCodeOrCPF

    } catch (error: any) {
      await this.redis.removeCustomerLock(String(cod_pes));

      const message = error.response?.data?.message || error.message || "Erro desconhecido";

      Console({ type: "error", message: `Erro em findcustomerWithCode: ${message}` });

      if (error.response) {
        console.log(error.response.data);
      }

      throw new Error(message);
    }
  }

  async findCustomersWithSale() {
    try {

      const path = "Pessoas/ConsultarPessoasComVenda"

      const body = {}

      const data = await this.api.post(path, body) as ResponseFindCustomersWithSale

      const res = data[0].Pessoas.slice(1, data[0].Pessoas.length) as CustomersWithSale[]

      Console({ type: "success", message: `UAU: Clientes com venda encontrados com sucesso.` });

      return res

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Erro desconhecido";

      Console({ type: "error", message: `Erro em findCustomersWithSale: ${message}` });

      if (error.response) {
        console.log(error.response.data);
      }

      throw new Error(message);
    }
  }

  async findcustomerWithCPF(cpf_cnpj: string, status: number = 0) {

    await customerValidateCPF(cpf_cnpj)

    try {
      const lockAcquired = await this.redis.setCustomerLock(String(cpf_cnpj));

      if (!lockAcquired) {
        throw new Error(`cpf_cnpj ${cpf_cnpj} já está em processamento.`);
      }

      const path = "Pessoas/ConsultarPessoasPorCPFCNPJ"

      const body = {
        cpf_cnpj,
        status: status
      }

      const data = await this.api.post(path, body) as ResponseFindCustomerWithCPF

      const response = data[0].Pessoas[1] as CustomerWithCodeOrCPF

      Console({ type: "success", message: `UAU: Cliente(a) ${cpf_cnpj} consultado(a) com sucesso.` });

      await this.redis.removeCustomerLock(String(cpf_cnpj));

      return response

    } catch (error: any) {


      const message = error.response?.data?.message || error.message || "Erro desconhecido";

      Console({ type: "error", message: `Erro em findcustomerWithCPF: ${message}` });


      if (error.response) {
        console.log(error.response.data);
      }

      throw new Error(message);
    }
  }

  async findUnitsCustomer(cod_pes: number) {

    await customerValidateCodPes(cod_pes)

    try {

      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));

      if (!lockAcquired) {
        throw new Error(`cod_pes ${cod_pes} já está em processamento.`);
      }

      const path = "Pessoas/ConsultarUnidades"

      const body = {
        CodigoPessoa: cod_pes,
        CpfCnpj: ""
      }

      const data = await this.api.post(path, body) as ResponseCustomerFindUnits[]

      Console({ type: "success", message: `UAU: Unidades do cliente(a) ${cod_pes} consultadas com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return data;

    } catch (error: any) {

      await this.redis.removeCustomerLock(String(cod_pes));

      const message = error.response?.data?.message || error.message || "Erro desconhecido";

      Console({ type: "error", message: `Erro em findUnitsCustomer: ${message}` });

      if (error.response) {
        console.log(error.response.data);
      }

      throw new Error(message);
    }
  }

  async findAdressCustomer(cod_pes: number, tipoEndereco: number = 0) {

    await customerValidateCodPes(cod_pes)

    try {

      const lockAcquired = await this.redis.setCustomerLock(String(cod_pes));

      if (!lockAcquired) {
        throw new Error(`cod_pes ${cod_pes} já está em processamento.`);
      }

      const path = "Pessoas/ConsultarEnderecoPessoasPorChave"

      const body = {
        codigoPessoa: cod_pes,
        tipoEndereco
      }

      const data = await this.api.post(path, body) as ResponseCustomerFindAdress[]

      const response = data[0].MyTable.slice(1, data[0].MyTable.length) as CustomerAddress[]

      Console({ type: "success", message: `UAU: Endereços do cliente ${cod_pes} consultados com sucesso.` });

      await this.redis.removeCustomerLock(String(cod_pes));

      return response;

    } catch (error: any) {

      await this.redis.removeCustomerLock(String(cod_pes));

      const message = error.response?.data?.message || error.message || "Erro desconhecido";

      Console({ type: "error", message: `Erro em findAdresscustomer: ${message}` });

      if (error.response) {
        console.log(error.response.data);
      }

      throw new Error(message);

    }
  }

}
