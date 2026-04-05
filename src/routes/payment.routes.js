import express from "express";
import {
  createCheckoutSession,
  stripeWebhook,
  verifyPayment,
} from "../controllers/payment.controllers.js";

const router = express.Router();

// Stripe webhook MUST use raw body — register BEFORE express.json() parses it
// We handle this in index.js by mounting webhook route separately
router.post("/payment/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Create Stripe checkout session
router.post("/payment/create-checkout-session", createCheckoutSession);

// Verify payment after redirect
router.get("/payment/verify", verifyPayment);

export default router;
