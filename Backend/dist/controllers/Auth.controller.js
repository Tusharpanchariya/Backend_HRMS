"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const mailer_1 = require("../utils/mailer");
const role_middlewere_1 = require("../middleware/role.middlewere");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const BACKEND_URL = process.env.BACKEND_URL |
const generatePassword = (length = 10) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!&*';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};
// ------------------------
// Register
// ------------------------
const register = async (req, res) => {
    const { name, email, phoneNumber, paymentStatus } = req.body;
    try {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phoneNumber }] },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }
        const tempPassword = generatePassword();
        const hashedPassword = await bcrypt_1.default.hash(tempPassword, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber,
                password: hashedPassword,
                paymentStatus: paymentStatus || 'free',
            },
        });
        await (0, mailer_1.sendCredentialsEmail)(email, name, tempPassword);
        return res.status(201).json({
            message: 'User registered successfully. Credentials sent via email.',
            userId: newUser.id,
        });
    }
    catch (error) {
        console.error('Register Error:', error);
        return res.status(500).json({ message: 'Registration failed.', error });
    }
};
exports.register = register;
// ------------------------
// Login
// ------------------------
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        // 2. Validate user & password
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }
        // 3. Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "supersecretkey", // use env var
        { expiresIn: "1d" });
        // 4. Return response
        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                paymentStatus: user.paymentStatus,
            },
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Login failed.", error });
    }
};
exports.login = login;
// ------------------------
// Forgot Password
// ------------------------
const forgotPassword = async (req, res) => {
    if (!req.body || !req.body.email) {
        return res.status(400).json({ message: 'Email is required in the request body.' });
    }
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email.' });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });
        const resetUrl = `${BACKEND_URL}/reset-password.html?token=${resetToken}&email=${encodeURIComponent(email)}`;
        const subject = 'Password Reset - HRMS';
        const content = `
Hi ${user.name},

You requested to reset your password.

🔗 Reset Link (valid for 30 minutes): ${resetUrl}

If you didn’t request this, please ignore this email.

– HRMS Team
    `;
        await (0, mailer_1.sendCredentialsEmail)(email, subject, content.trim());
        return res.status(200).json({ message: 'Password reset link sent to your email.' });
    }
    catch (error) {
        console.error('Forgot Password Error:', error);
        return res.status(500).json({ message: 'Failed to send reset link.', error });
    }
};
exports.forgotPassword = forgotPassword;
// ------------------------
// Reset Password
// ------------------------
const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }
    try {
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gte: new Date() },
            },
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        return res.status(200).json({ message: 'Password has been reset successfully.' });
    }
    catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({ message: 'Failed to reset password.', error });
    }
};
exports.resetPassword = resetPassword;
// ------------------------
// Change Password
// ------------------------
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized.' });
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found.' });
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Incorrect current password.' });
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        return res.json({ message: 'Password changed successfully.' });
    }
    catch (error) {
        console.error('Change Password Error:', error);
        return res.status(500).json({ message: 'Could not change password.', error });
    }
};
exports.changePassword = changePassword;
// ------------------------
// Delete User (RBAC protected: Admin only)
// ------------------------
const deleteUser = async (req, res) => {
    const userId = req.user?.userId;
    const userRoles = req.user?.roles || [];
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    // RBAC check: Only Admin can delete user
    if (!(0, role_middlewere_1.hasPermission)(userRoles, 'manage_users')) {
        return res.status(403).json({ message: 'Access denied: Insufficient role' });
    }
    try {
        // Delete Profile first (due to relation)
        await prisma.profile.deleteMany({ where: { userId } });
        // Delete User
        await prisma.user.delete({ where: { id: userId } });
        return res.status(200).json({ message: 'User and profile deleted successfully.' });
    }
    catch (error) {
        console.error('Failed to delete user:', error);
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
};
exports.deleteUser = deleteUser;
