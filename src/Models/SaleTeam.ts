import mongoose, { Schema } from "mongoose";


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


const SaleTeamSchema = new Schema<SaleTeamType>({

    name: { type: String, required: true },
    description: { type: String, required: true },
    manager: { type: String, required: true, ref: 'User' },
    members: { type: Array<String>, required: true, default: [], ref: 'User' },
    isActive: { type: Boolean, required: true },

}, {
    timestamps: true
})



export default mongoose.model<SaleTeamType>("SaleTeam", SaleTeamSchema)