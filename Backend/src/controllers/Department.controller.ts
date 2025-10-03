import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prismaClient";

// Create Department
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, description, manager, location, establishDate } = req.body;

    const department = await prisma.department.create({
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

// Get All Departments
export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};

// Update Department
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, manager, location, establishDate } = req.body;

    const updatedDepartment = await prisma.department.update({
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

// Delete Department
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.department.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
