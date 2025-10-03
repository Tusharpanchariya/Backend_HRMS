import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Create Project
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    const project = await prisma.project.create({
      data: { name, description, startDate, endDate },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    console.error("❌ Error creating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Projects (with optional related data)
export const getAllProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
      // Only include relations that actually exist in your schema.
      // Example: If you have timeEntries relation: include: { timeEntries: true }
    });

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data: projects,
    });
  } catch (error: any) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// ✅ Get Project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      // Add related models only if they exist
      // include: { timeEntries: true }
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, data: project });
  } catch (error: any) {
    console.error("❌ Error fetching project by ID:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate } = req.body;

    const project = await prisma.project.update({
      where: { id: Number(id) },
      data: { name, description, startDate, endDate },
    });

    res.json({ success: true, data: project });
  } catch (error: any) {
    console.error("❌ Error updating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({ where: { id: Number(id) } });

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error: any) {
    console.error("❌ Error deleting project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
