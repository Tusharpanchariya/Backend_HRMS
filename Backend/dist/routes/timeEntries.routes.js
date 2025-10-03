"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Timeentries_controller_1 = require("../controllers/Timeentries.controller");
const router = (0, express_1.Router)();
// ✅ Create time entry
router.post("/", Timeentries_controller_1.createTimeEntry);
// bulk entries 
router.post("/bulk", Timeentries_controller_1.createBulkTimeEntries);
// ✅ Get all time entries
router.get("/", Timeentries_controller_1.getTimeEntries);
// ✅ Get single time entry
router.get("/:id", Timeentries_controller_1.getTimeEntryById);
// ✅ Update time entry
router.put("/:id", Timeentries_controller_1.updateTimeEntry);
// ✅ Delete time entry
router.delete("/:id", Timeentries_controller_1.deleteTimeEntry);
exports.default = router;
