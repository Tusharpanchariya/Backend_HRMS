"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Create Task
const createTask = async (req, res) => {
    try {
        const { projectId, name, description, assignedTo, startDate, endDate, status } = req.body;
        const task = await prisma.task.create({
            data: {
                projectId,
                name,
                description,
                assignedTo,
                startDate: new Date(startDate), // Convert to Date
                endDate: endDate ? new Date(endDate) : null,
                status,
            },
        });
        res.status(201).json({ success: true, data: task });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create task", details: error });
    }
};
exports.createTask = createTask;
// ✅ Get All Tasks (with project info)
const getTasks = async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            include: { project: true, timeEntries: true },
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks", details: error });
    }
};
exports.getTasks = getTasks;
// ✅ Get Task By ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({
            where: { id: Number(id) },
            include: { project: true, timeEntries: true },
        });
        if (!task)
            return res.status(404).json({ error: "Task not found" });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch task", details: error });
    }
};
exports.getTaskById = getTaskById;
// ✅ Update Task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        const updatedTask = await prisma.task.update({
            where: { id: Number(id) },
            data: { title, description, status },
        });
        res.json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update task", details: error });
    }
};
exports.updateTask = updateTask;
// ✅ Delete Task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({ where: { id: Number(id) } });
        res.json({ message: "Task deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete task", details: error });
    }
};
exports.deleteTask = deleteTask;
