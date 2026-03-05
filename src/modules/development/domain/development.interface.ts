import { IPhoto } from "modules/unit/domain/photo.interface";

export interface IDevelopment {
  development_code: string; // Cod_obr
  company: number; // Empresa_obr
  description: string; // Descr_obr
  status: number; // Status_obr

  address: IAddress; // Ender_obr
  created_by?: string; //Types.ObjectId;  // UsrCad_obr (ref: User)

  is_public?: boolean; // publico
  public_name?: string; // nomePublico
  link_maps?: string;

  infrastructure?: IInfrastructure;
  infos_site?: IInfosSite;
  photos?: IPhoto[];
}
export interface IInfosSite {
  title: string; // titulo
  description: string; // descricao
  highlights: { name: string; description: string }[]; // destaques
  price_from: number; // precoAPartir
  average_area_m2: number; // areaMediaM2
}

export interface IAddress {
  street: string;
  number: string;
  district: string;
  city: string;
  zip_code: string;
  latitude: string;
  longitude: string;
}

export interface IInfrastructure {
  water_supply: boolean; // Água
  power_grid: boolean; // Luz
  internet: boolean; // Internet
  sewage_system: boolean; // Saneamento
  road_paving: boolean; // Pavimenteção
  public_street_lighting: boolean; // Iluminação pública
  green_area: boolean; // Area verde
}
