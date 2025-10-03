"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const mailer_1 = require("../utils/mailer");
// Run once daily at 9:00 AM
node_cron_1.default.schedule("0 9 * * *", async () => {
    try {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const employees = await prismaClient_1.default.employee.findMany({
            where: { dateOfBirth: { not: null } },
        });
        const birthdayEmployees = employees.filter((emp) => {
            const dob = new Date(emp.dateOfBirth);
            return dob.getDate() === day && dob.getMonth() + 1 === month;
        });
        for (const emp of birthdayEmployees) {
            if (emp.email) {
                // ✅ Check if mail already sent today
                const alreadySent = await prismaClient_1.default.birthdayLog.findFirst({
                    where: {
                        employeeId: emp.id,
                        date: today.toISOString().split("T")[0], // yyyy-mm-dd
                    },
                });
                if (!alreadySent) {
                    await (0, mailer_1.sendBirthdayEmail)(emp.email, emp.fullName);
                    console.log(`🎂 Birthday mail sent to ${emp.fullName} (${emp.email})`);
                    // ✅ Save a log so we don't send again
                    await prismaClient_1.default.birthdayLog.create({
                        data: {
                            employeeId: emp.id,
                            date: today.toISOString().split("T")[0],
                        },
                    });
                }
                else {
                    console.log(`⚡ Already sent to ${emp.fullName}`);
                }
            }
        }
    }
    catch (error) {
        console.error("Birthday cron job error:", error);
    }
});
