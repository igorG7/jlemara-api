

export async function codPes(value: Number): Promise<Boolean> {

  if (!value) {
    throw new Error("O campo cod_pes é obrigatorio")
  }

  return true

}
