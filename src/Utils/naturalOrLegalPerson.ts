// src/Utils/dateParser.ts
const naturalOrLegalPerson = (value: number): "PF" | "PJ" => {

  if (!value) throw new Error('Valor da chave não enviado')

  return value === 0 ? 'PF' : "PJ"

};

export default naturalOrLegalPerson
