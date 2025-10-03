"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeave = exports.updateLeaveStatus = exports.getAllLeaves = exports.getEmployeeLeaves = exports.createLeaveRequest = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * ✅ Create new Leave Request
 */
const createLeaveRequest = async (req, res) => {
    try {
        const { employeeId, startDate, endDate, leaveType, leaveReason } = req.body;
        if (!employeeId || !startDate || !endDate || !leaveType) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const newLeave = await prisma.leave.create({
            data: {
                employeeId: Number(employeeId),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                leaveType,
                leaveReason,
                approvalStatus: "PENDING",
                totalDays: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) /
                    (1000 * 60 * 60 * 24)) + 1,
            },
        });
        return res.status(201).json(newLeave);
    }
    catch (err) {
        console.error("createLeave error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.createLeaveRequest = createLeaveRequest;
/**
 * ✅ Get all leaves of an Employee
 */
const getEmployeeLeaves = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const leaves = await prisma.leave.findMany({
            where: { employeeId: Number(employeeId) },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, leaves });
    }
    catch (error) {
        console.error("Error fetching leaves:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch leaves" });
    }
};
exports.getEmployeeLeaves = getEmployeeLeaves;
/**
 * ✅ Get All Leaves with Filters + Pagination
 */
const getAllLeaves = async (req, res) => {
    try {
        const { page = "1", limit = "10", approvalStatus, leaveType, departmentId, employeeId, startDate, endDate, search, } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        // Filter by approvalStatus
        if (approvalStatus) {
            const list = Array.isArray(approvalStatus)
                ? approvalStatus
                : [approvalStatus];
            where.approvalStatus = { in: list.map((s) => s.toUpperCase()) };
        }
        // Filter by leaveType
        if (leaveType) {
            const list = Array.isArray(leaveType)
                ? leaveType
                : [leaveType];
            where.leaveType = { in: list.map((s) => s.toUpperCase()) };
        }
        // Filter by departmentId
        if (departmentId) {
            const deptIds = (Array.isArray(departmentId) ? departmentId : [departmentId])
                .map((id) => parseInt(String(id)))
                .filter((id) => !isNaN(id));
            if (deptIds.length) {
                where.employee = { is: { departmentId: { in: deptIds } } };
            }
        }
        // Filter by employeeId
        if (employeeId) {
            const empIds = (Array.isArray(employeeId) ? employeeId : [employeeId])
                .map((id) => parseInt(String(id)))
                .filter((id) => !isNaN(id));
            if (empIds.length)
                where.employeeId = empIds[0];
        }
        // Filter by date range
        if (startDate || endDate) {
            where.OR = [
                {
                    startDate: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endDate && { lte: new Date(endDate) }),
                    },
                },
                {
                    endDate: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endDate && { lte: new Date(endDate) }),
                    },
                },
            ];
        }
        // Search by employee fullName
        if (search) {
            const s = String(search);
            if (where.employee) {
                if ("is" in where.employee) {
                    where.employee.is = {
                        ...where.employee.is,
                        fullName: { contains: s, mode: "insensitive" },
                    };
                }
                else {
                    where.employee = {
                        is: {
                            ...where.employee,
                            fullName: { contains: s, mode: "insensitive" },
                        },
                    };
                }
            }
            else {
                where.employee = {
                    is: { fullName: { contains: s, mode: "insensitive" } },
                };
            }
        }
        // Fetch leaves and count
        const [leaves, totalLeaves] = await Promise.all([
            prisma.leave.findMany({
                where,
                include: {
                    employee: {
                        select: {
                            id: true,
                            fullName: true,
                            contactNumber: true,
                            designation: true,
                            department: { select: { id: true, name: true } },
                            user: { select: { email: true } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
            }),
            prisma.leave.count({ where }),
        ]);
        const transformedLeaves = leaves.map((l) => ({
            id: l.id,
            employeeId: l.employeeId,
            startDate: l.startDate,
            endDate: l.endDate,
            leaveType: l.leaveType,
            leaveReason: l.leaveReason,
            approvalStatus: l.approvalStatus,
            totalDays: l.totalDays,
            createdAt: l.createdAt,
            updatedAt: l.updatedAt,
            employee: {
                id: l.employee.id,
                fullName: l.employee.fullName,
                email: l.employee.user?.email || null,
                contactNumber: l.employee.contactNumber,
                designation: l.employee.designation,
                department: l.employee.department,
            },
        }));
        const totalPages = Math.ceil(totalLeaves / limitNum);
        return res.status(200).json({
            success: true,
            message: "Leaves fetched successfully",
            data: transformedLeaves,
            meta: {
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems: totalLeaves,
                    itemsPerPage: limitNum,
                    hasNext: pageNum < totalPages,
                    hasPrevious: pageNum > 1,
                },
                filters: {
                    ...(approvalStatus && { approvalStatus }),
                    ...(leaveType && { leaveType }),
                    ...(departmentId && { departmentId }),
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate }),
                    ...(search && { search }),
                },
            },
        });
    }
    catch (error) {
        console.error("Error fetching leaves:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.getAllLeaves = getAllLeaves;
/**
 * ✅ Approve / Reject Leave
 */
const updateLeaveStatus = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { approvalStatus } = req.body;
        if (!approvalStatus) {
            return res
                .status(400)
                .json({ success: false, message: "approvalStatus is required" });
        }
        const existingLeave = await prisma.leave.findUnique({
            where: { id: parseInt(leaveId) },
        });
        if (!existingLeave) {
            return res
                .status(404)
                .json({ success: false, message: "Leave not found" });
        }
        const updatedLeave = await prisma.leave.update({
            where: { id: parseInt(leaveId) },
            data: { approvalStatus: approvalStatus.toUpperCase() },
        });
        return res.status(200).json({
            success: true,
            message: `Leave status updated to ${updatedLeave.approvalStatus}`,
            data: updatedLeave,
        });
    }
    catch (error) {
        console.error("Error updating leave status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.updateLeaveStatus = updateLeaveStatus;
/**
 * ✅ Cancel Leave Request
 */
const deleteLeave = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const existingLeave = await prisma.leave.findUnique({
            where: { id: parseInt(leaveId) },
        });
        if (!existingLeave) {
            return res
                .status(404)
                .json({ success: false, message: "Leave not found" });
        }
        await prisma.leave.delete({
            where: { id: parseInt(leaveId) },
        });
        return res
            .status(200)
            .json({ success: true, message: "Leave deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting leave:", error);
        if (error.code === "P2025") {
            return res
                .status(404)
                .json({ success: false, message: "Leave not found" });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.deleteLeave = deleteLeave;
