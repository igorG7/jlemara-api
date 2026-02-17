import mongoose, { Schema } from "mongoose";

const InfrastructureSchema = new Schema(
  {
    water_supply: { type: Boolean, default: false }, // Água
    power_grid: { type: Boolean, default: false }, // Luz
    internet: { type: Boolean, default: false },
    sewage_system: { type: Boolean, default: false }, // Saneamento
    road_paving: { type: Boolean, default: false }, // Pavimenteção
    public_street_lighting: { type: Boolean, default: false }, // Iluminação pública
    green_area: { type: Boolean, default: false },
  },
  { _id: false },
);

const PhotosSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    caption: { type: String, required: true, trim: true },
    //description: { type: String, required: true, trim: true },
    visibility: { type: Boolean, required: true, default: true },
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
