import parseBRDate from "../../../Utils/dateParser";
import RedisController from "../../../Controllers/redis.controller";
import uau from "../../../Lib/Uau";
import {
    RecordCustomerPayload,
    UpdateCustomerPayload,
    ResponseRecordCustomer,
    ResponseRecordPhone,
    RecordPhoneCustomerPayload,
    DeletePhonePayload,
    ResponsePhoneItem,
    ResponseFindCustomerByCode,
    ResponseFindCustomerByCPF,
    ResponseFindCustomersWithSale,
    CustomerData,
    CustomerWithSale,
    ResponseCustomerUnit,
    ResponseCustomerAddress,
    CustomerAddress,
} from "./erp.customer.types";
import {
    customerValidateCPF,
    customerValidateCodPes,
    customerValidateTypePerson,
} from "./erp.customer.validator";
import Console from "../../../Lib/Console";


/**
 * Header de tipos .NET exigido pela API UAU no JSON de telefones.
 * Sem esse header, a API rejeita o payload de telefones silenciosamente.
 */

const UAU_PHONE_LIST_HEADER = {
    ddd_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
    fone_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
    ram_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
    tipo_tel: "System.Byte, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
    TipoTel_tel: "System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
    ExisteTel_tel: "System.Boolean, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
    Principal_tel: "System.Byte, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089",
} as const;


// ─────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────

class ErpCustomerService {

    private redis = new RedisController()

    private api = uau

    // ── Lock helpers ─────────────────────────────

    private redisLock = async (key: string) => {
        const lockAcquired = await this.redis.setCustomerLock(key);
        if (!lockAcquired) {
            throw new Error(`Record with key ${key} is already being processed.`);
        }
    }

    private redisRemoveLock = async (key: string) => {
        await this.redis.removeCustomerLock(key)
    }

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
    // MÉTODOS PRIVADOS — montagem de payload UAU
    // ─────────────────────────────────────────────

    /**
     * Formata a lista de telefones no padrão exigido pela API UAU.
     * Inclui o header de tipos .NET + os telefones limpos.
     */
    private buildPhoneJson(phones: RecordPhoneCustomerPayload[]): string {
        const phoneList = phones.map(p => ({
            ddd_tel: p.ddd_tel.replace(/\D/g, ""),
            fone_tel: p.fone_tel.replace(/\D/g, ""),
            ram_tel: "",
            tipo_tel: 2, // 1 - comercial | 2 - celular | 3 - recado | 4 - fax | 5 - blip | 6 - telex | 7 - Outros | 8 - Fone fax
            TipoTel_tel: "",
            ExisteTel_tel: false,
            Principal_tel: p.Principal_tel ? 1 : 0,
        }));

        return JSON.stringify([{
            PesTel: [UAU_PHONE_LIST_HEADER, ...phoneList],
        }]);
    }

    /**
     * Monta o body padrão para Pessoas/GravarPessoa.
     * Tanto record (cod_pes = 0) quanto update (cod_pes > 0) usam o mesmo endpoint,
     * a diferença é o código da pessoa e o status.
     * status_pes: 1 - temporário | 2 - confirmado
     */
    private buildCustomerBody(params: {
        cod_pes: number;
        cpf: string;
        payload: RecordCustomerPayload | UpdateCustomerPayload;
        status_pes: number;
    }) {
        const { cod_pes, cpf, payload, status_pes } = params;

        const formattedDate = parseBRDate(String(payload?.birth_date || ""));
        const dspes_tel_json = this.buildPhoneJson(payload.dspes_tel_json);

        return {
            nao_validar_campos_obrigatorios: true,
            info_pes: {
                cod_pes,
                nome_pes: payload.full_name?.toUpperCase()!,
                tipo_pes: customerValidateTypePerson(payload.type_person),
                cpf_pes: cpf,
                dtcad_pes: new Date().toISOString(),
                dtnasc_pes: formattedDate,
                usrcad_pes: process.env.UAU_USER!,
                usralt_pes: process.env.UAU_USER!,
                status_pes,
                email_pes: payload.email?.toLowerCase() ?? "",
                dspes_tel_json,
                atinat_pes: 0,
                cadastradoprefeituragyn_pes: false,
                habilitadoriscosacado_pes: false,
                intext_pes: 0,
                // dataalt_pes é enviado apenas no update (cod_pes > 0)
                ...(cod_pes > 0 && { dataalt_pes: new Date().toISOString() }),
            },
        };
    }

    /**
     * Envia o payload para a API UAU e valida a resposta.
     * Centraliza o POST + checagem de `Sucesso` para evitar duplicação.
     */
    private async sendToUau(body: object, action: string, identifier: string | number): Promise<ResponseRecordCustomer> {
        const path = "Pessoas/GravarPessoa"
        const data = await this.api.post(path, body) as ResponseRecordCustomer;

        if (!data.Sucesso) {
            throw new Error(`Error ${action} customer ${identifier}: ${data.Mensagem}`);
        }

        Console({
            type: "log",
            message: `Customer ${data.CodigoPessoa} ${action} successfully`,
        });

        return data;
    }

