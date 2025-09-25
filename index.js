import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./src/db/index.js";
import BestDealProduct from "./src/routes/BestDealProducts.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import cartRoutes from "./src/routes/cart.route.js";
import categoryRoutes from "./src/routes/category.routes.js";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/authRoutes.js";
import cors from "cors";

const app = express();

// ✅ Setup CORS
const corsOptions = {
  origin: "https://e-commerce-website-react-js-gules.vercel.app",
  credentials: true, // allow cookies or auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ handle preflight

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Hello World! Backend is working ✅");
});

// ✅ API Routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", BestDealProduct);
app.use("/api/v1", authRoutes);
app.use("/api/v1", categoryRoutes);

// ✅ Connect DB and Start Server
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`⚙️  Server is running at port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MONGO DB connection failed !!! ", err.message);
  });
