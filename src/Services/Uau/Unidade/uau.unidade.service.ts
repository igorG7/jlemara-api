import Console from "../../../Lib/Console";
import uau from "../../../Lib/Uau";
import { ResponseFindAllUnidades } from "./uau.unidade.types";

export default class UauUnidadeService {

  private api = uau;


  async findAllUnidades() {
    try {

      // EMPRESA 1 | É A EMPRESA QUE DETEM DAS UNIDADES NO ERP
      // EMPRESA 2 | É UMA EMPRESA ANTIGA, QUE FAZIA PARTE DO GRUPO J.LEMARA
      // NÃO EXISTE MAIS MAS, POSSUI INFORMAÇÕES CADASTRADAS

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
      console.log(error.response.data)
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
      console.log(error.response.data)
      throw new Error(message);
    }


  }



}



/*

async changeStatusUnidade(product: number, cod_peson: number, new_status: number, reasonForChange: string, categoriaStatusPersonalizacao: number) {

    Console({ type: "log", message: "Buscando unidades cadastradas " });

    try {
      const path = "/Espelho/AlterarStatusUnidade";
      const body = {
        codigoEmpresa: 1,
        codigoProduto: produto,
        numeroPersonalizacao: numPerson,
        novoStatusUnidade: novoStatus,
        motivoAlteracao: motivoAlteracao,
        categoriaStatusPersonalizacao: categoriaStatusPersonalizacao
      }

      const response = await this.uauapi.post(path, body)
      const result = response.status === 200

      console.log("UNIDADES ENCONTRADAS", result);
      return result
    } catch (error: any) {
      console.log("NÃO FOI POSSIVEL BUSCAR UNIDADES");
      console.log("UAU error body:", error?.response?.data);
      throw error;
    }
  }


  */
