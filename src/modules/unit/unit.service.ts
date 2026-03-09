import Console, { ConsoleData } from "../utils/Console";
import { IUnit } from "./domain/unit.interface";
import { UnitDTO } from "./dto/unit.format";
import { ResponseUnitUauType } from "./integration/unit.interface.integration";
import Unit from "./infra/unit";

class UnitService {
  isEqual(a: any, b: any) {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  }

  generateSyncPatch(currentData: any, newData: any) {
    const mergedData: Record<string, any> = {};

    for (const [key, value] of Object.entries(newData)) {
      if (value === undefined) continue;
      const currentValue = currentData?.[key];
      if (!this.isEqual(currentValue, value)) mergedData[key] = value;
    }

    return mergedData;
  }

  async registerUnit(data: IUnit) {
    try {
      Console({ type: "log", message: "Cadastrando/atualizando unidade." });

      const { unit_code } = data;

      if (!unit_code) throw new Error("Código de unidade não informado");

      const currentData = await Unit.findOne({ unit_code }).lean();

      if (!currentData) {
        const unit = await Unit.create(data);

        Console({
          type: "success",
          message: "Unidade cadastrada/atualizada com sucesso!",
        });

        return {
          status: 201,
          message: "Unidade cadastrada/atualizada com sucesso!",
          data: unit,
        };
      }

      const newPatch = this.generateSyncPatch(currentData, data);

      if (Object.keys(newPatch).length === 0) return currentData;

      const updatedUnit = await Unit.findOneAndUpdate(
        { unit_code },
        { $set: { newPatch } },
        { new: true },
      ).lean();

      Console({
        type: "success",
        message: "Unidade cadastrada/atualizada com sucesso!",
      });

      return {
        status: 200,
        message: "Unidade cadastrada/atualizada com sucesso!",
        data: updatedUnit,
      };
    } catch (error: unknown) {
      Console({
        type: "error",
        message: error instanceof Error ? error.message : "Erro critico",
      });

      return {
        status: 500,
        message: "Erro ao cadastrar/atualizar unidade.",
        error,
        data: null,
      };
    }
  }

  async registerManyUnits(data: ResponseUnitUauType[]) {
    Console({
      type: "log",
      message: "Cadastrando/atualizando unidades em lote.",
    });

    try {
      if (!data?.length) return [];

      const ops = data
        .filter((p) => !!p?.Identificador_unid)
        .map((p) => {
          const incoming = UnitDTO.format(p);
          return {
            updateOne: {
              filter: { unit_identifier: incoming.unit_identifier },
              update: { $set: incoming },
              upsert: true,
            },
          };
        });

      if (!ops.length) return [];

      await Unit.bulkWrite(ops, { ordered: false });

      const ids = data
        .map((p) => p?.Identificador_unid)
        .filter(Boolean) as string[];

      const units = await Unit.find({ unit_identifier: { $in: ids } }).lean();

      Console({
        type: "success",
        message: "Unidades cadastradas/atualizadas com sucesso!",
      });

      return units;
    } catch (error) {
      Console({
        type: "error",
        message: "Erro ao cadastrar/atualizar units em lote.",
      });
      ConsoleData({ type: "error", data: error });
      return null;
    }
  }
}

export default new UnitService();
