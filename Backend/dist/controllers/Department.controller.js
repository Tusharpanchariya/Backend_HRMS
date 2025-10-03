"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDepartment = exports.updateDepartment = exports.getAllDepartments = exports.createDepartment = void 0;
const client_1 = require("@prisma/client");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Create Department
const createDepartment = async (req, res) => {
    try {
        const { name, description, manager, location, establishDate } = req.body;
        const department = await prismaClient_1.default.department.create({
            data: {
                name,
                description,
                manager,
                location,
                establishDate: establishDate ? new Date(establishDate) : null,
            },
        });
        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department,
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return res.status(400).json({
                    success: false,
                    message: "Department name already exists",
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createDepartment = createDepartment;
// Get All Departments
const getAllDepartments = async (req, res) => {
    try {
        const departments = await prismaClient_1.default.department.findMany({
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({
            success: true,
            data: departments,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch departments",
        });
    }
};
exports.getAllDepartments = getAllDepartments;
// Update Department
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, manager, location, establishDate } = req.body;
        const updatedDepartment = await prismaClient_1.default.department.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
                manager,
                location,
                establishDate: establishDate ? new Date(establishDate) : null,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: updatedDepartment,
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: "Department not found",
                });
            }
            if (error.code === "P2002") {
                return res.status(400).json({
                    success: false,
                    message: "Department name already exists",
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Failed to update department",
        });
    }
};
exports.updateDepartment = updateDepartment;
// Delete Department
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.department.delete({
            where: { id: Number(id) },
        });
        return res.status(200).json({
            success: true,
            message: "Department deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: "Department not found",
                });
            }
            if (error.code === "P2003") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot delete department with associated employees",
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Failed to delete department",
        });
    }
};
exports.deleteDepartment = deleteDepartment;
