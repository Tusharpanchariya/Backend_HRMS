"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompany = exports.updateCompany = exports.createCompany = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// ✅ POST /api/company — Create Company
const createCompany = async (req, res) => {
    try {
        const { name, domain, size, industry, category } = req.body;
        if (!name || !domain || !size || !industry || !category) {
            return res.status(400).json({
                message: "All fields are required: name, domain, size, industry, category",
            });
        }
        const existingCompany = await prismaClient_1.default.company.findFirst({
            where: { domain },
        });
        if (existingCompany) {
            return res.status(200).json({
                message: "Company already exists",
                company: existingCompany,
            });
        }
        const newCompany = await prismaClient_1.default.company.create({
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
    }
    catch (error) {
        console.error("Error creating company:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.createCompany = createCompany;
// ✅ PUT /api/company/:id — Update Company
const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, domain, size, industry, category } = req.body;
        const updatedCompany = await prismaClient_1.default.company.update({
            where: { id },
            data: { name, domain, size, industry, category },
        });
        res.status(200).json({
            message: "Company updated successfully",
            company: updatedCompany,
        });
    }
    catch (error) {
        console.error("Error updating company:", error);
        res.status(500).json({ message: "Failed to update company" });
    }
};
exports.updateCompany = updateCompany;
// ✅ GET /api/company/:id — Get Company Info (Optional)
const getCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await prismaClient_1.default.company.findUnique({
            where: { id },
        });
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        res.status(200).json({ company });
    }
    catch (error) {
        console.error("Error fetching company:", error);
        res.status(500).json({ message: "Failed to fetch company" });
    }
};
exports.getCompany = getCompany;
