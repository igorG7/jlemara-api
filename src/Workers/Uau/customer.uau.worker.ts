//src\Workers\Uau\customer.uau.worker.ts
import Console, { ConsoleData } from "../../Lib/Console";
import { CustomersWithSale } from "../../Services/Uau/Customer/uau.customer.dto";
import { AddressType, CustomerType } from "Types/CustomerTypes";
import parseBRDate from "../../Utils/dateParser";
import CustomerController from "../../Controllers/customer.controller";
import mountCustomerAdress from "./mountCustomerAdress";
import UauCustomerService from "Services/Uau/Customer/uau.costumer.service";


export default class CustomerUauWorker {
  private customerUauService = new UauCustomerService();
  private customerController = new CustomerController();
  private isRunning = false

  async start() {
    if (this.isRunning) return
    try {
      this.isRunning = true
      await this.rescueErpCustomers()
      this.isRunning = false
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : "Problemas na inicialização do worker etl"
      Console({ type: "error", message });
      ConsoleData({ type: "error", data: error })
      return
    }
  }

  private async rescueErpCustomers() {
    console.time("⏳ tempo total worker ⏳");

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
      const CHUNK_SIZE = 10; // Processa CHUNK_SIZE clientes por vez em paralelo

      const dataToProcess = customersWithSale // utilizado para testes com um .slice(x, y)

      for (let i = 0; i < dataToProcess.length; i += CHUNK_SIZE) {

        // [clientes atual] = chunk
        const chunk = dataToProcess.slice(i, i + CHUNK_SIZE);

        Console({ type: "log", message: `Processando lote: ${i} até ${i + CHUNK_SIZE} de ${totalItems}...` });

        await Promise.all(
          chunk.map(async (item) => {
            try {
              if (!item.Cod_pes) return;

              const detail = await this.customerUauService.findCustomerWithCode(item.Cod_pes);
              if (!detail) return;

              const phones = await this.customerUauService.findPhonesCustomer(item.Cod_pes);

              const address = await this.customerUauService.findAdressCustomer(item.Cod_pes);

              const fullData = { ...detail, phones, address };

              await this.formatCustomerAndSave(fullData);

              saved++;
            } catch (error) {
              errorCount++;
              const message = error instanceof Error ? error.message : "Problemas no processamento do cliente " + item.Cod_pes
              Console({ type: "error", message })
            }
          })
        );
        await new Promise(resolve => setTimeout(resolve, 1000)); // respiro para a api uau de 1s
      }

      Console({ type: "success", message: `Sincronismo finalizado: ${saved} salvos, ${errorCount} falhas.` });

      console.timeEnd("⏳ tempo total worker ⏳");

    } catch (error) {

      const message = error instanceof Error ? error.message : "Problemas no processamento worker uau customer "
      Console({ type: "error", message: "Falha crítica no Worker de Sincronismo." });
      Console({ type: "error", message })
    }
  }

  private async formatCustomerAndSave(customer: any) {
    if (!customer || !customer.cpf_pes) {
      throw new Error("CPF ausente.");
    }

    try {
      const addressRaw = customer.address?.[0] || {};

      const phonesRaw = (customer.phones || []) as Array<{ Telefone: string; DDD: string }>;

      const phone_numbers = phonesRaw.map(
        (p) => `${p.DDD}${String(p.Telefone).replace(/[-\s]/g, "")} `
      );

      const address_person: AddressType = mountCustomerAdress(addressRaw)

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
