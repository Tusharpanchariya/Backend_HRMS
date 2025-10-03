import { Request, Response } from "express";
import prisma from '../lib/prismaClient';
import { Prisma } from "@prisma/client";

export const createState = async (req: Request, res: Response) => {
  try {
    const { name, code } = req.body;

    const state = await (prisma as any).state.create({
      data: { name, code }
    });

    return res.status(201).json({
      success: true,
      message: "State created successfully",
      data: state,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

export const getAllStates = async (req: Request, res: Response) => {
  try {
    const states = await (prisma as any).state.findMany({
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: states,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch states",
    });
  }
};

export const updateState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const updatedState = await (prisma as any).state.update({
      where: { id: Number(id) },
      data: { name, code },
    });

    return res.status(200).json({
      success: true,
      message: "State updated successfully",
      data: updatedState,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

export const deleteState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await (prisma as any).state.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "State deleted successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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