"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const user = await prisma.user.create({
        data: {
            name: "Test User",
            email: "test@example.com",
            password: "hashedpassword",
            phoneNumber: "9999999999",
            paymentStatus: "free"
        }
    });
    console.log("User created:", user);
}
main().catch(console.error);
