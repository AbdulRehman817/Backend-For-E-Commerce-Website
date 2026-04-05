import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  user,
} from "../controllers/auth.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refreshToken", refreshToken);
router.get("/profile", authMiddleware, user); // Apply middleware
export default router;
