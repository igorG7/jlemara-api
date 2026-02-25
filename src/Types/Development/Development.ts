import { IInfrastructure } from "./Infrastructure";
import { IAddress } from "./Address";
import { IInfosSite } from "./InfoSite";
import { IPhoto } from "./Photo";

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
