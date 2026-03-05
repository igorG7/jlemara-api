import { IUnit } from "../domain/unit.interface";
import { ResponseUnitUauType } from "../integration/unit.interface.integration";

export class UnitDTO {
  static toStr(value: unknown) {
    if (value === undefined || value === null) return "";
    return String(value).trim();
  }

  static cleanNullString(value: unknown) {
    return value === "null" ? null : value;
  }

  static formatToUauRef(
    company: number,
    product_unit: number,
    unit_code: number,
    development_code: string,
  ) {
    return `${company}-${product_unit}-${unit_code}-${development_code}`;
  }

  static format(data: ResponseUnitUauType): IUnit {
    const block =
      UnitDTO.toStr(data.C1_unid) || UnitDTO.toStr(data.C4_unid).split("-")[0];

    const lot =
      UnitDTO.toStr(data.C2_unid) || UnitDTO.toStr(data.C2_unid).split("-")[2];

    const unitFormated: IUnit = {
      development_code: data.Obra_unid,
      company: data.Empresa_unid,
      product_unit: data.Prod_unid,
      unit_code: data.NumPer_unid,
      unit_status: data.Vendido_unid > 0 ? 1 : 0,
      category_status:
        String(data.NumCategStatus_unid) === "null"
          ? 0
          : Number(data.NumCategStatus_unid),
      attachment_count: data.anexos_unid,
      block: block,
      lot: lot,
      city: (UnitDTO.cleanNullString(data.C7_unid) as string | null) ?? null,
      district:
        (UnitDTO.cleanNullString(data.C6_unid) as string | null) ?? null,

      unit_identifier: data.Identificador_unid,
      price: String(data.C13_unid) === "null" ? 0 : Number(data.C13_unid),
      product_type_code: data.CodTipProd_unid,
      registration_date: new Date(data.DataCad_unid),
      sale_number: String(data.Num_Ven),
      quantity_available: data.Qtde_unid,
      uau_ref: UnitDTO.formatToUauRef(
        data.Empresa_unid,
        data.Prod_unid,
        data.NumPer_unid,
        data.Obra_unid,
      ),
    };

    return unitFormated;
  }
}
