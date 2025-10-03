"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.updateUserRole = exports.createUserProfile = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Create User Profile — Safe & Validated
const createUserProfile = async (req, res) => {
    const userId = req.user?.userId; // Auto-extracted from token
    const { fullName, role, companyName, companyDomain, companySize } = req.body;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized access" });
    if (!fullName || !role || !companyName || !companyDomain || !companySize) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        // 1. Check if user exists
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // 2. Check if profile already exists
        const existingProfile = await prismaClient_1.default.profile.findUnique({ where: { userId } });
        if (existingProfile) {
            return res.status(409).json({ message: "Profile already exists", profile: existingProfile });
        }
        // 3. Find or create company
        let company = await prismaClient_1.default.company.findFirst({ where: { domain: companyDomain } });
        if (!company) {
            company = await prismaClient_1.default.company.create({
                data: {
                    name: companyName,
                    domain: companyDomain,
                    size: companySize,
                    category: "General",
                    industry: "General"
                },
            });
        }
        // 4. Create profile
        const profile = await prismaClient_1.default.profile.create({
            data: {
                userId,
                fullName,
                role,
                companyId: company.id,
            },
            include: {
                user: true,
                company: true,
            },
        });
        return res.status(201).json({
            message: "Profile created successfully",
            profile,
        });
    }
    catch (err) {
        console.error("❌ Error creating profile:", err);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
exports.createUserProfile = createUserProfile;
// Update Profile Role Only
const updateUserRole = async (req, res) => {
    const userId = req.user?.userId;
    const { role } = req.body;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    if (!role)
        return res.status(400).json({ message: 'Role is required' });
    try {
        const updatedProfile = await prismaClient_1.default.profile.update({
            where: { userId },
            data: { role },
        });
        return res.json({ message: 'Role updated successfully', profile: updatedProfile });
    }
    catch (error) {
        console.error('Update Role Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateUserRole = updateUserRole;
// Get Authenticated User’s Profile with Company + User Info
const getUserProfile = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const profile = await prismaClient_1.default.profile.findUnique({
            where: { userId },
            include: {
                company: true,
                user: true,
            },
        });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        return res.json({ profile });
    }
    catch (error) {
        console.error('Get Profile Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getUserProfile = getUserProfile;
