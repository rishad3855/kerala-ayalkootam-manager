import express from "express";
import { body, param } from "express-validator";
import Member from "../models/Member.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { recordTransaction } from "../utils/finance.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const filter = req.user.role === "member" ? { member: req.user.member._id } : {};
  const requests = await WithdrawalRequest.find(filter).populate("member").sort({ createdAt: -1 });
  res.json(requests);
});

router.post(
  "/request",
  protect,
  requireRole("member"),
  [body("amount").isFloat({ min: 1 }), body("reason").optional().trim()],
  validate,
  async (req, res) => {
    const member = await Member.findById(req.user.member._id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    if (Number(req.body.amount) > member.balance) {
      return res.status(422).json({ message: "Requested amount is greater than current balance" });
    }

    const request = await WithdrawalRequest.create({
      member: member._id,
      amount: req.body.amount,
      reason: req.body.reason || ""
    });
    res.status(201).json(await request.populate("member"));
  }
);

router.patch(
  "/:id/status",
  protect,
  requireRole("admin"),
  [param("id").isMongoId(), body("status").isIn(["approved", "rejected"])],
  validate,
  async (req, res) => {
    const request = await WithdrawalRequest.findById(req.params.id).populate("member");
    if (!request) return res.status(404).json({ message: "Withdrawal request not found" });
    if (request.status !== "requested") return res.status(422).json({ message: "Request already reviewed" });

    if (req.body.status === "approved") {
      const member = await Member.findById(request.member._id);
      if (request.amount > member.balance) return res.status(422).json({ message: "Member balance is not enough" });
      await recordTransaction({
        memberId: member._id,
        type: "withdrawal",
        amount: request.amount,
        description: request.reason || "Collection withdrawal approved",
        recordedBy: req.user._id
      });
    }

    request.status = req.body.status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();
    res.json(await request.populate("member"));
  }
);

export default router;
