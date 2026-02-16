import mongoose, { Schema } from "mongoose";
import { ref } from "process";

const DevelopmentSchema = new Schema(
  {
    development_code: { type: String, index: true, trim: true }, // Cod_obr
    company: { type: Number }, // Empresa_obr
    description: { type: String, trim: true }, // Descr_obr
    status: { type: Number }, // Status_obr
    address: { type: Object, trim: true }, // Ender_obr
    phone: { type: String, trim: true }, // Fone_obr
    inspector: { type: String, trim: true }, // Fisc_obr
    start_date: { type: String }, // DtIni_obr
    end_date: { type: String }, // Dtfim_obr
    development_type: { type: Number }, // TipoObra_obr
    sales_office_address: { type: String, trim: true }, // EnderEntr_obr
    cei_registration: { type: String, default: null, trim: true }, // CEI_obr
    created_by: { type: Schema.Types.ObjectId, ref: "User" }, // UsrCad_obr
    is_public: { type: Boolean, default: false }, // publico
    public_name: { type: String, default: "", trim: true }, // nomePublico
    link_maps: { type: String, default: "", trim: true },
    latitude: { type: String, default: "", trim: true },
    longitude: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

const Development =
  mongoose.models.Development ||
  mongoose.model("Development", DevelopmentSchema);

export default Development;
