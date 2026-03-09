import { Request, Response } from "express";
import Console from "../utils/Console";
import Customer from "./infra/customer.model";

const notReturn = {
  password: 0,
  createdAt: 0,
  updatedAt: 0,
};

class CustomerController {
  async createClient(req: Request, res: Response) {
    try {
      const body = req.body;
      await Customer.create(body);
      res.status(201).json({ message: "Cliente criado.", data: body });
    } catch (error) {
      res.status(500).json({ message: "Erro interno inesperado.", error });
    }
  }

  async findCustomer(req: Request, res: Response) {
    try {
      const query = req.body;

      Console({ type: "log", message: "Buscando cliente." });

      const customer = await Customer.findOne(query, { ...notReturn });

      if (!customer) {
        Console({ type: "warn", message: "Cliente não encontrado." });
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
      const name = req.params.name;

      Console({ type: "log", message: "Buscando clientes." });

      const customers = await Customer.find(
        { full_name: { $regex: name, $options: "i" } },
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

      Console({ type: "success", message: "Clientes encontrados com sucesso." });

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

      const [customers, total] = await Promise.all([
        Customer.find(
          {},
          { ...notReturn },
          {
            sort: { full_name: 1 },
            limit: customersPerPage,
            skip: (page - 1) * customersPerPage,
          },
        ).lean(),
        Customer.countDocuments(),
      ]);

      if (!customers.length) {
        Console({ type: "warn", message: "Nenhum cliente encontrado." });
        return res.status(404).json({
          message: "Nenhum cliente encontrado.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Busca concluída com sucesso." });

      return res.status(200).json({
        message: "Busca concluída com sucesso.",
        data: customers,
        pagination: {
          total,
          page,
          limit: customersPerPage,
          pages: Math.ceil(total / customersPerPage),
        },
      });
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

      const [customers, total] = await Promise.all([
        Customer.find(
          { status: 1 },
          { ...notReturn },
          {
            sort: { full_name: 1 },
            limit: customersPerPage,
            skip: (page - 1) * customersPerPage,
          },
        ).lean(),
        Customer.countDocuments({ status: 1 }),
      ]);

      if (!customers.length) {
        Console({ type: "warn", message: "Nenhum cliente encontrado." });
        return res.status(404).json({
          message: "Nenhum cliente encontrado.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Busca concluída com sucesso." });

      return res.status(200).json({
        message: "Busca concluída com sucesso.",
        data: customers,
        pagination: {
          total,
          page,
          limit: customersPerPage,
          pages: Math.ceil(total / customersPerPage),
        },
      });
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

      Console({ type: "success", message: "Atualização de cliente concluída." });

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

  async updatePhoneCustomer(req: Request, res: Response) {
    try {
      const { id, phone_number } = req.body;

      Console({ type: "log", message: "Atualizando telefone do cliente." });

      const customerUpdated = await Customer.findByIdAndUpdate(
        id,
        {
          $set: { "phone_numbers.0": phone_number },
          updatedAt: new Date(),
        },
        { new: true, select: { ...notReturn } },
      );

      if (!customerUpdated) {
        Console({ type: "error", message: "Cliente não encontrado." });
        return res
          .status(404)
          .json({ message: "Cliente não encontrado.", error: null });
      }

      Console({ type: "success", message: "Telefone atualizado com sucesso." });

      return res.status(200).json({
        message: "Telefone atualizado com sucesso.",
        data: customerUpdated,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async findManyAddressCustomer(req: Request, res: Response) {
    try {
      const { codes }: { codes: string[] | number[] } = req.body;

      Console({ type: "log", message: "Buscando endereço dos clientes." });

      const customers = await Customer.find(
        { code_person: { $in: codes } },
        { code_person: 1, full_name: 1, address_person: 1 },
      ).lean();

      if (!customers.length) {
        Console({ type: "error", message: "Nenhum cliente encontrado." });
        return res.status(404).json({
          message: "Nenhum cliente encontrado.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Busca por endereços concluída." });

      return res.status(200).json({
        message: "Busca por endereços concluída.",
        data: customers,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }

  async findAddressCustomer(req: Request, res: Response) {
    try {
      const code_person = req.params.code_person;

      Console({ type: "log", message: "Buscando endereço do cliente." });

      const customer = await Customer.findOne(
        { code_person },
        { address_person: 1, full_name: 1 },
      ).lean();

      if (!customer) {
        Console({ type: "error", message: "Cliente não encontrado." });
        return res
          .status(404)
          .json({ message: "Cliente não encontrado.", error: null });
      }

      Console({ type: "success", message: "Busca por endereço concluída." });

      return res.status(200).json({
        message: "Busca por endereço concluída.",
        data: customer,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  }
}

export default new CustomerController();
