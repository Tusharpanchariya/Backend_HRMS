import express from "express";
import {
  createUserProfile,
  updateUserRole,
  getUserProfile,
} from "../controllers/Profile.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/create", verifyToken, createUserProfile);
router.put("/update-role", verifyToken, updateUserRole);
router.get("/me", verifyToken, getUserProfile);

export default router;
