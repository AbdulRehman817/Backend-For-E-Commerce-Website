import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { Order } from "../models/order.model.js";
import { Customer } from "../models/customer.models.js";
import { Product } from "../models/products.models.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper: get user from Bearer token (localStorage) OR refreshToken cookie
const getUserDetail = async (req) => {
  try {
    // Try Bearer token from Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];
      const decodedToken = jwt.verify(accessToken, process.env.ACCESS_JWT_SECRET);
      const user = await Customer.findOne({ email: decodedToken.email });
      if (user) return user;
    }

    // Fallback: try refreshToken from cookie
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (refreshToken) {
      const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
      const user = await Customer.findOne({ email: decodedToken.email });
      if (user) return user;
    }

    return null;
  } catch (error) {
    console.error("Error verifying user:", error);
    return null;
  }
};

// POST /api/v1/payment/create-checkout-session
export const createCheckoutSession = async (req, res) => {
  try {
    const user = await getUserDetail(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { cartItems, shippingDetails } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Build Stripe line items from cart
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          description: item.description || item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const products = cartItems.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
    }));

    const order = await Order.create({
      userId: user._id,
      products,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      status: "pending",
      paymentStatus: "unpaid",
      shippingDetails: shippingDetails || {},
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?order_id=${order._id}`,
      customer_email: user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString(),
      },
    });

    return res.status(200).json({ url: session.url, orderId: order._id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ message: "Payment session creation failed", error: error.message });
  }
};

// POST /api/v1/payment/webhook
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    try {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        status: "shipped",
        stripeSessionId: session.id,
      });
      console.log(`✅ Order ${orderId} marked as paid`);
    } catch (err) {
      console.error("Error updating order:", err);
    }
  }

  return res.status(200).json({ received: true });
};

// GET /api/v1/payment/verify?session_id=xxx&order_id=xxx
export const verifyPayment = async (req, res) => {
  try {
    const { session_id, order_id } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      await Order.findByIdAndUpdate(order_id, {
        paymentStatus: "paid",
        status: "shipped",
        stripeSessionId: session_id,
      });

      const order = await Order.findById(order_id);
      return res.status(200).json({ success: true, order });
    } else {
      return res.status(200).json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ message: "Verification failed", error: error.message });
  }
};