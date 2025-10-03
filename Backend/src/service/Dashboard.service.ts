import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getDashboardService = async () => {
  const totalEmployees = await prisma.employee.count();

  const pendingLeaves = await prisma.leave.count({ where: { approvalStatus: "PENDING" } });

  const recentEmployees = await prisma.employee.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, fullName: true, designation: true, status: true, photo: true }
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const attendanceToday = await prisma.attendance.groupBy({
    by: ["status"],
    where: { attendanceDate: { gte: startOfDay, lte: endOfDay } },
    _count: { _all: true }
  });

  // Optional: Replace with your activity table
  const recentActivities = await prisma.leave.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, employeeId: true, leaveType: true, approvalStatus: true, startDate: true, endDate: true }
  });

  return {
    totalEmployees,
    pendingLeaves,
    recentEmployees,
    attendanceToday,
    recentActivities
  };
};
