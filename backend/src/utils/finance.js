import Member from "../models/Member.js";
import Transaction from "../models/Transaction.js";

export async function recordTransaction({ memberId, type, amount, description, recordedBy, date }) {
  const member = await Member.findById(memberId);
  if (!member) throw new Error("Member not found");

  const numericAmount = Number(amount);
  const tx = await Transaction.create({
    member: member._id,
    type,
    amount: numericAmount,
    description,
    recordedBy,
    date: date || new Date()
  });

  if (type === "thrift" || type === "loan_repay") member.balance += numericAmount;
  if (type === "loan_issue" || type === "withdrawal") member.balance -= numericAmount;
  await member.save();
  return tx.populate("member");
}
