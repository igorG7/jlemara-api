

/* export async function costumerValidateCPF(value: string) {

  if (!value) throw new Error("O campo CPF é obrigatorio")
  if (!cpf) throw new Error("CPF é obrigatório para o cadastro.");

  return
}
 */

export function isValidCPF(cpf: string): boolean {
  // 1. Limpa o CPF e verifica se tem 11 dígitos
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return false;

  // 2. Elimina CPFs conhecidos com todos os números iguais (ex: 111.111.111-11)
  // O algoritmo passaria neles, mas são CPFs inválidos
  if (/^(\n)\1{10}$/.test(cleanCPF)) return false;

  const digits = cleanCPF.split("").map(Number);

  // 3. Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let firstChecker = (sum * 10) % 11;
  if (firstChecker === 10 || firstChecker === 11) firstChecker = 0;
  if (firstChecker !== digits[9]) return false;

  // 4. Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  let secondChecker = (sum * 10) % 11;
  if (secondChecker === 10 || secondChecker === 11) secondChecker = 0;
  if (secondChecker !== digits[10]) return false;

  return true;
}


export async function costumerValidateCPF(value: String): Promise<Boolean> {

  if (!value || value.trim() === "") {
    throw new Error("O campo CPF é obrigatorio")
  }
  const cleanCpf = value.replace(/\D/g, "")
  if (cleanCpf.length !== 11) {
    throw new Error("O CPF deve conter exatamente 11 digitos")
  }
  const isValid = isValidCPF(cleanCpf)
  return isValid;

}
export async function costumerValidateCodPes(value: Number): Promise<Boolean> {

  if (!value) {
    throw new Error("O campo cod_pes é obrigatorio")
  }

  return true

}
