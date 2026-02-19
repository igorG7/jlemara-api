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
    url: { type: String, required: true, trim: true },
    caption: { type: String, required: true, trim: true },
    visibility: { type: Boolean, required: true },
    public_id: { type: String, required: true },
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
    title: { type: String, default: null, trim: true }, // titulo
    description: { type: String, default: null, trim: true }, // descricao
    highlights: { type: [HighlightsSchema], default: [] }, // destaques
    price_from: { type: Number, default: null }, // precoAPartir
    average_area_m2: { type: Number, default: null }, // areaMediaM2
  },
  { _id: false },
);

const AddresSchemas = new Schema(
  {
    street: { type: String, default: "", trim: true, required: true },
    number: { type: Number, default: null, required: true },
    district: { type: String, default: "", trim: true, required: true },
    city: { type: String, default: "", trim: true, required: true },
    zip_code: { type: String, default: null, required: true },
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
    created_by: { type: Schema.Types.ObjectId, ref: "User" }, // UsrCad_obr Add chave tag-uau / senha-uau Model User
    is_public: { type: Boolean, default: false }, // publico
    public_name: { type: String, default: "", trim: true }, // nomePublico
    link_maps: { type: String, default: "", trim: true },
    infrastructure: { type: InfrastructureSchema, default: () => ({}) },
    infos_site: { type: InfosSiteSchemas, default: () => ({}) },
    photos: { type: [PhotosSchema], default: [] },
  },
  { timestamps: true, minimize: false },
);

const Development =
  mongoose.models.Development ||
  mongoose.model("Development", DevelopmentSchema);

export default Development;
