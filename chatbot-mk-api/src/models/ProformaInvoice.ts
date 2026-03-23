import mongoose, { Schema, Document, Types } from "mongoose";
import { PlanType } from "../config/constants";

export interface IProformaInvoice extends Document {
  _id: Types.ObjectId;
  invoiceNumber: string; // PF-202603-0001
  paymentReference: string; // 0002-2-m (clientNumber-plan-period)
  teamId: Types.ObjectId;
  userId: Types.ObjectId;

  // What they're buying
  plan: PlanType;
  period: "monthly" | "annual";
  amount: number; // in MKD
  currency: string;

  // Billing details
  companyName: string;
  companyAddress: string;
  companyCity: string;
  edb: string; // Единствен Даночен Број (tax ID)
  contactEmail: string;
  contactPhone?: string;

  // Status
  status: "pending" | "paid" | "cancelled" | "expired";
  paidAt?: Date;
  notes?: string; // admin notes

  createdAt: Date;
  updatedAt: Date;
}

const proformaInvoiceSchema = new Schema<IProformaInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    paymentReference: { type: String, required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    plan: { type: Number, enum: [1, 2], required: true },
    period: { type: String, enum: ["monthly", "annual"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "MKD" },

    companyName: { type: String, required: true, trim: true },
    companyAddress: { type: String, required: true, trim: true },
    companyCity: { type: String, required: true, trim: true },
    edb: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "expired"],
      default: "pending",
    },
    paidAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

// Auto-generate invoice number: PF-YYYYMM-XXXX
proformaInvoiceSchema.pre("validate", async function () {
  if (this.isNew && !this.invoiceNumber) {
    const now = new Date();
    const prefix = `PF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

    const lastInvoice = await ProformaInvoice.findOne({
      invoiceNumber: { $regex: `^${prefix}` },
    })
      .sort({ invoiceNumber: -1 })
      .lean();

    let seq = 1;
    if (lastInvoice) {
      const lastSeq = parseInt(lastInvoice.invoiceNumber.split("-")[2], 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    this.invoiceNumber = `${prefix}-${String(seq).padStart(4, "0")}`;
  }
});

export const ProformaInvoice = mongoose.model<IProformaInvoice>(
  "ProformaInvoice",
  proformaInvoiceSchema
);
