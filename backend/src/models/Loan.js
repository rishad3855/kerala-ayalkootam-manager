import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    amount: { type: Number, required: true, min: 1 },
    interestRate: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: Date.now },
    installments: { type: Number, required: true, min: 1 },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["requested", "active", "repaid", "rejected"], default: "requested" },
    purpose: { type: String, trim: true, default: "" },
    dueDay: { type: Number, default: 7 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

loanSchema.virtual("totalPayable").get(function totalPayable() {
  return Math.round(this.amount);
});

loanSchema.virtual("outstanding").get(function outstanding() {
  return Math.max(0, this.totalPayable - this.paidAmount);
});

loanSchema.set("toJSON", { virtuals: true });
loanSchema.set("toObject", { virtuals: true });

export default mongoose.model("Loan", loanSchema);
