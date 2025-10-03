import { Router } from "express";
import {
  createTimeEntry,
  getTimeEntries,
  getTimeEntryById,
  updateTimeEntry,
  createBulkTimeEntries ,
  deleteTimeEntry
} from "../controllers/Timeentries.controller";

const router = Router();

// ✅ Create time entry
router.post("/", createTimeEntry);
// bulk entries 
router.post("/bulk", createBulkTimeEntries );

// ✅ Get all time entries
router.get("/", getTimeEntries);

// ✅ Get single time entry
router.get("/:id", getTimeEntryById);

// ✅ Update time entry
router.put("/:id", updateTimeEntry);

// ✅ Delete time entry
router.delete("/:id", deleteTimeEntry);

export default router;
