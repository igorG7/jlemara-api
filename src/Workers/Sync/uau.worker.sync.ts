import Console from "../../Lib/Console";
import UauCustomerService from "../../Services/Uau/uau.costumer.service";
import { CustomersWithSale } from "../../Services/Uau/uau.customer.dto";
import { AddressType, CustomerType } from "Types/CostumerTypes";
import parseBRDate from "../../Utils/dateParser";
import CostumerController from "../../Controllers/costumer.controller";
import RedisController from "../../Controllers/redis.controller";

export default class UauSyncWorker {
  private customerUauService = new UauCustomerService();
  private customerController = new CostumerController();
  private redisController = new RedisController();

  /**
   * Sincroniza clientes do ERP para o Banco de Dados local usando concorrência
   */
  async rescueErpCostumers() {
    console.time("⏳ tempo_total ⏳");
    Console({ type: "log", message: "Iniciando verificação em lote no ERP UAU." });

    try {
      const customersWithSale = (await this.customerUauService.findCustomersWithSale()) as CustomersWithSale[];

      if (!customersWithSale || customersWithSale.length === 0) {
        Console({ type: "success", message: "Nenhum cliente encontrado." });
        return;
      }

      const totalItems = customersWithSale.length;
      Console({ type: "log", message: `${totalItems} clientes identificados no ERP.` });

      let saved = 0;
      let errorCount = 0;

      // --- CONFIGURAÇÃO DE LOTE (CHUNKS) ---
      const CHUNK_SIZE = 10; // Processa 10 clientes por vez em paralelo
      const dataToProcess = customersWithSale;

      for (let i = 0; i < dataToProcess.length; i += CHUNK_SIZE) {
        const chunk = dataToProcess.slice(i, i + CHUNK_SIZE);

        Console({ type: "log", message: `Processando lote: ${i} até ${i + CHUNK_SIZE} de ${totalItems}...` });

        // Executa o lote atual em paralelo
        // ... dentro do rescueErpCostumers no Promise.all

        await Promise.all(
          chunk.map(async (item) => {
            try {
              if (!item.Cod_pes) return;

              // REMOVEMOS o Promise.all interno para evitar o conflito de lock no mesmo ID
              // Agora as chamadas internas respeitam a ordem, mas o lote continua paralelo entre IDs diferentes
              const detail = await this.customerUauService.findCostumerWithCode(item.Cod_pes);
              if (!detail) return;

              const phones = await this.customerUauService.findPhonesCustomer(item.Cod_pes);
              const address = await this.customerUauService.findAdressCostumer(item.Cod_pes);

              const fullData = { ...detail, phones, address };
              await this.formatCustomerAndSave(fullData);

              saved++;
            } catch (error) {
              errorCount++;
              // Log discreto para não poluir
            }
          })
        );
      }

      Console({ type: "success", message: `Sincronismo finalizado: ${saved} salvos, ${errorCount} falhas.` });
      console.timeEnd("⏳ tempo_total ⏳");

    } catch (error) {
      Console({ type: "error", message: "Falha crítica no Worker de Sincronismo." });
      console.error(error);
    }
  }

  /**
   * Mapeia os dados brutos do UAU para o padrão do Sistema Local
   */
  private async formatCustomerAndSave(customer: any) {
    if (!customer || !customer.cpf_pes) {
      throw new Error("CPF ausente.");
    }

    await this.redisController.removeCustomerLock(customer.cpf_pes);

    try {
      const addressRaw = customer.address?.[0] || {};
      const phonesRaw = (customer.phones || []) as Array<{ Telefone: string; DDD: string }>;

      const phone_numbers = phonesRaw.map(
        (p) => `${p.DDD}${String(p.Telefone).replace(/[-\s]/g, "")}`
      );

      const address_person: AddressType = {
        street: addressRaw.Endereco_pend || "",
        city: addressRaw.Cidade_pend || "",
        country: "Brasil",
        district: addressRaw.Bairro_pend || "",
        number: addressRaw.numEnd_pend || "S/N",
        state: addressRaw.UF_pend || "",
        zip_code: addressRaw.CEP_pend || ""
      };

      const type_person = Number(customer.tipo_pes) === 0 ? "PF" : "PJ";

      const formatted: CustomerType = {
        code_person: customer.cod_pes,
        full_name: customer.nome_pes,
        birth_date: parseBRDate(customer.dtnasc_pes),
        email: customer.Email_pes || "",
        type_person,
        cpf_person: type_person === "PF" ? customer.cpf_pes : "",
        cnpj_person: type_person === "PJ" ? customer.cpf_pes : "",
        address_person,
        enterprise: [""],
        trade_name: customer.NomeFant_Pes || "",
        password: customer.Senha_pes || "",
        phone_numbers,
        status: customer.Status_pes
      };

      await this.customerController.register(formatted);
    } catch (error) {
      throw error;
    }
  }
}
