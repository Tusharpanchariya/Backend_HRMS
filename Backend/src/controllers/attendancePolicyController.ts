// fileName: attendancePolicyController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

// CREATE Attendance Policy
export const createAttendancePolicy = async (req: Request, res: Response) => {
  try {
    const { companyName, ...policyData } = req.body;

    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: 'companyName is required',
      });
    }

    // Use findFirst for non-unique field
    const company = await prisma.company.findFirst({
      where: { name: companyName },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Create attendance policy using the companyId
    const policy = await prisma.attendancePolicy.create({
      data: {
        ...policyData,
        companyId: company.id,
      },
    });

    res.status(201).json({ success: true, data: policy });
  } catch (error: any) {
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

// GET All Policies
export const getAllAttendancePolicies = async (_req: Request, res: Response) => {
  try {
    const policies = await prisma.attendancePolicy.findMany({
      include: { company: true },
    });
    res.status(200).json({ success: true, data: policies });
  } catch (error) {
    console.error('Get all AttendancePolicies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policies' });
  }
};

// GET Policy by ID
export const getAttendancePolicyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const policy = await prisma.attendancePolicy.findUnique({
      where: { id: Number(id) },
      include: { company: true },
    });

    if (!policy)
      return res.status(404).json({ success: false, message: 'Policy not found' });

    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    console.error('Get AttendancePolicy by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policy' });
  }
};

// UPDATE Policy by ID
export const updateAttendancePolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const policy = await prisma.attendancePolicy.update({
      where: { id: Number(id) },
      data,
    });

    res.status(200).json({ success: true, data: policy });
  } catch (error: any) {
    console.error('Update AttendancePolicy error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE Policy by ID
export const deleteAttendancePolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.attendancePolicy.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ success: true, message: 'Attendance policy deleted' });
  } catch (error: any) {
    console.error('Delete AttendancePolicy error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};