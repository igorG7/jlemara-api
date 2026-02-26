import { IPhoto } from "../Photo/Photo";

export interface IUnit {
  company: number; // Empresa responsável
  product_unit: number; // Produto que comporta as unidades
  unit_code: number; // Código de identificação da unidade
  development_code: string; // Código de identificação da obra
  quantity_available: number; // Quantidade disponível para venda
  unit_status: number; // seu status interno (ex: 0 disponível)
  category_status: number; // Um sub-status que descreve melhor a situação atual da unidade
  registration_date: Date; // Data de cadastro da unidade no UAU
  product_type_code: string; // Identifica o tipo do produto (casa, apartamento, lote, etc)
  attachment_count: number; // Contagem de anexos e informações viculadas a unidade
  price: number; // Quadra da unidade
  block: string; // Quadra da unidade
  lot: string; // Lote (terreno)
  unit_identifier: string; // Cógido de identificação composto por: número do lote, abreviação do nome do bairro e quadra
  photos: IPhoto[]; // Fotos
  district: string; // Bairro
  city: string; // Cidade
  latitude: string; // Valor latitude
  longitude: string; // Valor longitude
  sale_number: string; // Identifica se possui venda atrelado. 0 é o padrão e não corresponde a nenhuma venda, se diferente possui venda
  uau_ref: string; // Concatenação da empresa - obra - unidade
}
