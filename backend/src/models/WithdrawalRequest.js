import mongoose from "mongoose";

const withdrawalRequestSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    amount: { type: Number, required: true, min: 1 },
    reason: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["requested", "approved", "rejected"], default: "requested" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
