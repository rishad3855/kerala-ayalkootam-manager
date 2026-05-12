import express from "express";
import { body } from "express-validator";
import PaymentSettings from "../models/PaymentSettings.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

async function getSettings() {
  let settings = await PaymentSettings.findOne().sort({ createdAt: 1 });
  if (!settings) settings = await PaymentSettings.create({});
  return settings;
}

router.get("/", protect, async (_req, res) => {
  res.json(await getSettings());
});

router.put(
  "/",
  protect,
  requireRole("admin"),
  [
    body("googlePayNumber").optional().trim(),
    body("upiId").optional().trim(),
    body("qrImageUrl").optional().trim().isURL().withMessage("QR image must be a valid URL"),
    body("note").optional().trim()
  ],
  validate,
  async (req, res) => {
    const settings = await getSettings();
    settings.googlePayNumber = req.body.googlePayNumber || "";
    settings.upiId = req.body.upiId || "";
    settings.qrImageUrl = req.body.qrImageUrl || "";
    settings.note = req.body.note || "";
    settings.updatedBy = req.user._id;
    await settings.save();
    res.json(settings);
  }
);

export default router;
