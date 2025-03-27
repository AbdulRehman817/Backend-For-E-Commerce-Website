import express from "express";
import {
  addProduct,
  getallProducts,
  editProduct,
  getSingleProduct,
  getProductsByCategory,
} from "../controllers/product.controllers.js";

import { upload } from "../middleware/user.multer.js";

const router = express.Router();

// Add a new best deal product
router.post("/addProduct", upload.single("image"), addProduct);

// Edit an existing best deal product
router.post("/editProduct/:id", editProduct);

// Get all best deal products
router.get("/getProduct", getallProducts);

// Get a single best deal product by ID
router.get("/getProduct/:id", getSingleProduct);

router.get("/products/category/:categoryName", getProductsByCategory);

export default router;
