import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

export default mongoose.model("User", userSchema);
