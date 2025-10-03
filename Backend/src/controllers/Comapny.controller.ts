import { Request, Response } from "express";
import prisma from "../lib/prismaClient";

// ✅ POST /api/company — Create Company
export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, domain, size, industry, category } = req.body;

    if (!name || !domain || !size || !industry || !category) {
      return res.status(400).json({
        message: "All fields are required: name, domain, size, industry, category",
      });
    }

    const existingCompany = await prisma.company.findFirst({
      where: { domain },
    });

    if (existingCompany) {
      return res.status(200).json({
        message: "Company already exists",
        company: existingCompany,
      });
    }

    const newCompany = await prisma.company.create({
      data: {
        name,
        domain,
        size,
        industry,
        category,
      },
    });

    return res.status(201).json({
      message: "Company created successfully",
      company: newCompany,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ PUT /api/company/:id — Update Company
export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, domain, size, industry, category } = req.body;

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: { name, domain, size, industry, category },
    });

    res.status(200).json({
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ message: "Failed to update company" });
  }
};

// ✅ GET /api/company/:id — Get Company Info (Optional)
export const getCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ company });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ message: "Failed to fetch company" });
  }
};
