import Console from "../../utils/Console";
import uau from "../../utils/Uau";
import { ResponseFindAllObras, ResponseFindObraWithCode } from "./development.interface.integration";
import { isObraDeReceita } from "./development.validation";

export default class UauObraService {

  private api = uau;


  async findAllObras() {
    try {

      const path = "Obras/ObterObrasAtivas"

      const body = {}

      const data = await this.api.post(path, body) as ResponseFindAllObras[]

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

      const path = "Obras/ConsultarObraPorChave"

      const body = {
        empresa: 1,
        obra: String(cod_obra)
      }

      const data = await this.api.post(path, body) as ResponseFindObraWithCode[]

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

