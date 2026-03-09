// src/models/Usuario.ts
import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../domain/user.interface";


const UserSchema = new Schema<UserType>(
  {
    uau_id: { type: String, trim: true, unique: true },
    name: { type: String, trim: true, required: true },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      required: true,
    },

    password: { type: String, required: true },
    phone: { type: String, trim: true, required: true },

    role: {
      enum: [
        "ASSISTANT",
        "CONSULTANT",
        "BROKER",
        "SUPERVISOR",
        "COORDINATOR",
        "MANAGER",
        "DIRECTOR",
      ],
      default: "ASSISTANT",
      type: String,
      index: true,
    },

    department: {
      type: String,
      enum: ["CRC", "LEGAL", "INVENTORY", "SALES", "OPERATIONS"],
      index: true,
    },

    company: { type: String, trim: true, index: true, required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", index: true },
    isActive: { type: Boolean, default: true, required: true },
    isExternal: { type: Boolean, default: true, required: true },
    lastAccessAt: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model<UserType>("User", UserSchema);
