import { CustomerAddress } from "Services/Uau/Customer/uau.customer.dto";
import { AddressType } from "Types/CustomerTypes";

// src/Utils/dateParser.ts
const mountCustomerAdress = (value: CustomerAddress): any => {

  if (!value) throw new Error('Valor da chave não enviado')


  const address_person: AddressType = {
    street: value.Endereco_pend || "",
    city: value.Cidade_pend || "",
    country: "Brasil",
    district: value.Bairro_pend || "",
    number: Number(value.NumLogr_pend) || 0,
    state: value.UF_pend || "",
    zip_code: value.CEP_pend || ""
  };


  return address_person

};

export default mountCustomerAdress
