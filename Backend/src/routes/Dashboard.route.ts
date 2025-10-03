import { Router } from "express";
import { getDashboardData } from "../controllers/Dashboard.controller";

const router = Router();

// GET /api/dashboard
router.get("/", getDashboardData);

export default router;
