export function validateEmpresa(value: number): true {
    if (value === null || value === undefined) {
        throw new Error("empresa field is required");
    }

    if (!Number.isInteger(value) || value <= 0) {
        throw new Error("empresa must be a positive integer");
    }

    return true;
}