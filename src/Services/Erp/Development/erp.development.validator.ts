// ─────────────────────────────────────────────────
// Validações — Development (Obra)
// ─────────────────────────────────────────────────

/**
 * Valida se o código da empresa é um inteiro positivo.
 * @throws Error se for inválido
 */


/**
 * Valida se o código da obra é uma string não-vazia.
 * @throws Error se for inválido
 */
export function validateObraCode(value: string): true {
    if (!value || value.trim() === "") {
        throw new Error("obra code is required");
    }

    return true;
}
