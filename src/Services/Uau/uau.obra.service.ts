import Console from "../../Lib/Console";
import uau from "../../Lib/Uau";
import { ResponseFindAllObras, ResponseFindObraWithCode } from "./uau.obra.types";

export default class UauObraService {

  private api = uau;


  async findAllObras() {
    try {
      const body = {}
      const data = await this.api.post("Obras/ObterObrasAtivas", body) as ResponseFindAllObras[]

      const isObraDeReceita = (obra: ResponseFindAllObras): boolean => {
        const pertenceEmpresaAlvo = obra.Empresa_obr === 1;
        const temPrefixoValido = ['R', 'J'].includes(obra.Cod_obr?.[0]);
        return pertenceEmpresaAlvo && temPrefixoValido;
      };

      const result = data.filter(isObraDeReceita);
      Console({ type: "success", message: `UAU: Obras encontradas com sucesso!` });
      return result;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `findAllObras: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }


  }

  async findObraWithCode(cod_obra: string) {

    if (!cod_obra) throw new Error("O codigo da obra é obrigatorio!")

    try {

      const body = {
        empresa: 1,
        obra: String(cod_obra)
      }

      const data = await this.api.post("Obras/ConsultarObraPorChave", body) as ResponseFindObraWithCode[]

      const result = data[1] as ResponseFindObraWithCode

      Console({ type: "success", message: `UAU: Obra encontrada com sucesso!` });
      return result;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      Console({ type: "error", message: `findObraWithCode: ${message}` });
      console.log(error.response.data)
      throw new Error(message);
    }
  }


}

