import mongoose from "mongoose";
import jwt from "jsonwebtoken"; // Import JWT
import { Order } from "../models/order.model.js";
import { Product } from "../models/products.models.js";
import { Customer } from "../models/customer.models.js";

// Function to get user details
const getUserDetail = async (req) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) return null;

    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_JWT_SECRET
    );
    const user = await Customer.findOne({ email: decodedToken.email });

    return user || null; // Return user if found, else null
  } catch (error) {
    console.error("Error verifying user:", error);
    return null;
  }
};

// Place order
const placeOrder = async (req, res) => {
  try {
    // Get user details
    const user = await getUserDetail(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { products } = req.body;
    if (!products?.length) {
      return res.status(400).json({ message: "No products selected" });
    }

    // Fetch product details from database
    const productsOrder = await Product.find({ _id: { $in: products } });
    if (productsOrder.length !== products.length) {
      return res.status(404).json({ message: "Some products not found" });
    }

    // Calculate total price
    const totalPrice = productsOrder.reduce(
      (total, item) => total + item.price,
      0
    );

    // Create order in database
    const order = await Order.create({
      userId: user._id,
      productId: products,
      totalPrice,
      status: "pending",
    });

    return res
      .status(201)
      .json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const user = await getUserDetail(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await Order.findById(id)
      .populate("productId")
      .populate("userId", "userName email");

    if (!order || order.userId._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// Get all orders of logged-in user
const getAllOrderOfUser = async (req, res) => {
  try {
    const user = await getUserDetail(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await User.findById(user._id).populate("orders");
    if (!orders || orders.orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    return res.status(200).json({ orders: orders.orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export { placeOrder, getOrderById, getAllOrderOfUser };
