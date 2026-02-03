// src/models/Usuario.ts
import mongoose, { Schema, Document } from "mongoose";

export type UserRole =
  | "AGENT" // talks to customers day-to-day
  | "SUPERVISOR" // coordinates agents, distributes conversations
  | "MANAGER" // full operational view, reports, settings
  | "ADMIN"; // highest level, full access (2 levels above base)

export type PendingStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";

export type PendingIssueLogType = {
  status: PendingStatus;
  date: Date;
  note: string;
};

export type PendingUserIssueType = {
  userID: string;
  title: string;
  description: string;
  date: Date;
  reference: string;
  dueDate: Date;
  status: PendingStatus;
  log: PendingIssueLogType[];
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<PendingUserIssueType>(
  {
    userID: {
      type: String, // ou Schema.Types.ObjectId se referenciar User
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    reference: {
      type: String,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"],
      default: "PENDING",
    },

    log: {
      type: [Object],
      default: [],
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export default mongoose.model<PendingUserIssueType>(
  "PendingIssues",
  UserSchema,
);
