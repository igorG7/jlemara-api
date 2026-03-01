import Console from "../../../Lib/Console";
import uau from "../../../Lib/Uau";
import { validateEmpresa } from "../erp.validators";
import { ChangeUnitStatusPayload, ResponseFindAllUnits } from "./erp.unit.types";


class ErpUnitService {

    private api = uau

    // ── Error handler ────────────────────────────

    private catchError = (error: any, func: string) => {
        const message = error instanceof Error ? error.message : "Unknown error";
        Console({
            type: "error",
            message: `Error ${func}: ${message}`,
        })
        throw error
    }

    // ─────────────────────────────────────────────
    // MÉTODOS PÚBLICOS — Consultas
    // ─────────────────────────────────────────────

    /**
     * Consulta todas as unidades no ERP UAU, filtrando por empresa e códigos de obra.
     * O retorno da API vem com header na posição [0] do MyTable; dados reais começam em [1].
     * @param empresa Código da empresa (padrão: 1)
     * @param obraCodes Códigos de obra para filtrar as unidades retornadas
     */
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

    /**
     * Consulta todas as unidades de uma obra específica no ERP UAU.
     * O retorno da API vem com header na posição [0] do MyTable; dados reais começam em [1].
     * Aplica filtro duplo (Empresa_unid + Obra_unid) para garantir consistência do resultado.
     * @param empresa Código da empresa
     * @param code Código da obra (Cod_obr)
     */
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

    // ─────────────────────────────────────────────
    // MÉTODOS PÚBLICOS — Ações
    // ─────────────────────────────────────────────

    /**
     * Altera o status de uma unidade no ERP UAU.
     * A chave de identificação da unidade é o par (produto + personalizacao).
     * @param empresa Código da empresa
     * @param produto Código do produto (Prod_unid)
     * @param personalizacao Número da personalização (NumPer_unid)
     * @param newStatus Novo status da unidade — Vendido_unid (ex: 1=Disponível, 2=Reservado, 3=Vendido)
     * @param newSubStatus Categoria do status — NumCategStatus_unid (ex: 8=Fora de venda, 999=Invadido)
     * @param motivo Descrição do motivo da alteração
     */
    async changeUnitStatus({ empresa, produto, personalizacao, newStatus, newSubStatus, motivo }: ChangeUnitStatusPayload): Promise<any> {

        validateEmpresa(empresa)

        try {
            const path = "Espelho/AlterarStatusUnidade"

            const body = {
                codigoEmpresa: empresa,
                codigoProduto: produto,
                numeroPersonalizacao: personalizacao,
                novoStatusUnidade: newStatus,
                motivoAlteracao: motivo,
                categoriaStatusPersonalizacao: newSubStatus,
            }

            const data = await this.api.post(path, body)

            Console({ type: "success", message: `Unit ${produto}/${personalizacao} status updated successfully` });

            return data

        } catch (error) {
            this.catchError(error, "changeUnitStatus")
        }
    }

}

export default new ErpUnitService();