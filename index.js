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
let corsOptions = {
  origin: "https://e-commerce-website-react-js-gules.vercel.app",
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1", productRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", BestDealProduct);
app.use("/api/v1", authRoutes);
app.use("/api/v1", categoryRoutes);

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!! ", err);
  });
