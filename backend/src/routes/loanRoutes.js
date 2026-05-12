import express from "express";
import { body, param } from "express-validator";
import Loan from "../models/Loan.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { recordTransaction } from "../utils/finance.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const filter = req.user.role === "member" ? { member: req.user.member._id } : {};
  const loans = await Loan.find(filter).populate("member").sort({ createdAt: -1 });
  res.json(loans);
});

router.post(
  "/request",
  protect,
  requireRole("member"),
  [body("amount").isFloat({ min: 1 }), body("installments").isInt({ min: 1 })],
  validate,
  async (req, res) => {
    const loan = await Loan.create({
      member: req.user.member._id,
      amount: req.body.amount,
      interestRate: 0,
      installments: req.body.installments,
      purpose: req.body.purpose || ""
    });
    res.status(201).json(await loan.populate("member"));
  }
);

router.post(
  "/",
  protect,
  requireRole("admin"),
  [body("memberId").isMongoId(), body("amount").isFloat({ min: 1 }), body("installments").isInt({ min: 1 })],
  validate,
  async (req, res) => {
    const loan = await Loan.create({
      member: req.body.memberId,
      amount: req.body.amount,
      interestRate: 0,
      installments: req.body.installments,
      startDate: req.body.startDate || new Date(),
      status: "active",
      purpose: req.body.purpose || "",
      approvedBy: req.user._id
    });
    await recordTransaction({
      memberId: req.body.memberId,
      type: "loan_issue",
      amount: req.body.amount,
      description: `Loan issued (${req.body.installments} installments)`,
      recordedBy: req.user._id
    });
    res.status(201).json(await loan.populate("member"));
  }
);

router.patch(
  "/:id/status",
  protect,
  requireRole("admin"),
  [param("id").isMongoId(), body("status").isIn(["active", "rejected"])],
  validate,
  async (req, res) => {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    loan.status = req.body.status;
    loan.approvedBy = req.user._id;
    if (req.body.status === "active") {
      await recordTransaction({
        memberId: loan.member,
        type: "loan_issue",
        amount: loan.amount,
        description: "Requested loan approved",
        recordedBy: req.user._id
      });
    }
    await loan.save();
    res.json(await loan.populate("member"));
  }
);

export default router;
