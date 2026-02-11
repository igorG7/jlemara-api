import mongoose, { Schema } from "mongoose";
import { CustomerType } from "../Types/CustomerTypes";

const CustomerSchema = new Schema<CustomerType>(
  {
    code_person: { type: Number, index: true, unique: true, required: true },
    full_name: { type: String, trim: true },
    birth_date: { type: Date || null, required: true },
    status: { type: Number, required: true },
    email: {
      type: String,
      trim: true,
      //index: true,
      // unique: true,
      required: true,
    },
    type_person: { type: String, required: true },
    cpf_person: { type: String, trim: true, }, // unique: true
    cnpj_person: { type: String, trim: true, }, // unique: true
    address_person: { type: Object, required: true },
    enterprise: { type: [String], default: null }, // obras
    trade_name: { type: String, trim: true },
    password: { type: String, required: true },
    phone_numbers: {
      type: [String],
      default: null,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: "",
  },
);

const Customer =
  mongoose.models.Customer ||
  mongoose.model<CustomerType>("Customer", CustomerSchema);

export default Customer;
