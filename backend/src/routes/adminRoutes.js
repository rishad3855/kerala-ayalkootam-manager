import express from "express";
import Member from "../models/Member.js";
import Transaction from "../models/Transaction.js";
import Loan from "../models/Loan.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import PaymentSettings from "../models/PaymentSettings.js";
import CollectionRequest from "../models/CollectionRequest.js";
import User from "../models/User.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/summary", async (_req, res) => {
  const [members, thrift, issued, repaid, loans, txs] = await Promise.all([
    Member.countDocuments({ active: true }),
    Transaction.aggregate([{ $match: { type: "thrift" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Transaction.aggregate([{ $match: { type: "loan_issue" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Transaction.aggregate([{ $match: { type: "loan_repay" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Loan.find({ status: { $in: ["active", "requested"] } }).populate("member"),
    Transaction.find().sort({ date: 1 })
  ]);

  const trendMap = {};
  txs.forEach((tx) => {
    const week = tx.date.toISOString().slice(0, 10);
    trendMap[week] = (trendMap[week] || 0) + (tx.type === "loan_issue" ? -tx.amount : tx.amount);
  });

  res.json({
    totalMembers: members,
    totalThrift: thrift[0]?.total || 0,
    loansIssued: issued[0]?.total || 0,
    loansRepaid: repaid[0]?.total || 0,
    outstanding: loans.reduce((sum, loan) => sum + loan.outstanding, 0),
    activeLoans: loans,
    trend: Object.entries(trendMap).map(([date, amount]) => ({ date, amount }))
  });
});

router.get("/backup", async (_req, res) => {
  const [members, users, transactions, loans, withdrawals, paymentSettings, collections] = await Promise.all([
    Member.find().lean(),
    User.find().lean(),
    Transaction.find().lean(),
    Loan.find().lean(),
    WithdrawalRequest.find().lean(),
    PaymentSettings.find().lean(),
    CollectionRequest.find().lean()
  ]);
  res.json({ exportedAt: new Date(), members, users, transactions, loans, withdrawals, paymentSettings, collections });
});

router.post("/restore", async (req, res) => {
  const { members = [], users = [], transactions = [], loans = [], withdrawals = [], paymentSettings = [], collections = [] } = req.body;
  await Promise.all([Member.deleteMany({}), User.deleteMany({}), Transaction.deleteMany({}), Loan.deleteMany({}), WithdrawalRequest.deleteMany({}), PaymentSettings.deleteMany({}), CollectionRequest.deleteMany({})]);
  if (members.length) await Member.insertMany(members);
  if (users.length) await User.insertMany(users);
  if (transactions.length) await Transaction.insertMany(transactions);
  if (loans.length) await Loan.insertMany(loans);
  if (withdrawals.length) await WithdrawalRequest.insertMany(withdrawals);
  if (paymentSettings.length) await PaymentSettings.insertMany(paymentSettings);
  if (collections.length) await CollectionRequest.insertMany(collections);
  res.json({ message: "Restore complete", counts: { members: members.length, users: users.length, transactions: transactions.length, loans: loans.length, withdrawals: withdrawals.length, paymentSettings: paymentSettings.length, collections: collections.length } });
});

export default router;
