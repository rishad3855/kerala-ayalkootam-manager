import express from "express";
import { body } from "express-validator";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { signToken } from "../utils/tokens.js";

const router = express.Router();

router.post(
  "/login",
  [body("username").trim().notEmpty(), body("password").notEmpty()],
  validate,
  async (req, res) => {
    const user = await User.findOne({ username: req.body.username }).populate("member");
    if (!user || !(await user.matchPassword(req.body.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    res.json({
      token: signToken(user),
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        member: user.member
      }
    });
  }
);

router.get("/me", protect, (req, res) => {
  res.json({ id: req.user._id, username: req.user.username, role: req.user.role, member: req.user.member });
});

export default router;
