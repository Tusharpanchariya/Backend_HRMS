"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getAllProjects = exports.createProject = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Create Project
const createProject = async (req, res) => {
    try {
        const { name, description, startDate, endDate } = req.body;
        const project = await prisma.project.create({
            data: { name, description, startDate, endDate },
        });
        res.status(201).json({ success: true, data: project });
    }
    catch (error) {
        console.error("❌ Error creating project:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createProject = createProject;
// ✅ Get All Projects (with optional related data)
const getAllProjects = async (_req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: {
                createdAt: "desc",
            },
            // Only include relations that actually exist in your schema.
            // Example: If you have timeEntries relation: include: { timeEntries: true }
        });
        res.status(200).json({
            success: true,
            message: "Projects fetched successfully",
            data: projects,
        });
    }
    catch (error) {
        console.error("❌ Error fetching projects:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch projects",
            error: error.message,
        });
    }
};
exports.getAllProjects = getAllProjects;
// ✅ Get Project by ID
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id: Number(id) },
            // Add related models only if they exist
            // include: { timeEntries: true }
        });
        if (!project) {
            return res
                .status(404)
                .json({ success: false, message: "Project not found" });
        }
        res.json({ success: true, data: project });
    }
    catch (error) {
        console.error("❌ Error fetching project by ID:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProjectById = getProjectById;
// ✅ Update Project
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, startDate, endDate } = req.body;
        const project = await prisma.project.update({
            where: { id: Number(id) },
            data: { name, description, startDate, endDate },
        });
        res.json({ success: true, data: project });
    }
    catch (error) {
        console.error("❌ Error updating project:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProject = updateProject;
// ✅ Delete Project
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.project.delete({ where: { id: Number(id) } });
        res.json({ success: true, message: "Project deleted successfully" });
    }
    catch (error) {
        console.error("❌ Error deleting project:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteProject = deleteProject;
