import Console from "../../../Lib/Console";
import uau from "../../../Lib/Uau";
import { ResponseFindAllUnidades } from "./uau.unidade.types";

export default class UauUnidadeService {

  private api = uau;


  async findAllUnidades() {
    try {

      const body = {
        where: "WHERE NumPer_unid LIKE '%%' AND Empresa_unid = '1' ",
        retorna_venda: true
      }
      const data = await this.api.post("Espelho/BuscaUnidadesDeAcordoComWhere", body) as any

      const result = data[0].MyTable.slice(1, data[0].MyTable.length) as ResponseFindAllUnidades[]

      Console({ type: "success", message: `UAU: Unidades encontradas com sucesso!` });
      return result
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `findAllUnidades: ${message}` });
      console.log(error.response?.data)
      throw new Error(message);
    }


  }

  async findUnidadesWithObraCode(cod_obra: string) {
    try {

      if (!cod_obra) throw new Error("O codigo da obra é obrigatorio")

      const body = {
        where: `WHERE Obra_unid = '${String(cod_obra)}'`,
        retorna_venda: true
      }
      const data = await this.api.post("Espelho/BuscaUnidadesDeAcordoComWhere", body) as any

      const result = data[0].MyTable.slice(1, data[0].MyTable.length) as ResponseFindAllUnidades[]

      Console({ type: "success", message: `UAU: Unidades da obra ${cod_obra} encontradas com sucesso!` });
      return result
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `findAllUnidades: ${message}` });
      console.log(error.response?.data)
      throw new Error(message);
    }


  }

  async changeStatusUnidade({ produto, personalizacao, newStatus, newSubStatus, motivo }: { produto: number, personalizacao: number, newStatus: number, newSubStatus: number, motivo: string }) {
    try {

      const path = "Espelho/AlterarStatusUnidade"

      const body = {
        codigoEmpresa: 1,
        codigoProduto: produto,
        numeroPersonalizacao: personalizacao,
        novoStatusUnidade: newStatus,
        motivoAlteracao: motivo,
        categoriaStatusPersonalizacao: newSubStatus
      }

      const data = await this.api.post(path, body) as any

      const result = data

      Console({ type: "success", message: `UAU: Unidade alterada com sucesso!` });
      return result
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `changeStatusUnidade: ${message}` });
      console.log(error.response?.data)
      throw new Error(message);
    }


  }



}