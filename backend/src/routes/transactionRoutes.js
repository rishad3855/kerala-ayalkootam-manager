import express from "express";
import { body, query } from "express-validator";
import Transaction from "../models/Transaction.js";
import Loan from "../models/Loan.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { recordTransaction } from "../utils/finance.js";
import { transactionsCsv, transactionsPdf } from "../utils/reports.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const filter = {};
  if (req.user.role === "member") filter.member = req.user.member._id;
  if (req.query.memberId && req.user.role === "admin") filter.member = req.query.memberId;
  if (req.query.type) filter.type = req.query.type;
  const transactions = await Transaction.find(filter).populate("member").sort({ date: -1 }).limit(500);
  res.json(transactions);
});

router.post(
  "/",
  protect,
  requireRole("admin"),
  [body("amount").isFloat({ min: 1 }), body("type").isIn(["thrift", "loan_repay"]), body("memberId").optional().isMongoId()],
  validate,
  async (req, res) => {
    const memberId = req.body.memberId;
    if (!memberId) return res.status(422).json({ message: "memberId is required" });

    const tx = await recordTransaction({
      memberId,
      type: req.body.type,
      amount: req.body.amount,
      description: req.body.description || "Admin entry",
      recordedBy: req.user._id,
      date: req.body.date
    });

    if (req.body.type === "loan_repay" && req.body.loanId) {
      const loan = await Loan.findById(req.body.loanId);
      if (loan) {
        loan.paidAmount += Number(req.body.amount);
        if (loan.paidAmount >= loan.totalPayable) loan.status = "repaid";
        await loan.save();
      }
    }
    res.status(201).json(tx);
  }
);

router.post(
  "/weekly",
  protect,
  requireRole("admin"),
  [body("payments").isArray({ min: 1 }), body("payments.*.memberId").isMongoId(), body("payments.*.amount").isFloat({ min: 0 })],
  validate,
  async (req, res) => {
    const saved = [];
    for (const payment of req.body.payments) {
      if (Number(payment.amount) > 0) {
        saved.push(
          await recordTransaction({
            memberId: payment.memberId,
            type: "thrift",
            amount: payment.amount,
            description: req.body.description || "Weekly thrift collection",
            recordedBy: req.user._id,
            date: req.body.date
          })
        );
      }
    }
    res.status(201).json(saved);
  }
);

router.get("/export/csv", protect, requireRole("admin"), async (_req, res) => {
  const txs = await Transaction.find().populate("member").sort({ date: -1 });
  res.header("Content-Type", "text/csv");
  res.attachment("ayalkootam-transactions.csv");
  res.send(transactionsCsv(txs));
});

router.get("/export/pdf", protect, requireRole("admin"), async (_req, res) => {
  const txs = await Transaction.find().populate("member").sort({ date: -1 }).limit(300);
  const pdf = await transactionsPdf(txs, "Ayalkootam Transaction Report");
  res.header("Content-Type", "application/pdf");
  res.attachment("ayalkootam-report.pdf");
  res.send(pdf);
});

export default router;
