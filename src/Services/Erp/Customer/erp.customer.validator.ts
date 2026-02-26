// ─────────────────────────────────────────────────
// CPF / cod_pes 
// ─────────────────────────────────────────────────

const CPF_LENGTH = 11;

/**
 * Valida a estrutura matemática de um CPF (dígitos verificadores).
 * Recebe o CPF **já limpo** (somente dígitos).
 * @throws Error se o CPF for inválido  
 */
export function isValidCPF(cpf: string): true {

    if (!/^\d+$/.test(cpf)) {
        throw new Error("CPF must contain only numeric digits");
    }

    if (cpf.length !== CPF_LENGTH) {
        throw new Error("CPF must contain exactly 11 digits");
    }

    // CPFs com todos os dígitos iguais (ex: 111.111.111-11)
    // passam no algoritmo, mas são considerados inválidos pela Receita
    if (/^(\d)\1{10}$/.test(cpf)) {
        throw new Error("Invalid CPF — all digits are the same");
    }

    const digits = cpf.split("").map(Number);

    // Primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += digits[i] * (10 - i);
    }
    let firstChecker = (sum * 10) % 11;
    if (firstChecker >= 10) firstChecker = 0;
    if (firstChecker !== digits[9]) {
        throw new Error("Invalid CPF — incorrect check digit");
    }

    // Segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += digits[i] * (11 - i);
    }
    let secondChecker = (sum * 10) % 11;
    if (secondChecker >= 10) secondChecker = 0;
    if (secondChecker !== digits[10]) {
        throw new Error("Invalid CPF — incorrect check digit");
    }

    return true;
}

/**
 * Validação completa de CPF para uso nos services.
 * Aceita CPF com ou sem máscara — limpa antes de validar.
 * @throws Error com mensagem descritiva  
 */
export function customerValidateCPF(value: string): true {

    if (!value || value.trim() === "") {
        throw new Error("CPF field is required");
    }

    const cleanCpf = value.replace(/\D/g, "");

    // isValidCPF já valida comprimento, dígitos iguais e verificadores
    return isValidCPF(cleanCpf);
}

/**
 * Valida se o código de pessoa (cod_pes) é um inteiro positivo válido.
 * @throws Error se for inválido  
 */
export function customerValidateCodPes(value: number): true {

    if (value === null || value === undefined) {
        throw new Error("cod_pes field is required");
    }

    if (!Number.isInteger(value) || value <= 0) {
        throw new Error("cod_pes must be a positive integer");
    }

    return true;
}

export function customerValidateTypePerson(value: string): number {
    if (!value || value.trim() === "") {
        throw new Error("type_person field is required");
    }
    if (value !== "PF" && value !== "PJ") {
        throw new Error("type_person must be PF or PJ");
    }

    if (value === "PF") {
        return 0
    }
    return 1;
}   