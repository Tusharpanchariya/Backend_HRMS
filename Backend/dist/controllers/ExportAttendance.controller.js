"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAttendanceToExcel = void 0;
const client_1 = require("@prisma/client");
const exceljs_1 = __importDefault(require("exceljs"));
const prisma = new client_1.PrismaClient();
const exportAttendanceToExcel = async (req, res) => {
    try {
        // 1. Get optional filters
        const { startDate, endDate } = req.query;
        // 2. Build query
        const where = {};
        if (startDate || endDate) {
            where.attendanceDate = {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) })
            };
        }
        // 3. Fetch data
        const attendances = await prisma.attendance.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        fullName: true,
                        department: true
                    }
                }
            },
            orderBy: { attendanceDate: 'desc' }
        });
        // 4. Create Excel workbook
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Attendance');
        // 5. Set columns
        worksheet.columns = [
            { header: 'Employee ID', key: 'employeeCode', width: 15 },
            { header: 'Name', key: 'fullName', width: 25 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Date', key: 'date', width: 15, style: { numFmt: 'dd-mm-yyyy' } },
            { header: 'Clock In', key: 'clockIn', width: 15 },
            { header: 'Clock Out', key: 'clockOut', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];
        // 6. Add data
        attendances.forEach(record => {
            worksheet.addRow({
                employeeCode: record.employee.id,
                fullName: record.employee.fullName,
                department: record.employee.department,
                date: record.attendanceDate,
                clockIn: record.inTime ? new Date(record.inTime).toLocaleTimeString() : undefined,
                clockOut: record.outTime ? new Date(record.outTime).toLocaleTimeString() : undefined,
                status: record.status
            });
        });
        // 7. Style header
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };
        });
        // 8. Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
        // 9. Send file
        await workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Export failed:', error);
        res.status(500).json({
            success: false,
            message: 'Export failed'
        });
    }
};
exports.exportAttendanceToExcel = exportAttendanceToExcel;
