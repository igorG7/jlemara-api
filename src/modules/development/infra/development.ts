import mongoose, { Schema } from "mongoose";

const InfrastructureSchema = new Schema(
  {
    water_supply: { type: Boolean, default: false }, // Água
    power_grid: { type: Boolean, default: false }, // Luz
    internet: { type: Boolean, default: false }, // Internet
    sewage_system: { type: Boolean, default: false }, // Saneamento
    road_paving: { type: Boolean, default: false }, // Pavimenteção
    public_street_lighting: { type: Boolean, default: false }, // Iluminação pública
    green_area: { type: Boolean, default: false }, // Area verde
  },
  { _id: false },
);

const PhotosSchema = new Schema(
  {
    url: { type: String, trim: true },
    caption: { type: String, trim: true },
    visibility: { type: Boolean },
    public_id: { type: String },
  },
  { _id: false },
);

const HighlightsSchema = new Schema(
  {
    name: { type: String, default: null, trim: true },
    description: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const InfosSiteSchemas = new Schema(
  {
    title: { type: String, default: "", trim: true }, // titulo
    description: { type: String, default: "", trim: true }, // descricao
    highlights: { type: [HighlightsSchema], default: [] }, // destaques
    price_from: { type: Number, default: 0 }, // precoAPartir
    average_area_m2: { type: Number, default: 0 }, // areaMediaM2
  },
  { _id: false },
);

const AddresSchemas = new Schema(
  {
    street: { type: String, default: "", trim: true, required: true },
    number: { type: String, default: "", required: true },
    district: { type: String, default: "", trim: true, required: true },
    city: { type: String, default: "", trim: true },
    zip_code: { type: String, default: "", required: true },
    latitude: { type: String, default: "", trim: true },
    longitude: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const DevelopmentSchema = new Schema(
  {
    development_code: { type: String, index: true, trim: true }, // Cod_obr
    company: { type: Number }, // Empresa_obr
    description: { type: String, trim: true }, // Descr_obr
    status: { type: Number }, // Status_obr
    address: { type: AddresSchemas, default: () => ({}) }, // Ender_obr
    created_by: { type: String, ref: "User" }, // UsrCad_obr Add chave tag-uau / senha-uau Model User
    is_public: { type: Boolean, default: false }, // publico
    public_name: { type: String, default: "", trim: true }, // nomePublico
    link_maps: { type: String, default: "", trim: true },
    infrastructure: { type: InfrastructureSchema, default: () => ({}) },
    infos_site: { type: InfosSiteSchemas, default: () => ({}) },
    photos: { type: [PhotosSchema], default: () => [] },
  },
  { timestamps: true, minimize: false },
);

const Development =
  mongoose.models.Development ||
  mongoose.model("Development", DevelopmentSchema);

export default Development;
