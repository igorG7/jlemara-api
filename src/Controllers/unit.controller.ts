import { Request, Response } from "express";

import Unit from "../Models/Unit";
import Console, { ConsoleData } from "../Lib/Console";
import { UnitDTO } from "../DTOs/Unit/UnitDTOs";

import { IUnit } from "../Types/Unit/Unit";
import { ResponseUnitUauType } from "../Types/Unit/ResponseUnitUau";

class UnitController {
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

  async createTemp(req: Request, res: Response) {
    try {
      const body = req.body;

      const unit = await Unit.create(body);

      return res.status(200).json({ message: "Criado", data: unit });
    } catch (error) {
      return res.status(500).json({ error });
    }
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
        message: "Erro ao cadastrar/atualizar obra.",
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

  async findAvaliables(req: Request, res: Response) {
    try {
      const page = Number(req.params.page) || 1;
      const limit = Number(req.params.limit) || 5;

      Console({ type: "log", message: "Buscando Units disponíveis." });
      // * Vericar sobre o tamanho total da coleção.
      const units = await Unit.find(
        { unit_status: 0 },
        {},
        { limit, skip: (page - 1) * limit },
      ).lean();

      if (!units.length) {
        Console({ type: "warn", message: "Nenhuma unidade encontrada." });

        return res.status(404).json({
          message: "Nenhuma unidade encontrada.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Busca concluída com sucesso!" });

      return res.status(200).json({
        message: "Busca concluída com sucesso!",
        data: units,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });

      return res.status(500).json({
        message: "Erro interno inesperado.",
        error,
      });
    }
  }

  async findUnits(req: Request, res: Response) {
    try {
      const query = req.body;

      const page = Number(req.params.page) || 1;
      const limit = Number(req.params.limit) || 5;

      Console({ type: "log", message: "Buscando unidade." });

      const units = await Unit.find(
        query,
        {},
        { limit, skip: (page - 1) * limit },
      ).lean();

      if (!units.length) {
        Console({ type: "warn", message: "Nenhuma unidade encontrada." });

        return res.status(404).json({
          message: "Nenhuma unidade encontrada.",
          error: null,
          data: [],
        });
      }

      Console({ type: "success", message: "Busca concluída com sucesso!" });

      return res.status(200).json({
        message: "Busca concluída com sucesso!",
        data: units,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });

      return res.status(500).json({
        message: "Erro interno inesperado.",
        error,
      });
    }
  }

  async addPhotos(req: Request, res: Response) {
    try {
      const { id, photos } = req.body;

      Console({
        type: "log",
        message: "Adicionando fotos na unidade.",
      });

      const updatedUnit = await Unit.findByIdAndUpdate(
        id,
        { $addToSet: { photos: { $each: photos } }, updatedAt: new Date() },
        { new: true, runValidators: true },
      ).lean();

      if (!updatedUnit) {
        Console({
          type: "error",
          message: "Unidade não encontrada para adicionar fotos.",
        });

        return res.status(404).json({
          message: "Unidade não encontrada para adicionar fotos.",
          error: null,
        });
      }

      Console({ type: "success", message: "Fotos adicionadas com sucesso!" });

      return res.status(200).json({
        message: "Fotos adicionadas com sucesso!",
        data: updatedUnit,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });

      return res.status(500).json({
        message: "Erro interno inesperado.",
        error,
      });
    }
  }

  async removePhoto(req: Request, res: Response) {
    try {
      const { id, public_id } = req.body;

      const updatedUnit = await Unit.findByIdAndUpdate(
        id,
        {
          $pull: { photos: { public_id: public_id } },
          updatedAt: new Date(),
        },
        { new: true },
      );

      if (!updatedUnit) {
        Console({ type: "warn", message: "Unidade não encontrada." });

        return res.status(404).json({
          message: "Unidade não encontrada.",
          error: null,
        });
      }

      Console({ type: "success", message: "Foto removida com sucesso!" });

      return res.status(200).json({
        message: "Foto removida com sucesso!",
        data: updatedUnit,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });

      return res.status(500).json({
        message: "Erro interno inesperado.",
        error,
      });
    }
  }

  async updatePhoto(req: Request, res: Response) {
    try {
      const { id, photo } = req.body;

      Console({ type: "log", message: "Atualizando foto de unidade." });

      const updateUnit = await Unit.findOneAndUpdate(
        { _id: id },
        { $set: { "photos.$[photo]": photo } },
        { new: true, arrayFilters: [{ "photo.public_id": photo.public_id }] },
      );

      Console({
        type: "success",
        message: "Foto de Unidade atualizada com sucesso!",
      });

      return res.status(200).json({
        message: "Foto de Unidade atualizada com sucesso!",
        data: updateUnit,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });

      return res.status(500).json({
        message: "Erro interno inesperado.",
        error,
      });
    }
  }

  async updateUnit(req: Request, res: Response) {
    try {
      const { id, ...body } = req.body;

      Console({ type: "log", message: "Atualizando unidade." });

      const updatedUnit = await Unit.findByIdAndUpdate(
        id,
        { ...body, updatedAt: new Date() },
        { new: true },
      );

      if (!updatedUnit) {
        Console({ type: "warn", message: "Unidade não encontrada." });

        return res
          .status(404)
          .json({ message: "Unidade não encontrada.", error: null });
      }

      Console({ type: "success", message: "Unidade atualizada com sucesso." });

      return res.status(200).json({
        message: "Unidade atualizada com sucesso.",
        data: updatedUnit,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });

      return res.status(500).json({
        message: "Erro interno inesperado.",
        error,
      });
    }
  }
}

export default new UnitController();
