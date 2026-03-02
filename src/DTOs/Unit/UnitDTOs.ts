import { IUnit } from "../../Types/Unit/Unit";
import { ResponseUnitUauType } from "../../Types/Unit/ResponseUnitUau";

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
    development_code: string,
    unit_code: number,
  ) {
    return `${company}-${development_code}-${unit_code}`;
  }

  static format(data: ResponseUnitUauType): IUnit {
    const block = UnitDTO.toStr(data.C3_unid) || UnitDTO.toStr(data.C4_unid);

    const lot = UnitDTO.toStr(data.C1_unid) || UnitDTO.toStr(data.C2_unid);

    const unitFormated: IUnit = {
      development_code: data.Obra_unid,
      company: data.Empresa_unid,
      product_unit: data.Prod_unid,
      unit_code: data.NumPer_unid,
      unit_status: data.Vendido_unid > 0 ? 1 : 0,
      category_status: data.NumCategStatus_unid ?? null,
      attachment_count: data.anexos_unid,
      block: block,
      lot: lot,
      city: (UnitDTO.cleanNullString(data.C5_unid) as string | null) ?? null,
      district:
        (UnitDTO.cleanNullString(data.C6_unid) as string | null) ?? null,
      latitude:
        (UnitDTO.cleanNullString(data.C7_unid) as string | null) ?? null,
      longitude:
        (UnitDTO.cleanNullString(data.C8_unid) as string | null) ?? null,
      unit_identifier: data.Identificador_unid,
      price: data.ValPreco_unid,
      product_type_code: data.CodTipProd_unid,
      registration_date: new Date(data.DataCad_unid),
      sale_number: data.Num_Ven,
      quantity_available: data.Qtde_unid,
      uau_ref: UnitDTO.formatToUauRef(
        data.Empresa_unid,
        data.Obra_unid,
        data.Prod_unid,
      ),
    };

    return unitFormated;
  }
}
