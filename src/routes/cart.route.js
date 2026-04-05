import express from "express";
import {
  removeFromCart,
  getCart,
  addToCart,
} from "../controllers/cart.controllers.js";
import authenticateUser from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/cart", authenticateUser, addToCart); // Add to cart
router.get("/cart", authenticateUser, getCart); // Get all cart items
router.delete("/cart", authenticateUser, removeFromCart); // Remove item from cart

export default router;
