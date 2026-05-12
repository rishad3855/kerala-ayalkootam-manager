import mongoose from "mongoose";

const collectionRequestSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMode: { type: String, trim: true, default: "Google Pay/UPI" },
    reference: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["requested", "approved", "rejected"], default: "requested" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("CollectionRequest", collectionRequestSchema);
