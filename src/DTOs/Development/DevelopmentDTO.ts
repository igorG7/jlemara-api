import { IDevelopment } from "../../Types/Development/Development";
import { ResponseFindObraWithCode } from "../../Services/Uau/Obra/uau.obra.types";
import { IAddress } from "../../Types/Development/Address";

export default class DevelopmentDTO {
  public static format(development: ResponseFindObraWithCode) {
    const address: IAddress = {
      street: "",
      number: "",
      district: DevelopmentDTO.extractDistrict(development.descr_obr),
      city: development.cid_obr,
      zip_code: development.cep_obr,
      latitude: "",
      longitude: "",
    };

    const developmentFormated: IDevelopment = {
      development_code: development.cod_obr,
      company: development.Empresa_obr,
      description: development.descr_obr,
      address,
      status: development.status_obr,
      created_by: development.UsrCad_obr,
    };

    const formatedAdrress: any = {};

    for (const [key, value] of Object.entries(address)) {
      if (!value) continue;
      formatedAdrress[`address.${key}`] = value;
    }

    return { ...developmentFormated, address: formatedAdrress };
  }

  static extractDistrict(district: string) {
    const regExp = /(?<=-\s)\S+.*/gim;
    const extractedDistrict = district.match(regExp);

    return extractedDistrict?.[0] as string;
  }
}
