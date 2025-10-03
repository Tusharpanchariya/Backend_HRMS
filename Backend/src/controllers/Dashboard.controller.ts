import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        fullName: true,
        department: { select: { id: true, name: true } },
        status: true,
        activeStatus: true,
      },
    });


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceSummary = await prisma.attendance.groupBy({
      by: ["status"],
      where: { attendanceDate: today },
      _count: { status: true },
    });


    const pendingLeaves = await prisma.leave.count({
      where: { approvalStatus: "PENDING" },
    });


    const payrollSummary = await prisma.payroll.groupBy({
      by: ["paymentStatus"],
      _count: { id: true },
    });

    
    const activeTrainings = await prisma.training.count({
      where: { endDate: { gte: new Date() } },
    });


    const projects = await prisma.project.findMany({
      select: { id: true, name: true },
    });

   
    const timeEntriesToday = await prisma.timeEntry.count({
      where: {
        date: today,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        employees,
        attendanceSummary,
        pendingLeaves,
        payrollSummary,
        activeTrainings,
        projects,
        timeEntriesToday,
      },
    });
  } catch (error: any) {
    console.error("Dashboard fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};
