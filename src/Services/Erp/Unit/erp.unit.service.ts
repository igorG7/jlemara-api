import Console from "../../../Lib/Console";
import uau from "../../../Lib/Uau";
import { validateEmpresa } from "../erp.validators";
import { ResponseFindAllUnits } from "./erp.unit.types";


class ErpUnitService {

    private api = uau

    private catchError = (error: any, func: string) => {
        const message = error instanceof Error ? error.message : "Unknown error";
        Console({
            type: "error",
            message: `Error ${func}: ${message}`,
        })
        throw error
    }

    async findAllUnits(empresa: number, obraCodes: string[]): Promise<ResponseFindAllUnits[] | undefined> {

        try {
            const path = "Espelho/BuscaUnidadesDeAcordoComWhere"

            const body = {
                where: `WHERE NumPer_unid LIKE '%%' AND Empresa_unid = '${empresa}'`,
                retorna_venda: true
            }

            const data = await this.api.post(path, body) as [{ MyTable: ResponseFindAllUnits[] }]

            const units = data[0].MyTable.slice(1, data[0].MyTable.length)

            const filteredUnits = units.filter(item =>
                item.Empresa_unid === empresa && obraCodes.includes(item.Obra_unid)
            );

            Console({ type: "success", message: `Units retrieved successfully (${filteredUnits.length} found)` });

            return filteredUnits;

        } catch (error) {
            this.catchError(error, "findAllUnits")
        }
    }

    async findUnitsByCode(empresa: number, code: string): Promise<ResponseFindAllUnits[] | undefined> {

        try {
            const path = "Espelho/BuscaUnidadesDeAcordoComWhere"

            const body = {
                where: `WHERE Obra_unid = '${String(code)}' AND Empresa_unid = '${empresa}'`,
                retorna_venda: true
            }

            const data = await this.api.post(path, body) as [{ MyTable: ResponseFindAllUnits[] }]

            const units = data[0].MyTable.slice(1, data[0].MyTable.length)

            const filteredUnits = units.filter(item =>
                item.Empresa_unid === empresa && item.Obra_unid === code
            );

            Console({ type: "success", message: `Units ${code} retrieved successfully` });

            return filteredUnits

        } catch (error) {
            this.catchError(error, "findUnitByCode")
        }
    }

}

export default new ErpUnitService();