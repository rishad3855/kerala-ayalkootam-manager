import express from "express";
import { body, param } from "express-validator";
import Member from "../models/Member.js";
import User from "../models/User.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", protect, requireRole("admin"), async (_req, res) => {
  const members = await Member.find().sort({ memberNo: 1 });
  res.json(members);
});

router.get("/me", protect, requireRole("member"), async (req, res) => {
  res.json(req.user.member);
});

router.put(
  "/:id",
  protect,
  requireRole("admin"),
  [
    param("id").isMongoId(),
    body("name").trim().notEmpty(),
    body("username").trim().isLength({ min: 3 }),
    body("phone").optional().trim(),
    body("address").optional().trim(),
    body("password").optional({ checkFalsy: true }).isLength({ min: 6 })
  ],
  validate,
  async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const username = req.body.username.trim();
    const usernameOwner = await User.findOne({ username, member: { $ne: member._id } });
    const memberUsernameOwner = await Member.findOne({ username, _id: { $ne: member._id } });
    if (usernameOwner || memberUsernameOwner) return res.status(409).json({ message: "Username already in use" });

    member.name = req.body.name;
    member.username = username;
    member.phone = req.body.phone || "";
    member.address = req.body.address || "";
    await member.save();

    const user = await User.findOne({ member: member._id });
    if (user) {
      user.username = username;
      if (req.body.password) user.passwordHash = await User.hashPassword(req.body.password);
      await user.save();
    }

    res.json(member);
  }
);

router.post(
  "/:id/reset-password",
  protect,
  requireRole("admin"),
  [param("id").isMongoId(), body("password").isLength({ min: 6 })],
  validate,
  async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    const user = await User.findOne({ member: member._id });
    user.passwordHash = await User.hashPassword(req.body.password);
    await user.save();
    res.json({ message: "Password reset successfully" });
  }
);

export default router;
