import { Request, Response } from "express";
import SaleTeam from "./infra/saleTeam";
import Console from "../utils/Console";
import { SaleTeamType } from "./domain/saleTeam.interface";
import User from "../user/infra/user";

class TeamController {


  // Busca todas as equipes ativas e popula os dados do Manager

  async findTeamsActives(req: Request, res: Response) {
    try {
      const teams = await SaleTeam.find({ isActive: true })
        .populate("manager", "name email role") // Traz dados do Consultor
        .populate("members", "name") // Traz dados do corretor
        .lean();

      return res.status(200).json({
        message: "Equipes encontradas com sucesso",
        count: teams.length,
        data: teams
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar equipes ativas.";
      Console({ type: "error", message });
      return res.status(500).json({ message, error });
    }
  }

  // Busca uma equipe específica e seus membros detalhados
  async findTeam(req: Request, res: Response) {
    try {
      const { id } = req.body; // Usando params para GET
      const team = await SaleTeam.findById(id)
        .populate("manager", "name email")
        .populate("members", "name email role phone")
        .lean();
      console.log(team)
      if (!team) {
        return res.status(404).json({ message: "Equipe não encontrada" });
      }

      return res.status(200).json({ message: "Equipe encontrada com sucesso", data: team });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar equipe.", error });
    }
  }

  async createTeam(req: Request, res: Response) {
    try {
      const { name, manager, description, members, isActive } = req.body;

      const newTeam = await SaleTeam.create({
        name,
        manager,
        description,
        members: members || [],
        isActive: isActive || true
      }) as SaleTeamType


      if (newTeam.members && newTeam.members.length > 0) {
        await User.updateMany(
          { _id: { $in: newTeam.members } },
          { $set: { teamId: newTeam._id } }
        );
      }

      return res.status(201).json({ message: `Equipe ${name} cadastrada com sucesso`, data: newTeam });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar equipe.";
      Console({ type: "error", message });
      return res.status(500).json({ message, error });
    }
  }

  // Insere um membro e atualiza o perfil do usuário
  async insertTeamMember(req: Request, res: Response) {
    try {
      const { teamId, userId } = req.body;

      // 1. Adiciona o usuário na lista de membros da equipe (evitando duplicata com $addToSet)
      const team = await SaleTeam.findByIdAndUpdate(
        teamId,
        { $addToSet: { members: userId } },
        { new: true }
      );

      if (!team) return res.status(404).json({ message: "Equipe não encontrada" });

      // 2. Vincula a equipe ao perfil do Usuário
      await User.findByIdAndUpdate(userId, { teamId: teamId });

      return res.status(200).json({ message: "Membro inserido com sucesso", data: team });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao inserir membro", error });
    }
  }

  // Remove um membro e limpa o teamId do usuário
  async removeTeamMember(req: Request, res: Response) {
    try {
      const { teamId, userId } = req.body;

      const team = await SaleTeam.findByIdAndUpdate(
        teamId,
        { $pull: { members: userId } },
        { new: true }
      );

      // Remove o vínculo da equipe no documento do usuário
      await User.findByIdAndUpdate(userId, { $unset: { teamId: "" } });

      return res.status(200).json({ message: "Membro removido com sucesso", data: team });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao remover membro", error });
    }
  }

  // Altera o Consultor Responsável (Manager)
  async changeTeamManager(req: Request, res: Response) {
    try {
      const { teamId, newManagerId } = req.body;

      const team = await SaleTeam.findByIdAndUpdate(
        teamId,
        { manager: newManagerId },
        { new: true }
      );

      if (!team) return res.status(404).json({ message: "Equipe não encontrada" });

      return res.status(200).json({ message: "Gerente da equipe alterado com sucesso", data: team });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao alterar gerente", error });
    }
  }
}

export default new TeamController()