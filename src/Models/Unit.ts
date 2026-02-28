import mongoose, { Schema } from "mongoose";

import { IUnit } from "../Types/Unit/Unit";
import { IPhoto } from "../Types/Photo/Photo";

const PhotosSchema = new Schema<IPhoto>(
  {
    url: { type: String, trim: true },
    caption: { type: String, trim: true },
    visibility: { type: Boolean },
    public_id: { type: String, unique: true },
  },
  { _id: false },
);

const UnitSchema = new Schema<IUnit>(
  {
    company: { type: Number, required: true },
    product_unit: { type: Number, required: true, index: true },
    unit_code: { type: Number, index: true, required: true },
    development_code: { type: String, trim: true, index: true, required: true },
    unit_status: { type: Number, default: 0 },
    category_status: { type: Number, default: 0 },
    registration_date: { type: Date, required: true },
    product_type_code: { type: String, required: true, trim: true },
    attachment_count: { type: Number, default: 0 },
    price: { type: Number, required: true },
    lot: { type: String, trim: true, default: "" },
    block: { type: String, trim: true, default: "" },
    unit_identifier: { type: String, required: true, trim: true, index: true },
    photos: { type: [PhotosSchema], default: [] },
    district: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    sale_number: { type: String, required: true, default: "0", index: true },
    uau_ref: { type: String, required: true, unique: true, index: true },
    quantity_available: { type: Number, default: 0, index: true },
  },
  { timestamps: true, minimize: true },
);

export default mongoose.model<IUnit>("Unit", UnitSchema);
