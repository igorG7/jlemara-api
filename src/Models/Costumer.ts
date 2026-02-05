import mongoose, { Schema } from "mongoose";
import { CustomerType } from "../Types/CostumerTypes";

const CustomerSchema = new Schema<CustomerType>(
  {
    code_person: { type: Number, index: true },
    full_name: { type: String, trim: true },
    birth_date: { type: Date },
    status: { type: Number },
    email: { type: String, trim: true, index: true },
    type_person: { type: String },
    address_person: { type: Object, trim: true },
    enterprise: { type: [String], default: null },
    trade_name: { type: String, trim: true },
    password: { type: String },
    phone_numbers: { type: [String], default: null, trim: true },
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
