"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteState = exports.updateState = exports.getAllStates = exports.createState = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const client_1 = require("@prisma/client");
const createState = async (req, res) => {
    try {
        const { name, code } = req.body;
        const state = await prismaClient_1.default.state.create({
            data: { name, code }
        });
        return res.status(201).json({
            success: true,
            message: "State created successfully",
            data: state,
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return res.status(400).json({
                    success: false,
                    message: "State name or code already exists",
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createState = createState;
const getAllStates = async (req, res) => {
    try {
        const states = await prismaClient_1.default.state.findMany({
            orderBy: { name: "asc" },
        });
        return res.status(200).json({
            success: true,
            data: states,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch states",
        });
    }
};
exports.getAllStates = getAllStates;
const updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code } = req.body;
        const updatedState = await prismaClient_1.default.state.update({
            where: { id: Number(id) },
            data: { name, code },
        });
        return res.status(200).json({
            success: true,
            message: "State updated successfully",
            data: updatedState,
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: "State not found",
                });
            }
            if (error.code === "P2002") {
                return res.status(400).json({
                    success: false,
                    message: "State name or code already exists",
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Failed to update state",
        });
    }
};
exports.updateState = updateState;
const deleteState = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.state.delete({
            where: { id: Number(id) },
        });
        return res.status(200).json({
            success: true,
            message: "State deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    message: "State not found",
                });
            }
            if (error.code === "P2003") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot delete state with associated employees",
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Failed to delete state",
        });
    }
};
exports.deleteState = deleteState;
