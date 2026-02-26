// ─────────────────────────────────────────────────
// ROTAS DE TESTE — ErpCustomerService
// Usar via Postman para validar cada método.
// Remover ou desabilitar antes de ir para produção.
// ─────────────────────────────────────────────────

import { Router } from "express";
import ErpCustomerService from "../Services/Erp/Customer/erp.customer.service";

const testRoutes = Router();

// ── Gravação ─────────────────────────────────────

/** POST /test/erp/record-customer */
testRoutes.post("/erp/record-customer", async (req, res) => {
    try {
        const data = await ErpCustomerService.recordCustomer({
            cpf_person: "19301358077",
            birth_date: "1990-01-01",
            full_name: "Test Record Customer",
            type_person: "PF",
            email: "test@record.com",
            dspes_tel_json: [
                {
                    ddd_tel: "62",
                    fone_tel: "999999999",
                    ram_tel: "",
                    tipo_tel: 4,
                    ExisteTel_tel: false,
                    Principal_tel: 1,
                },
            ],
        });
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/** PUT /test/erp/update-customer */
testRoutes.put("/erp/update-customer", async (req, res) => {
    try {
        const data = await ErpCustomerService.updateCustomer({
            cod_pes: 28041,
            cpf_person: "19301358077",
            birth_date: "2000-01-01",
            full_name: "Test Update Customer",
            type_person: "PF",
            email: "test@update.com",
            dspes_tel_json: [
                {
                    ddd_tel: "62",
                    fone_tel: "999999999",
                    ram_tel: "",
                    tipo_tel: 4,
                    ExisteTel_tel: false,
                    Principal_tel: 1,
                },
            ],
        });
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── Telefones ────────────────────────────────────

/** POST /test/erp/record-phone */
testRoutes.post("/erp/record-phone", async (req, res) => {
    try {
        const data = await ErpCustomerService.recordPhoneCustomer(28041, [
            {
                ddd_tel: "31",
                fone_tel: "999990001",
                ram_tel: "",
                tipo_tel: 1,
                ExisteTel_tel: false,
                Principal_tel: 1,
            },
            {
                ddd_tel: "31",
                fone_tel: "999990002",
                ram_tel: "",
                tipo_tel: 2,
                ExisteTel_tel: false,
                Principal_tel: 0,
            },
        ]);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/** GET /test/erp/find-phones/:cod_pes */
testRoutes.get("/erp/find-phones/:cod_pes", async (req, res) => {
    try {
        const cod_pes = Number(req.params.cod_pes);
        const data = await ErpCustomerService.findPhonesCustomer(cod_pes);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/** DELETE /test/erp/delete-phone */
testRoutes.delete("/erp/delete-phone", async (req, res) => {
    try {
        const data = await ErpCustomerService.deletePhoneCustomer(28041, [
            {
                telefone: "44444447",
                DDD: "31",
                Tipo: 4,
            },
        ]);

        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── Consultas ────────────────────────────────────

/** GET /test/erp/find-by-code/:cod_pes */
testRoutes.get("/erp/find-by-code/:cod_pes", async (req, res) => {
    try {
        const cod_pes = Number(req.params.cod_pes);
        const data = await ErpCustomerService.findCustomerByCode(cod_pes);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/** GET /test/erp/find-by-cpf/:cpf */
testRoutes.get("/erp/find-by-cpf/:cpf", async (req, res) => {
    try {
        const data = await ErpCustomerService.findCustomerByCPF(req.params.cpf);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/** GET /test/erp/customers-with-sale */
testRoutes.get("/erp/customers-with-sale", async (req, res) => {
    try {
        const data = await ErpCustomerService.findCustomersWithSale();
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/** GET /test/erp/find-units/:cod_pes */
testRoutes.get("/erp/find-units/:cod_pes", async (req, res) => {
    try {
        const cod_pes = Number(req.params.cod_pes);
        const data = await ErpCustomerService.findUnitsCustomer(cod_pes);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/** GET /test/erp/find-address/:cod_pes */
testRoutes.get("/erp/find-address/:cod_pes", async (req, res) => {
    try {
        const cod_pes = Number(req.params.cod_pes);
        const data = await ErpCustomerService.findAddressCustomer(cod_pes);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default testRoutes;
