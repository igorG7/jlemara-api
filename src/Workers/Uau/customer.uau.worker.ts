//src\Workers\Uau\customer.uau.worker.ts
import Console, { ConsoleData } from "../../modules/utils/Console";
import { CustomersWithSale } from "../../modules/customer/integration/customer.interface.integration";
import UauCustomerService from "modules/customer/integration/customer.integration";
import CustomerService from "modules/customer/customer.service";
import { CustomerDTO } from "modules/customer/dto/customer.format";

export default class CustomerUauWorker {
  private customerUauService = new UauCustomerService();
  private isRunning = false;

  async start() {
    if (this.isRunning) return;
    try {
      this.isRunning = true;
      await this.rescueErpCustomers();
      this.isRunning = false;
      return;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Problemas na inicialização do worker etl";
      Console({ type: "error", message });
      ConsoleData({ type: "error", data: error });
      return;
    }
  }

  private async rescueErpCustomers() {
    console.time("⏳ tempo total worker ⏳");

    Console({
      type: "log",
      message: "Iniciando verificação em lote no ERP UAU.",
    });

    try {
      const customersWithSale =
        (await this.customerUauService.findCustomersWithSale()) as CustomersWithSale[];

      if (!customersWithSale || customersWithSale.length === 0) {
        Console({ type: "success", message: "Nenhum cliente encontrado." });
        return;
      }

      const totalItems = customersWithSale.length;

      Console({
        type: "log",
        message: `${totalItems} clientes identificados no ERP.`,
      });

      let saved = 0;
      let errorCount = 0;

      const CHUNK_SIZE = 10;

      const dataToProcess = customersWithSale;

      for (let i = 0; i < dataToProcess.length; i += CHUNK_SIZE) {
        const chunk = dataToProcess.slice(i, i + CHUNK_SIZE);

        Console({
          type: "log",
          message: `Processando lote: ${i} até ${i + CHUNK_SIZE} de ${totalItems}...`,
        });

        await Promise.all(
          chunk.map(async (item) => {
            try {
              if (!item.Cod_pes) return;

              const detail = await this.customerUauService.findCustomerWithCode(
                item.Cod_pes,
              );
              if (!detail) return;

              const phones = await this.customerUauService.findPhonesCustomer(
                item.Cod_pes,
              );

              const address = await this.customerUauService.findAdressCustomer(
                item.Cod_pes,
              );

              const fullData = { ...detail, phones, address };

              if (!fullData.cpf_pes) throw new Error("CPF ausente.");

              const formatted = CustomerDTO.format(fullData);

              await CustomerService.registerCustomer(formatted);

              saved++;
            } catch (error) {
              errorCount++;
              const message =
                error instanceof Error
                  ? error.message
                  : "Problemas no processamento do cliente " + item.Cod_pes;
              Console({ type: "error", message });
            }
          }),
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      Console({
        type: "success",
        message: `Sincronismo finalizado: ${saved} salvos, ${errorCount} falhas.`,
      });

      console.timeEnd("⏳ tempo total worker ⏳");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Problemas no processamento worker uau customer";
      Console({
        type: "error",
        message: "Falha crítica no Worker de Sincronismo.",
      });
      Console({ type: "error", message });
    }
  }
}
