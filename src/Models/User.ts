// src/models/Usuario.ts
import mongoose, { Schema, Document } from "mongoose";

export type UserRole =
  | "AGENT" // talks to customers day-to-day
  | "SUPERVISOR" // coordinates agents, distributes conversations
  | "MANAGER" // full operational view, reports, settings
  | "ADMIN"; // highest level, full access (2 levels above base)

export type PendingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type PendingIssueLogType = {
  status: PendingStatus;
  date: Date;
  note: string;
};

export type PendingUserIssueType = {
  title: string;
  description: string;
  date: Date;
  reference: string;
  dueDate: Date;
  status: PendingStatus;
  log: PendingIssueLogType[];
};

export interface UserType {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;

  role?: UserRole; // multiple roles if needed
  company?: string; // company / logical instance id
  instance?: string; // e.g. WhatsApp instance / tenant id

  isActive?: boolean;
  pendingIssues?: PendingUserIssueType[];

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
      type: String,
      enum: ["AGENT", "SUPERVISOR", "MANAGER", "ADMIN"],
      default: ["AGENT"],
      index: true,
    },

    company: {
      type: String,
      trim: true,
      index: true,
      required: true,
    },

    // WhatsApp instance / queue / tenant
    instance: {
      type: String,
      trim: true,
      default: "",
      required: true,
    },

    isActive: {
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
      type: [Object], // ou Schema.Types.Mixed se preferir
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
