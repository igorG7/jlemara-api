// src/models/Usuario.ts
import mongoose, { Schema, Document } from "mongoose";
import { PendingUserIssueType } from "../domain/pendingIssue.interface";



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
