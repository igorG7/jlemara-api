import { Request, Response } from "express";

import PendingIssues from "../Models/PendingIssues";
import Console from "../Lib/Console";

import { PendingUserIssueType, PendingStatus } from "../Models/PendingIssues";

export type PendingDeleteType = {
  userID: string;
  reference: string;
  notes?: string;
};

export type PendingUpdateType = {
  userID: string;
  reference: string;
  status: PendingStatus;
  notes: string;
};

class PendingIssuesUser {
  checkPendingExists = async (reference: string, userID: string) => {
    const existPendingIssue = await PendingIssues.findOne({
      reference,
      userID,
    });
    return existPendingIssue;
  };

  findPendingIssue = async (req: Request, res: Response) => {
    try {
      const { userID }: { userID: string } = req.body;

      const pendingIssues = await PendingIssues.find({ userID }).lean();

      if (!pendingIssues.length) {
        Console({ type: "error", message: "Nenhuma pendência encontrada." });
        return res
          .status(404)
          .json({ message: "Nenhuma pendência encontrada.", error: null });
      }

      Console({ type: "success", message: "Busca por pendências concluída." });

      return res.status(200).json({
        message: "Busca por pendências concluída.",
        data: pendingIssues,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  };

  registerPendingIssue = async (req: Request, res: Response) => {
    try {
      const newPendingIssue: PendingUserIssueType = req.body;

      const existPendingIssue = await this.checkPendingExists(
        newPendingIssue.reference,
        newPendingIssue.userID,
      );

      if (existPendingIssue) {
        Console({ type: "error", message: "Pendência já está cadastrada." });
        return res
          .status(400)
          .json({ message: "Pendência já está cadastrada.", error: null });
      }

      await PendingIssues.create(newPendingIssue);

      Console({
        type: "success",
        message: "Pendência cadastrada com sucesso.",
      });

      return res.status(201).json({
        message: "Pendência cadastrada com sucesso.",
        data: newPendingIssue,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  };

  updatePendingIssue = async (req: Request, res: Response) => {
    try {
      const { userID, reference, status, notes }: PendingUpdateType = req.body;

      let bodyLog;

      if (notes) {
        bodyLog = {
          status: status ?? "PENDING",
          date: new Date(),
          notes,
        };
      }

      const updatedPending = await PendingIssues.findOneAndUpdate(
        { userID, reference },
        {
          $set: { status, updatedAt: new Date() },
          $push: { log: bodyLog },
        },
        { new: true },
      ).lean();

      if (!updatedPending) {
        return res
          .status(404)
          .json({ message: "Pendência não encontrada.", error: null });
      }

      Console({ type: "success", message: "Pendência atualizada." });
      return res
        .status(200)
        .json({ message: "Pendência atualizada.", data: updatedPending });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  };

  deletePendingIssue = async (req: Request, res: Response) => {
    try {
      const { userID, reference, notes }: PendingDeleteType = req.body;

      const bodyLog = {
        status: "CANCELED",
        date: new Date(),
        notes: notes,
      };

      const pendingIssue = await PendingIssues.findOneAndUpdate(
        { userID, reference },
        {
          $set: { status: "CANCELED", updatedAt: new Date() },
          $push: { log: bodyLog },
        },
      ).lean();

      if (!pendingIssue) {
        Console({ type: "error", message: "Pendência não encontrada." });
        return res
          .status(404)
          .json({ message: "Pendência não encontrada.", error: null });
      }

      Console({ type: "success", message: "Pendência deletada com sucesso." });

      res.status(200).json({
        message: "Pendência deletada com sucesso.",
        data: null,
      });
    } catch (error) {
      Console({ type: "error", message: "Erro interno inesperado." });
      return res
        .status(500)
        .json({ message: "Erro interno inesperado.", error });
    }
  };
}

export default new PendingIssuesUser();
