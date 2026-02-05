import { Request, Response } from "express";
import Console from "../Lib/Console";
import Customer from "../Models/Costumer";
import { CustomerType } from "../Types/CostumerTypes";

export default class CostumerController {
  async register(data: CustomerType) {
    const key = data.code_person;

    const customer = await Customer.findOneAndUpdate(
      { code_person: key },
      { ...data },
      { upsert: true, new: true },
    );

    return customer;
  }
}
