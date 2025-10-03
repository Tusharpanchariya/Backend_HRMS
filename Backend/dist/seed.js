"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const roles = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE'];
    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role },
            update: {},
            create: { name: role, description: `${role} role` },
        });
    }
}
main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
