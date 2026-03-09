import { AddressType, CustomerType } from "../domain/customer.interface";
import parseBRDate from "../../utils/dateParser";
import mountCustomerAdress from "../../../Workers/Uau/utils/mountCustomerAdress";

class CustomerDTO {

  format(customer: any): CustomerType {
    const addressRaw = customer.address?.[0] || {};

    const phonesRaw = (customer.phones || []) as Array<{
      Telefone: string;
      DDD: string;
    }>;

    const phone_numbers = phonesRaw.map(
      (p) => `${p.DDD}${String(p.Telefone).replace(/[-\s]/g, "")}`,
    );

    const address_person: AddressType = mountCustomerAdress(addressRaw);

    const type_person = Number(customer.tipo_pes) === 0 ? "PF" : "PJ";

    return {
      code_person: customer.cod_pes,
      full_name: customer.nome_pes,
      birth_date: parseBRDate(customer.dtnasc_pes ?? null),
      email: customer.Email_pes || "",
      type_person,
      cpf_person: type_person === "PF" ? customer.cpf_pes : "",
      cnpj_person: type_person === "PJ" ? customer.cpf_pes : "",
      address_person,
      enterprise: [""],
      trade_name: customer.NomeFant_Pes || "",
      password: customer.Senha_pes || "",
      phone_numbers,
      status: customer.Status_pes,
    };
  }
}


export default new CustomerDTO()