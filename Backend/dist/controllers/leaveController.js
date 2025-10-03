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
        if (!employeeId || !startDate || !endDate || !leaveType || !leaveReason) {
            return res.status(400).json({
                success: false,
                message: "All fields (employeeId, startDate, endDate, leaveType, leaveReason) are required",
            });
        }
        // Calculate total days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const leave = await prisma.leave.create({
            data: {
                employeeId,
                startDate: start,
                endDate: end,
                leaveType,
                leaveReason,
                approvalStatus: "PENDING",
                totalDays,
            },
        });
        res.status(201).json({
            success: true,
            message: "Leave request created successfully",
            leave,
        });
    }
    catch (error) {
        console.error("Error creating leave:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create leave request",
        });
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
        res.status(500).json({ success: false, message: "Failed to fetch leaves" });
    }
};
exports.getEmployeeLeaves = getEmployeeLeaves;
// getAll 
const getAllLeaves = async (req, res) => {
    try {
        const { page = '1', limit = '10', approvalStatus, leaveType, departmentId, employeeId, startDate, endDate, employeeType, search, } = req.query;
        // Parse pagination parameters
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const where = {};
        // Approval Status filter (string-based, no enum validation)
        if (approvalStatus) {
            if (Array.isArray(approvalStatus)) {
                where.approvalStatus = { in: approvalStatus.map(s => s.toUpperCase()) };
            }
            else {
                where.approvalStatus = approvalStatus.toUpperCase();
            }
        }
        // Leave Type filter (string-based, no enum validation)
        if (leaveType) {
            if (Array.isArray(leaveType)) {
                where.leaveType = { in: leaveType.map(s => s.toUpperCase()) };
            }
            else {
                where.leaveType = leaveType.toUpperCase();
            }
        }
        // Department filter
        if (departmentId) {
            const departmentIds = Array.isArray(departmentId)
                ? departmentId.map(id => parseInt(id))
                : [parseInt(departmentId)];
            where.employee = {
                ...where.employee,
                departmentId: { in: departmentIds.filter((id) => !isNaN(id)) },
            };
        }
        // Employee filter
        if (employeeId) {
            const employeeIds = Array.isArray(employeeId)
                ? employeeId.map(id => parseInt(id))
                : [parseInt(employeeId)];
            where.employeeId = { in: employeeIds.filter(id => !isNaN(id)) };
        }
        // Employee Type filter (string-based, no enum validation)
        if (employeeType) {
            if (Array.isArray(employeeType)) {
                where.employee = {
                    ...where.employee,
                    employeeType: { in: employeeType }
                };
            }
            else {
                where.employee = {
                    ...where.employee,
                    employeeType: employeeType
                };
            }
        }
        // Date range filter
        if (startDate || endDate) {
            where.OR = [
                {
                    startDate: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endDate && { lte: new Date(endDate) })
                    }
                },
                {
                    endDate: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endDate && { lte: new Date(endDate) })
                    }
                }
            ];
        }
        // Search filter (by employee name)
        if (search) {
            where.employee = {
                ...where.employee,
                fullName: {
                    contains: search,
                    mode: 'insensitive'
                }
            };
        }
        // Execute queries
        const [leaves, totalLeaves] = await Promise.all([
            prisma.leave.findMany({
                where,
                include: { employee: true },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limitNum,
            }),
            prisma.leave.count({ where }),
        ]);
        // Transform response
        const transformedLeaves = leaves.map((leave) => ({
            id: leave.id,
            employeeId: leave.employeeId,
            startDate: leave.startDate,
            endDate: leave.endDate,
            leaveType: leave.leaveType,
            leaveReason: leave.leaveReason,
            approvalStatus: leave.approvalStatus,
            totalDays: leave.totalDays,
            createdAt: leave.createdAt,
            updatedAt: leave.updatedAt,
            employee: {
                id: leave.employee?.id,
                fullName: leave.employee?.fullName,
                email: leave.employee?.user?.email ?? null,
                contactNumber: leave.employee?.contactNumber,
                designation: leave.employee?.designation,
                employeeType: leave.employee?.employeeType,
                department: leave.employee?.department,
            },
        }));
        const totalPages = Math.ceil(totalLeaves / limitNum);
        return res.status(200).json({
            success: true,
            message: 'Leaves fetched successfully',
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
                    ...(employeeType && { employeeType }),
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate }),
                    ...(search && { search }),
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching leaves:', error);
        // Handle specific Prisma validation errors
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002' || error.code === 'P2025') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid filter value provided',
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
            return res.status(400).json({
                success: false,
                message: "approvalStatus is required",
            });
        }
        // Check if leave exists
        const existingLeave = await prisma.leave.findUnique({
            where: { id: parseInt(leaveId) },
        });
        if (!existingLeave) {
            return res.status(404).json({
                success: false,
                message: "Leave not found",
            });
        }
        // Update leave status (removed approvedAt since not in schema)
        const updatedLeave = await prisma.leave.update({
            where: { id: parseInt(leaveId) },
            data: {
                approvalStatus: approvalStatus.toUpperCase(),
                // if you want to store who approved:
                // approvedById: req.user.id   // (if you are storing logged-in approver)
            },
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
        // ✅ Check if leave exists
        const existingLeave = await prisma.leave.findUnique({
            where: { id: parseInt(leaveId) },
        });
        if (!existingLeave) {
            return res.status(404).json({
                success: false,
                message: "Leave not found",
            });
        }
        // ✅ Delete the leave
        await prisma.leave.delete({
            where: { id: parseInt(leaveId) },
        });
        return res.status(200).json({
            success: true,
            message: "Leave deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting leave:", error);
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Leave not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.deleteLeave = deleteLeave;
// export const deleteLeave = async (req: Request, res: Response) => {
//   try {
//     const { leaveId } = req.params;
//     // ✅ Check if leave exists
//     const existingLeave = await prisma.leave.findUnique({
//       where: { id: parseInt(leaveId) },
//     });
//     if (!existingLeave) {
//       return res.status(404).json({
//         success: false,
//         message: "Leave not found",
//       });
//     }
//     // ✅ Delete the leave
//     await prisma.leave.delete({
//       where: { id: parseInt(leaveId) },
//     });
//     return res.status(200).json({
//       success: true,
//       message: "Leave deleted successfully",
//     });
//   } catch (error: any) {
//     console.error("Error deleting leave:", error);
//     if (error.code === "P2025") {
//       return res.status(404).json({
//         success: false,
//         message: "Leave not found",
//       });
//     }
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };
