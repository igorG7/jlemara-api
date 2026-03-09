
export async function validateCustomerCode(value: number): Promise<Boolean> {
    if (!value) {
        return false
    } else {
        return true
    }
}