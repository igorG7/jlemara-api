import { Request, response, Response } from "express";
import Console from "../Lib/Console";
import Customer from "../Models/Costumer";

const notReturn = {
  password: 0,
  createdAt: 0,
  updatedAt: 0,
};

class CostumerController {
  async register(data: any) {
    const key = data.code_person;

    const customer = await Customer.findOneAndUpdate(
      { code_person: key },
      { ...data },
      { upsert: true, new: true },
    );

    return customer;
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
      Console({ type: "log", message: "Buscando todos os clientes." });

      const customers = await Customer.find({}, { ...notReturn }).lean();

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
      Console({ type: "log", message: "Buscando clientes ativos." });

      const customers = await Customer.find(
        { status: 1 },
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