    // ─────────────────────────────────────────────
    // MÉTODOS PÚBLICOS — Gravação
    // ─────────────────────────────────────────────

    /**
     * Cadastra uma nova pessoa no ERP UAU.
     * cod_pes = 0 indica para a API que é um novo registro.
     * status_pes = 1 → temporário
     */
    async recordCustomer(payload: RecordCustomerPayload): Promise<ResponseRecordCustomer | undefined> {

        const cpf = payload.cpf_person.replace(/\D/g, "")
        customerValidateCPF(cpf)
        await this.redisLock(cpf)

        try {
            const body = this.buildCustomerBody({
                cod_pes: 0,
                cpf,
                payload,
                status_pes: 1,
            });

            return await this.sendToUau(body, "registered", cpf);

        } catch (error) {
            this.catchError(error, "recordCustomer")
        } finally {
            await this.redisRemoveLock(cpf)
        }
    }

    /**
     * Atualiza uma pessoa existente no ERP UAU.
     * cod_pes > 0 indica para a API qual registro atualizar.
     * status_pes = 2 → confirmado
     */
    async updateCustomer(payload: UpdateCustomerPayload): Promise<ResponseRecordCustomer | undefined> {

        // Valida cod_pes antes de qualquer operação
        customerValidateCodPes(payload.cod_pes)

        const cpf = payload.cpf_person.replace(/\D/g, "")
        customerValidateCPF(cpf)

        // Lock por cod_pes — no update a entidade já existe e é identificada por código
        const lockKey = String(payload.cod_pes)
        await this.redisLock(lockKey)

        try {
            const body = this.buildCustomerBody({
                cod_pes: payload.cod_pes,
                cpf,
                payload,
                status_pes: 2,
            });

            return await this.sendToUau(body, "updated", payload.cod_pes);

        } catch (error) {
            this.catchError(error, "updateCustomer")
        } finally {
            await this.redisRemoveLock(lockKey)
        }
    }

    // ─────────────────────────────────────────────
    // MÉTODOS PÚBLICOS — Telefones
    // ─────────────────────────────────────────────

    /**
     * Adiciona ou atualiza telefones de uma pessoa no ERP UAU.
     */
    async recordPhoneCustomer(cod_pes: number, phones: RecordPhoneCustomerPayload[]): Promise<ResponseRecordPhone | undefined> {

        customerValidateCodPes(cod_pes)

        const lockKey = String(cod_pes)
        await this.redisLock(lockKey)

        try {
            const formattedPhones = phones.map(phone => ({
                telefone: phone.fone_tel.replace(/\D/g, ""),
                DDD: phone.ddd_tel.replace(/\D/g, ""),
                Complemento: phone.Complemento ?? null,
                Tipo: phone.tipo_tel,
                Principal: phone.Principal_tel,
            }));

            const path = "Pessoas/ManterTelefone"

            const body = {
                Numero: cod_pes,
                Telefones: formattedPhones,
            }

            const data = await this.api.post(path, body) as ResponseRecordPhone;

            Console({ type: "success", message: `Customer ${cod_pes} phones recorded successfully` });

            return data;

        } catch (error) {
            this.catchError(error, "recordPhoneCustomer")
        } finally {
            await this.redisRemoveLock(lockKey)
        }
    }

    /**
     * Consulta os telefones de uma pessoa no ERP UAU.
     */
    async findPhonesCustomer(cod_pes: number): Promise<ResponsePhoneItem[] | undefined> {

        customerValidateCodPes(cod_pes)

        const lockKey = String(cod_pes)
        await this.redisLock(lockKey)

        try {
            const path = "Pessoas/ConsultarTelefones"

            const body = {
                Numero: cod_pes,
            }

            const data = await this.api.post(path, body) as ResponsePhoneItem[];

            Console({ type: "success", message: `Customer ${cod_pes} phones retrieved successfully` });

            return data;

        } catch (error) {
            this.catchError(error, "findPhonesCustomer")
        } finally {
            await this.redisRemoveLock(lockKey)
        }
    }

    /**
     * Remove telefones de uma pessoa no ERP UAU.
     */
    async deletePhoneCustomer(cod_pes: number, phones: DeletePhonePayload[]): Promise<boolean | undefined> {

        customerValidateCodPes(cod_pes)

        const lockKey = String(cod_pes)
        await this.redisLock(lockKey)

        try {
            const path = "Pessoas/ExcluirTelefone"

            const body = {
                Numero: cod_pes,
                Telefones: phones,
            }

            await this.api.post(path, body);

            Console({ type: "success", message: `Customer ${cod_pes} phones deleted successfully` });
            return true;

        } catch (error) {
            this.catchError(error, "deletePhoneCustomer")
        } finally {
            await this.redisRemoveLock(lockKey)
        }
    }

