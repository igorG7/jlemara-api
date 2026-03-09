export interface SaleTeamType {
    _id?: string;

    name?: string; // FOXTROT
    description?: string; // FRASE DE EFEITO
    manager?: string; // ID DO CORRETOR INTERNO
    members?: string[]; // ARRAY DE ID CORRETORES EXTERNOS
    isActive?: Boolean; // SE A EQUIPE ESTA ATIVA

    createdAt?: Date;
    updatedAt?: Date;

}