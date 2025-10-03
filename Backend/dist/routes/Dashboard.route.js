"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Dashboard_controller_1 = require("../controllers/Dashboard.controller");
const router = (0, express_1.Router)();
// GET /api/dashboard
router.get("/", Dashboard_controller_1.getDashboardData);
exports.default = router;
