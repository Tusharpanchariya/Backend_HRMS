"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttendancePolicy = exports.updateAttendancePolicy = exports.getAttendancePolicyById = exports.getAllAttendancePolicies = exports.createAttendancePolicy = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// CREATE Attendance Policy
const createAttendancePolicy = async (req, res) => {
    try {
        const { companyName, ...policyData } = req.body;
        if (!companyName) {
            return res.status(400).json({
                success: false,
                message: 'companyName is required',
            });
        }
        // Use findFirst for non-unique field
        const company = await prismaClient_1.default.company.findFirst({
            where: { name: companyName },
        });
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found',
            });
        }
        // Create attendance policy using the companyId
        const policy = await prismaClient_1.default.attendancePolicy.create({
            data: {
                ...policyData,
                companyId: company.id,
            },
        });
        res.status(201).json({ success: true, data: policy });
    }
    catch (error) {
        console.error('Create AttendancePolicy error:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'Attendance policy already exists for this company',
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createAttendancePolicy = createAttendancePolicy;
// GET All Policies
const getAllAttendancePolicies = async (_req, res) => {
    try {
        const policies = await prismaClient_1.default.attendancePolicy.findMany({
            include: { company: true },
        });
        res.status(200).json({ success: true, data: policies });
    }
    catch (error) {
        console.error('Get all AttendancePolicies error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch policies' });
    }
};
exports.getAllAttendancePolicies = getAllAttendancePolicies;
// GET Policy by ID
const getAttendancePolicyById = async (req, res) => {
    try {
        const { id } = req.params;
        const policy = await prismaClient_1.default.attendancePolicy.findUnique({
            where: { id: Number(id) },
            include: { company: true },
        });
        if (!policy)
            return res.status(404).json({ success: false, message: 'Policy not found' });
        res.status(200).json({ success: true, data: policy });
    }
    catch (error) {
        console.error('Get AttendancePolicy by ID error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch policy' });
    }
};
exports.getAttendancePolicyById = getAttendancePolicyById;
// UPDATE Policy by ID
const updateAttendancePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const policy = await prismaClient_1.default.attendancePolicy.update({
            where: { id: Number(id) },
            data,
        });
        res.status(200).json({ success: true, data: policy });
    }
    catch (error) {
        console.error('Update AttendancePolicy error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateAttendancePolicy = updateAttendancePolicy;
// DELETE Policy by ID
const deleteAttendancePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.default.attendancePolicy.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ success: true, message: 'Attendance policy deleted' });
    }
    catch (error) {
        console.error('Delete AttendancePolicy error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteAttendancePolicy = deleteAttendancePolicy;
