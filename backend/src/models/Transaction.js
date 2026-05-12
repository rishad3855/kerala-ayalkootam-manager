import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    type: {
      type: String,
      enum: ["thrift", "loan_issue", "loan_repay", "withdrawal"],
      required: true
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: "" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

transactionSchema.index({ member: 1, date: -1 });

export default mongoose.model("Transaction", transactionSchema);
