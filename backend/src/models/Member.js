import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    memberNo: { type: Number, required: true, unique: true, min: 1, max: 20 },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    joinDate: { type: Date, default: Date.now },
    balance: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Member", memberSchema);
