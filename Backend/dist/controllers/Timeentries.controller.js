"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTimeEntry = exports.updateTimeEntry = exports.getTimeEntryById = exports.getTimeEntries = exports.createBulkTimeEntries = exports.createTimeEntry = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// =============================
// CREATE SINGLE TIME ENTRY
// =============================
const createTimeEntry = async (req, res) => {
    try {
        const { employeeId, projectId, task, date, startTime, endTime, duration, description, billable } = req.body;
        if (!employeeId || !projectId || !date || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const newEntry = await prismaClient_1.default.timeEntry.create({
            data: {
                employeeId,
                projectId,
                task,
                date: new Date(date),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                duration: duration ?? 0,
                description,
                billable: billable ?? true,
            },
        });
        return res.status(201).json({ success: true, message: "Time entry created", data: newEntry });
    }
    catch (error) {
        console.error("Create Time Entry Error:", error);
        return res.status(500).json({ success: false, message: "Failed to create time entry", error: error.message });
    }
};
exports.createTimeEntry = createTimeEntry;
// =============================
// CREATE BULK TIME ENTRIES
// =============================
const parseDate = (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${value}`);
    }
    return date;
};
const createBulkTimeEntries = async (req, res) => {
    try {
        console.log("Incoming bulk request body:", req.body);
        const { entries } = req.body;
        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({ success: false, message: "Entries array is required" });
        }
        const createdEntries = await prismaClient_1.default.$transaction(entries.map((entry) => prismaClient_1.default.timeEntry.create({
            data: {
                employeeId: entry.employeeId,
                projectId: entry.projectId,
                task: entry.task,
                date: parseDate(entry.date),
                startTime: parseDate(entry.startTime),
                endTime: parseDate(entry.endTime),
                duration: entry.duration ?? 0,
                description: entry.description,
                billable: entry.billable ?? true,
            },
        })));
        return res.status(201).json({
            success: true,
            message: `${createdEntries.length} time entries created successfully`,
            data: createdEntries,
        });
    }
    catch (error) {
        console.error("Bulk Time Entries Error:", error);
        return res.status(500).json({ success: false, message: "Failed to create bulk time entries", error: error.message });
    }
};
exports.createBulkTimeEntries = createBulkTimeEntries;
// ============================= 
// GET ALL TIME ENTRIES
// =============================
const getTimeEntries = async (_req, res) => {
    try {
        const timeEntries = await prismaClient_1.default.timeEntry.findMany({
            orderBy: { date: "desc" },
            include: {
                employee: {
                    select: {
                        id: true,
                        fullName: true, // FIXED: replaced `name`
                        email: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return res.status(200).json({
            success: true,
            message: "Time entries fetched successfully",
            data: timeEntries,
        });
    }
    catch (error) {
        console.error("Get Time Entries Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch time entries", error: error.message });
    }
};
exports.getTimeEntries = getTimeEntries;
// =============================
// GET SINGLE TIME ENTRY
// =============================
const getTimeEntryById = async (req, res) => {
    try {
        const { id } = req.params;
        const entryId = Number(id);
        if (isNaN(entryId)) {
            return res.status(400).json({ success: false, message: "Invalid time entry ID" });
        }
        const timeEntry = await prismaClient_1.default.timeEntry.findUnique({
            where: { id: entryId },
            include: {
                employee: {
                    select: {
                        id: true,
                        fullName: true, // FIXED
                        email: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!timeEntry) {
            return res.status(404).json({ success: false, message: "Time entry not found" });
        }
        return res.status(200).json({ success: true, data: timeEntry });
    }
    catch (error) {
        console.error("Get Time Entry Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch time entry", error: error.message });
    }
};
exports.getTimeEntryById = getTimeEntryById;
// =============================
// UPDATE TIME ENTRY
// =============================
const updateTimeEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const entryId = Number(id);
        if (isNaN(entryId)) {
            return res.status(400).json({ success: false, message: "Invalid time entry ID" });
        }
        const { task, date, startTime, endTime, duration, description, billable } = req.body;
        const updatedEntry = await prismaClient_1.default.timeEntry.update({
            where: { id: entryId },
            data: {
                task,
                date: date ? new Date(date) : undefined,
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                duration,
                description,
                billable,
            },
        });
        return res.status(200).json({ success: true, message: "Time entry updated", data: updatedEntry });
    }
    catch (error) {
        console.error("Update Time Entry Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update time entry", error: error.message });
    }
};
exports.updateTimeEntry = updateTimeEntry;
// =============================
// DELETE TIME ENTRY
// =============================
const deleteTimeEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const entryId = Number(id);
        if (isNaN(entryId)) {
            return res.status(400).json({ success: false, message: "Invalid time entry ID" });
        }
        await prismaClient_1.default.timeEntry.delete({ where: { id: entryId } });
        return res.status(200).json({ success: true, message: "Time entry deleted successfully" });
    }
    catch (error) {
        console.error("Delete Time Entry Error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete time entry", error: error.message });
    }
};
exports.deleteTimeEntry = deleteTimeEntry;
