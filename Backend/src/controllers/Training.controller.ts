import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Training
export const createTraining = async (req: Request, res: Response) => {
  const {
    employeeId,
    trainerType, // "Internal" | "External"
    trainerName,
    mode, // "Online" | "Offline"
    trainingTopic,
    startDate,
    endDate,
    certificate, // "Required" | "NotRequired"
    departmentId,
    departmentName,
    managerId
  } = req.body;

  try {
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: 'End date must be greater than or equal to start date' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: Number(employeeId) } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    if (departmentId) {
      const department = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
      if (!department) return res.status(404).json({ error: 'Department not found' });
    }

    if (managerId) {
      const manager = await prisma.employee.findUnique({ where: { id: Number(managerId) } });
      if (!manager) return res.status(404).json({ error: 'Manager not found' });
    }

    const training = await prisma.training.create({
      data: {
        employeeId: Number(employeeId),
        trainerType,
        trainerName,
        mode,
        trainingTopic,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        certificate,
        departmentId: departmentId ? Number(departmentId) : null,
        departmentName: departmentName || null,
        managerId: managerId ? Number(managerId) : null
      }
    });

    return res.status(201).json({ message: 'Training created successfully', data: training });
  } catch (error) {
    console.error('createTraining error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get training by ID
export const getTrainingById = async (req: Request, res: Response) => {
  const { trainingId } = req.params;

  try {
    const training = await prisma.training.findUnique({
      where: { trainingId: Number(trainingId) }
    });

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    return res.status(200).json({ data: training });
  } catch (error) {
    console.error('getTrainingById error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all trainings
export const getAllTrainings = async (_req: Request, res: Response) => {
  try {
    const trainings = await prisma.training.findMany();
    return res.status(200).json({ data: trainings });
  } catch (error) {
    console.error('getAllTrainings error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Update training
export const updateTraining = async (req: Request, res: Response) => {
  const { trainingId } = req.params;
  const updates = req.body;

  try {
    if (updates.startDate && updates.endDate) {
      if (new Date(updates.endDate) < new Date(updates.startDate)) {
        return res.status(400).json({ error: 'End date must be greater than or equal to start date' });
      }
    }

    const existingTraining = await prisma.training.findUnique({
      where: { trainingId: Number(trainingId) }
    });
    if (!existingTraining) return res.status(404).json({ error: 'Training not found' });

    const updated = await prisma.training.update({
      where: { trainingId: Number(trainingId) },
      data: updates
    });

    return res.status(200).json({ message: 'Training updated successfully', data: updated });
  } catch (error) {
    console.error('updateTraining error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Delete training
export const deleteTraining = async (req: Request, res: Response) => {
  const { trainingId } = req.params;

  try {
    const existingTraining = await prisma.training.findUnique({
      where: { trainingId: Number(trainingId) }
    });
    if (!existingTraining) return res.status(404).json({ error: 'Training not found' });

    await prisma.training.delete({
      where: { trainingId: Number(trainingId) }
    });

    return res.status(200).json({ message: 'Training deleted successfully' });
  } catch (error) {
    console.error('deleteTraining error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
