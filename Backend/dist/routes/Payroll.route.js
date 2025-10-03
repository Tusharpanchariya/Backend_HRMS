"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payro_1 = require("../routes/payro");
const router = (0, express_1.Router)();
// ✅ Generate payroll for an employee (auto-calculation based on attendance/leave etc.)
router.post("/generate", payro_1.createPayroll);
// ✅ Get payroll by ID
router.get("/:id", payro_1.getPayrollById);
// ✅ Get all payrolls (admin view)
router.get("/", payro_1.getAllPayrolls);
// ✅ Update payroll record
router.put("/:id", payro_1.updatePayroll);
router.get("/:id/receipt", payro_1.generatePayrollReceiptPDF);
router.get("/receipts/bulk", payro_1.generateBulkPayrollReceipts);
// ✅ Delete payroll record
router.delete("/:id", payro_1.deletePayroll);
exports.default = router;
