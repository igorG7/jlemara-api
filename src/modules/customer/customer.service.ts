import { CustomerType } from "./domain/customer.interface";
import Customer from "./infra/customer.model";
import Console from "../utils/Console";

const notReturn = {
  password: 0,
  createdAt: 0,
  updatedAt: 0,
};

class CustomerService {
  async registerCustomer(data: CustomerType) {
    try {
      if (!data) {
        Console({ type: "error", message: "Data vazio." });
        return { error: null, message: "Data vazio.", data: null };
      }

      const { code_person } = data;

      Console({
        type: "log",
        message: `Cadastrando/atualizando cliente ${code_person}...`,
      });

      const customer = await Customer.findOneAndUpdate(
        { code_person },
        { ...data },
        { upsert: true, new: true, select: { ...notReturn } },
      ).lean();

      Console({
        type: "success",
        message: "Cliente cadastrado/atualizado com sucesso!",
      });

      return {
        message: "Cliente cadastrado/atualizado com sucesso!",
        data: customer,
      };
    } catch (error) {
      Console({
        type: "error",
        message: "Erro ao cadastrar/atualizar cliente.",
      });
      return {
        message: "Erro ao cadastrar/atualizar cliente.",
        error,
        data: null,
      };
    }
  }

  async registerBatchesCustomer(data: CustomerType[]) {
    try {
      if (!data || !data.length) {
        Console({ type: "error", message: "Data vazio." });
        return { error: null, message: "Data vazio.", data: null };
      }

      const total = data.length;
      let success = 0;
      let failure = 0;

      Console({
        type: "log",
        message: `Sincronizando lista de clientes (${total})...`,
      });

      for (const customer of data) {
        const { code_person } = customer;
        console.log(customer)
        if (!code_person && code_person !== 0) {
          Console({
            type: "warn",
            message: "Código pessoa vazio, ignorando registro.",
          });
          failure++;
          continue;
        }

        try {
          const response = await this.registerCustomer(customer);

          if (!response.data) {
            Console({
              type: "warn",
              message: `Falha ao sincronizar cliente ${code_person}: ${response.message}`,
            });
            failure++;
            continue;
          }

          Console({
            type: "success",
            message: `Cliente ${code_person} sincronizado com sucesso!`,
          });
          success++;
        } catch (error) {
          failure++;
          Console({
            type: "error",
            message: `Erro ao sincronizar cliente ${code_person}.`,
          });
        }
      }

      const message = `Total de clientes sincronizados: ${success} de ${total}. Falhas: ${failure}`;
      Console({ type: "success", message });
    } catch (error) {
      Console({ type: "error", message: "Erro ao sincronizar clientes." });
      return { message: "Erro ao sincronizar clientes.", error, data: null };
    }
  }
}

export default new CustomerService();
