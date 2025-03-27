import express from "express";
import {
  addProduct,
  getallProducts,
  editProduct,
  getSingleProduct,
} from "../controllers/BestDealProduct.controllers.js";

import { upload } from "../middleware/user.multer.js";

const router = express.Router();

// Add a new best deal product
router.post("/addBestDealProduct", upload.single("image"), addProduct);

// Edit an existing best deal product
router.post("/editBestDealProduct/:id", upload.single("image"), editProduct);

// Get all best deal products
router.get("/getBestDealProduct", getallProducts);

// Get a single best deal product by ID
router.get("/getSingleBestDealProduct/:id", getSingleProduct);

export default router;

// {

//   "productFeatures":[
//       "True 5.1 Surround Sound (sound bar, wireless subwoofer, two wireless surround speakers",
//       "SDA Surround Technology (expansive soundstage)",
//       "VoiceAdjust Technology (enhanced dialogue clarity)",
//       "Wireless Connectivity (subwoofer and speakers)",
//       "Multiple Inputs & 4K HDR Support (HDMI ARC, optical, analog)",
//       "Built-in Chromecast (streaming, Google Assistant integration)"
//   ]
//   }
