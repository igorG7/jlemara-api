import { Request, Response } from "express";
import Console from "../Lib/Console";
import Customer from "../Models/Costumer";

import { CustomerType } from "../Types/CostumerTypes";

const notReturn = {
  password: 0,
  createdAt: 0,
  updatedAt: 0,
};

class CostumerController {
  async registerCustomer(data: CustomerType) {
    try {
      if (!data) {
        Console({ type: "error", message: "Data vazio." });
        return {
          error: null,
          message: "Data vazio.",
          data: null,
        };
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

  async registerBatchesCustomer(data: any[]) {
    try {
      if (!data || !data.length) {
        Console({ type: "error", message: "Data vazio." });
        return {
          error: null,
          message: "Data vazio.",
          data: null,
        };
      }

      const total = data.length;
      let success = 0;
      let failure = 0;

      Console({
        type: "log",
        message: `Sincronizando lista de clientes (${total})...`,
      });

      for (const customer of data as CustomerType[]) {
        const { code_person } = customer;

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
      Console({
        type: "error",
        message: "Erro ao sincronizar clientes.",
      });
      return {
        message: "Erro ao sincronizar clientes.",
        error,
        data: null,
      };
    }
  }

  // * Temporario
  async createClient(req: Request, res: Response) {
    try {
      const body = req.body;
      await Customer.create(body);
      res.status(201).json({ message: "cliente criado", body });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  async findCustomer(req: Request, res: Response) {
    try {
      const query = req.body;

      Console({ type: "log", message: "Buscando cliente" });
      const customer = await Customer.findOne(query, {
        ...notReturn,
      });

      if (!customer) {
        return res
          .status(404)
          .json({ message: "Cliente não encontrado.", error: null });
      }

      Console({ type: "success", message: "Busca concluída com sucesso." });
      return res
        .status(200)
        .json({ message: "Busca concluída.", data: customer });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async findCustomerByPartialName(req: Request, res: Response) {
    try {
      const { name } = req.body;
      Console({ type: "log", message: "Buscando clientes" });

      const customers = await Customer.find(
        {
          full_name: { $regex: name, $options: "i" },
        },
        { ...notReturn },
      ).lean();

      if (!customers.length) {
        Console({ type: "warn", message: "Nenhum cliente encontrado." });
        return res.status(404).json({
          message: "Nenhum cliente encontrado.",
          error: null,
          data: [],
        });
      }

      Console({
        type: "success",
        message: "Clientes encontrados com sucesso.",
      });

      return res.status(200).json({
        message: "Clientes encontrados com sucesso.",
        data: customers,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async listAll(req: Request, res: Response) {
    try {
      const page = Number(req.params.page) || 1;
      const customersPerPage = Number(req.params.number) || 5;

      Console({ type: "log", message: "Buscando todos os clientes." });

      const customers = await Customer.find(
        {},
        { ...notReturn },
        {
          sort: { full_name: 1 },
          limit: customersPerPage,
          skip: (page - 1) * customersPerPage,
        },
      ).lean();

      if (!customers.length) {
        Console({ type: "warn", message: "Nenhum cliente encontrado." });

        return res.status(404).json({
          message: "Nenhum cliente encontrado.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Busca concluída com sucesso." });
      return res
        .status(200)
        .json({ message: "Busca concluída com sucesso.", data: customers });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async listAllActiveCustomers(req: Request, res: Response) {
    try {
      const page = Number(req.params.page) || 1;
      const customersPerPage = Number(req.params.number) || 5;

      Console({ type: "log", message: "Buscando clientes ativos." });

      const customers = await Customer.find(
        { status: 1 },
        { ...notReturn },
        {
          sort: { full_name: 1 },
          limit: customersPerPage,
          skip: (page - 1) * customersPerPage,
        },
      ).lean();

      if (!customers.length) {
        Console({ type: "warn", message: "Nenhum cliente encontrado." });
        return res.status(404).json({
          message: "Nenhum cliente encontrado.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Busca concluída com sucesso." });
      return res
        .status(200)
        .json({ message: "Busca concluída com sucesso.", data: customers });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const { id, ...body } = req.body;

      const customerUpdated = await Customer.findByIdAndUpdate(
        id,
        { ...body, updatedAt: new Date() },
        { select: { ...notReturn }, new: true },
      );

      if (!customerUpdated) {
        Console({ type: "error", message: "Cliente não encontrado." });
        return res
          .status(404)
          .json({ message: "Cliente não encontrado.", error: null });
      }

      Console({
        type: "success",
        message: "Atualização de cliente concluída.",
      });
      return res.status(200).json({
        message: "Atualização de cliente concluída.",
        data: customerUpdated,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }
}

export default new CostumerController();
