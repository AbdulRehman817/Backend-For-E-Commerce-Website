import express from "express";
import {
  addCategory,
  getCategories,
} from "../controllers/category.controllers.js";
import { upload } from "../middleware/user.multer.js";

const router = express.Router();

// Get all categories
router.get("/categories", getCategories);

// Add categories (POST request should be `/categories` for consistency)
router.post("/categories", upload.single("image"), addCategory);

export default router;
