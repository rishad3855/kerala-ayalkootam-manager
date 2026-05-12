import "dotenv/config";
import { connectDb } from "../config/db.js";
import Member from "../models/Member.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Loan from "../models/Loan.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import PaymentSettings from "../models/PaymentSettings.js";
import CollectionRequest from "../models/CollectionRequest.js";

const names = [
  "Anitha Nair",
  "Bindu Mol",
  "Chitra Devi",
  "Deepa Rajan",
  "Elsy Thomas",
  "Fathima Beevi",
  "Geetha S",
  "Haseena K",
  "Indira P",
  "Jaya Lakshmi",
  "Kala R",
  "Leela Amma",
  "Mini Suresh",
  "Nisha K",
  "Omana P",
  "Preetha V",
  "Radha Krishnan",
  "Sheeja M",
  "Thara B",
  "Usha Kumari"
];

async function seed() {
  await connectDb();
  await Promise.all([User.deleteMany({}), Member.deleteMany({}), Transaction.deleteMany({}), Loan.deleteMany({}), WithdrawalRequest.deleteMany({}), PaymentSettings.deleteMany({}), CollectionRequest.deleteMany({})]);

  await User.create({
    username: process.env.ADMIN_USERNAME || "admin",
    passwordHash: await User.hashPassword(process.env.ADMIN_PASSWORD || "admin123"),
    role: "admin"
  });

  for (let i = 1; i <= 20; i += 1) {
    const member = await Member.create({
      memberNo: i,
      name: names[i - 1],
      username: `member${i}`,
      phone: `+9194000000${String(i).padStart(2, "0")}`,
      address: `Ward ${i}, Kerala`,
      joinDate: new Date("2024-01-01"),
      balance: 0
    });
    await User.create({
      username: `member${i}`,
      passwordHash: await User.hashPassword(`password${i}`),
      role: "member",
      member: member._id
    });
  }

  await PaymentSettings.create({
    googlePayNumber: "+919400000000",
    upiId: "ayalkootam@upi",
    qrImageUrl: "",
    note: "Pay weekly thrift online and share the screenshot with admin."
  });

  console.log("Seed complete: admin + 20 members created");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
