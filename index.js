import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "../db/index.js";
import BestDealProduct from "./src/routes/BestDealProducts.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import cartRoutes from "./src/routes/cart.route.js";
import categoryRoutes from "./src/routes/category.routes.js";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/authRoutes.js";
import cors from "cors";

const app = express();

let corsOptions = {
  origin: "http://localhost:5173",
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Vercel Deployment!");
});

// API Routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", BestDealProduct);
app.use("/api/v1", authRoutes);
app.use("/api/v1", categoryRoutes);

connectDB().then(() => {
  console.log("✅ MongoDB Connected Successfully!");
});

export default app; // Required for Vercel