    // ─────────────────────────────────────────────
    // MÉTODOS PÚBLICOS — Consultas
    // ─────────────────────────────────────────────

    /**
     * Consulta uma pessoa pelo código (cod_pes) no ERP UAU.
     * O retorno da API UAU vem como array com header na posição [0],
     * por isso fazemos slice(1) para pegar apenas os dados.
     */
    async findCustomerByCode(cod_pes: number): Promise<CustomerData | undefined> {

        customerValidateCodPes(cod_pes)

        const lockKey = String(cod_pes)
        await this.redisLock(lockKey)

        try {
            const path = "Pessoas/ConsultarPessoaPorChave"

            const body = {
                codigo_pessoa: cod_pes,
            }

            const data = await this.api.post(path, body) as ResponseFindCustomerByCode;

            // Posição [0] é o header de tipos, dados reais começam em [1]
            const customers = data[0].MyTable.slice(1);

            Console({ type: "success", message: `Customer ${cod_pes} retrieved successfully` });

            return customers[0] as CustomerData;

        } catch (error) {
            this.catchError(error, "findCustomerByCode")
        } finally {
            await this.redisRemoveLock(lockKey)
        }
    }

    /**
     * Consulta uma pessoa pelo CPF/CNPJ no ERP UAU.
     * @param status 0 = todos, 1 = ativo, 2 = inativo (padrão: 0)
     */
    async findCustomerByCPF(cpf_cnpj: string, status: number = 0): Promise<CustomerData | undefined> {

        customerValidateCPF(cpf_cnpj)

        const lockKey = cpf_cnpj.replace(/\D/g, "")
        await this.redisLock(lockKey)

        try {
            const path = "Pessoas/ConsultarPessoasPorCPFCNPJ"

            const body = {
                cpf_cnpj: lockKey,
                status,
            }

            const data = await this.api.post(path, body) as ResponseFindCustomerByCPF;

            // Posição [0] é o header de tipos, dados reais em [1]
            const customer = data[0].Pessoas[1] as CustomerData;

            Console({ type: "success", message: `Customer ${lockKey} retrieved by CPF successfully` });

            return customer;

        } catch (error) {
            this.catchError(error, "findCustomerByCPF")
        } finally {
            await this.redisRemoveLock(lockKey)
        }
    }

    /**
     * Consulta todas as pessoas com venda no ERP UAU.
     * Não requer lock — operação somente leitura sem identificador único.
     */
    async findCustomersWithSale(): Promise<CustomerWithSale[] | undefined> {

        try {
            const path = "Pessoas/ConsultarPessoasComVenda"

            const data = await this.api.post(path, {}) as ResponseFindCustomersWithSale;

            // Posição [0] é o header, dados reais começam em [1]
            const customers = data[0].Pessoas.slice(1) as CustomerWithSale[];

            Console({ type: "success", message: `Customers with sale retrieved successfully (${customers.length} found)` });

            return customers;

        } catch (error) {
            this.catchError(error, "findCustomersWithSale")
        }
    }

    /**
     * Consulta as unidades vinculadas a uma pessoa no ERP UAU.
     */
    async findUnitsCustomer(cod_pes: number): Promise<ResponseCustomerUnit[] | undefined> {

        customerValidateCodPes(cod_pes)

        const lockKey = String(cod_pes)
        await this.redisLock(lockKey)

        try {
            const path = "Pessoas/ConsultarUnidades"

            const body = {
                CodigoPessoa: cod_pes,
                CpfCnpj: "",
            }

            const data = await this.api.post(path, body) as ResponseCustomerUnit[];

            Console({ type: "success", message: `Customer ${cod_pes} units retrieved successfully` });

            return data;

        } catch (error) {
            this.catchError(error, "findUnitsCustomer")
        } finally {
            await this.redisRemoveLock(lockKey)
        }
    }

    /**
     * Consulta os endereços de uma pessoa no ERP UAU.
     * @param addressType Tipo do endereço (0 = todos, padrão: 0)
     */
    async findAddressCustomer(cod_pes: number, addressType: number = 0): Promise<CustomerAddress[] | undefined> {

        customerValidateCodPes(cod_pes)

        const lockKey = String(cod_pes)
        await this.redisLock(lockKey)

        try {
            const path = "Pessoas/ConsultarEnderecoPessoasPorChave"

            const body = {
                codigoPessoa: cod_pes,
                tipoEndereco: addressType,
            }

            const data = await this.api.post(path, body) as ResponseCustomerAddress[];

            // Posição [0] é o header, dados reais começam em [1]
            const addresses = data[0].MyTable.slice(1) as CustomerAddress[];

            Console({ type: "success", message: `Customer ${cod_pes} addresses retrieved successfully` });

            return addresses;

        } catch (error) {
            this.catchError(error, "findAddressCustomer")
        } finally {
            await this.redisRemoveLock(lockKey)
        }
    }
}

export default new ErpCustomerService()