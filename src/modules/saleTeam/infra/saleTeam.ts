import mongoose, { Schema } from "mongoose";
import { SaleTeamType } from "../domain/saleTeam.interface";





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