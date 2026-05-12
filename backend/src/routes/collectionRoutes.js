import express from "express";
import { body, param } from "express-validator";
import CollectionRequest from "../models/CollectionRequest.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { recordTransaction } from "../utils/finance.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const filter = req.user.role === "member" ? { member: req.user.member._id } : {};
  const requests = await CollectionRequest.find(filter).populate("member").sort({ createdAt: -1 });
  res.json(requests);
});

router.post(
  "/request",
  protect,
  requireRole("member"),
  [body("amount").isFloat({ min: 1 }), body("reference").optional().trim(), body("note").optional().trim()],
  validate,
  async (req, res) => {
    const request = await CollectionRequest.create({
      member: req.user.member._id,
      amount: req.body.amount,
      reference: req.body.reference || "",
      note: req.body.note || ""
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
    const request = await CollectionRequest.findById(req.params.id).populate("member");
    if (!request) return res.status(404).json({ message: "Collection request not found" });
    if (request.status !== "requested") return res.status(422).json({ message: "Request already reviewed" });

    if (req.body.status === "approved") {
      await recordTransaction({
        memberId: request.member._id,
        type: "thrift",
        amount: request.amount,
        description: request.reference ? `Online collection approved - Ref: ${request.reference}` : "Online collection approved",
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
