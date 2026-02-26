import Console from "../../../Lib/Console";
import uau from "../../../Lib/Uau";
import { validateEmpresa } from "../erp.validators";
import { ResponseFindAllDevelopments, ResponseFindDevelopmentByCode } from "./erp.development.types";
import { validateObraCode } from "./erp.development.validator";


class ErpDevelopmentService {

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
     * Consulta todas as obras ativas no ERP UAU e filtra por empresa e códigos de obra.
     * @param empresa Código da empresa (padrão: 1 — lotes)
     * @param obraCodes Códigos de obra do tipo receita (padrão: ['R', 'J'])
     */
    async findAllDevelopments(empresa: number = 1, obraCodes: string[] = ["R", "J"]): Promise<ResponseFindAllDevelopments[] | undefined> {

        validateEmpresa(empresa)

        try {
            const data = await this.api.post("Obras/ObterObrasAtivas", {}) as ResponseFindAllDevelopments[];

            // Filtra por empresa e códigos de obra relevantes
            const filtered = data.filter(item =>
                item.Empresa_obr === empresa && obraCodes.some(code => item.Cod_obr.startsWith(code))
            );

            Console({ type: "success", message: `Developments retrieved successfully (${filtered.length} found)` });

            return filtered;

        } catch (error) {
            this.catchError(error, "findAllDevelopments")
        }
    }

    /**
     * Consulta o detalhe de uma obra específica pelo código no ERP UAU.
     * O retorno da API vem como array com header na posição [0],
     * dados reais em [1].
     */
    async findDevelopmentByCode(empresa: number, code: string): Promise<ResponseFindDevelopmentByCode | undefined> {

        validateEmpresa(empresa)
        validateObraCode(code)

        try {
            const body = {
                empresa,
                obra: code,
            }

            const data = await this.api.post("Obras/ObterObrasAtivas", body) as ResponseFindDevelopmentByCode[];

            // Posição [0] é o header de tipos, dados reais em [1]
            if (!data[1]) {
                throw new Error(`Development ${code} not found for empresa ${empresa}`);
            }

            Console({ type: "success", message: `Development ${code} retrieved successfully` });

            return data[1];

        } catch (error) {
            this.catchError(error, "findDevelopmentByCode")
        }
    }
}

export default new ErpDevelopmentService();