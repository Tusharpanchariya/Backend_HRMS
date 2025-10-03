import express from "express";
import { createCompany, updateCompany, getCompany } from "../controllers/Comapny.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", verifyToken, createCompany);
router.put("/:id", verifyToken, updateCompany);
router.get("/:id", verifyToken, getCompany); // optional

export default router;
