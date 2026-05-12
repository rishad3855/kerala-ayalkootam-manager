import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema(
  {
    googlePayNumber: { type: String, trim: true, default: "" },
    upiId: { type: String, trim: true, default: "" },
    qrImageUrl: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "Pay weekly thrift and show the payment screenshot at the meeting." },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("PaymentSettings", paymentSettingsSchema);
