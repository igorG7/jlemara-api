// src/models/Usuario.ts
import mongoose, { Schema, Document } from "mongoose";

export type UserRole =
  | "ASSISTANT"     // Assistente | 0
  | "CONSULTANT"    // Consultor  | 1
  | "BROKER"        // Corretor   | 2
  | "SUPERVISOR"    // Supervisor | 2
  | "COORDINATOR"   // Coordenador| 4
  | "MANAGER"       // Gerente    | 5
  | "DIRECTOR";     // Diretor    | 6

export type UserDepartment =
  | "CRC"           // Customer Relationship Center
  | "LEGAL"         // Jurídico
  | "INVENTORY"     // Estoque
  | "SALES"         // Vendas
  | "OPERATIONS";    // Operações



export interface UserType {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: UserRole;
  department?: UserDepartment;
  company?: string;
  teamId?: string;
  isActive?: boolean;
  isExternal?: boolean;
  pendingIssues?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  lastAccessAt?: Date;
}

const UserSchema = new Schema<UserType>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
      required: true,
    },

    role: {
      enum: ["ASSISTANT", "CONSULTANT", "BROKER", "SUPERVISOR", "COORDINATOR", "MANAGER", "DIRECTOR"],
      default: "ASSISTANT",
      type: String,
      index: true,
    },
    department: {
      type: String,
      enum: ["CRC", "LEGAL", "INVENTORY", "SALES", "OPERATIONS"],
      index: true,
    },

    company: {
      type: String,
      trim: true,
      index: true,
      required: true,
    },

    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },

    isExternal: {
      type: Boolean,
      default: true,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    lastAccessAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    pendingIssues: {
      type: [String],
      default: [],
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export default mongoose.model<UserType>("User", UserSchema);
