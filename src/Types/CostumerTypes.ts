export type PersonType = "PF" | "PJ";

export type AddressType = {
  street: string;
  number: number;
  district: string;
  city: string;
  country: string;
  state: string;
  zip_code: string;
};

export interface CustomerType {
  // _id?: string;
  code_person: number;
  full_name: string;
  birth_date: Date | null;
  status: number;
  email: string;
  type_person: PersonType;
  cpf_person?: string;
  cnpj_person?: string;
  address_person: AddressType;
  enterprise: string[] | null;
  trade_name?: string;
  password: string;
  phone_numbers: string[] | null;
}
