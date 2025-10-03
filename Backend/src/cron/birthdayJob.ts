import cron from "node-cron";
import prisma from "../lib/prismaClient";
import { sendBirthdayEmail } from "../utils/mailer";

// Run once daily at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    const employees = await prisma.employee.findMany({
      where: { dateOfBirth: { not: null } },
    });

    const birthdayEmployees = employees.filter((emp) => {
      const dob = new Date(emp.dateOfBirth as Date);
      return dob.getDate() === day && dob.getMonth() + 1 === month;
    });

    for (const emp of birthdayEmployees) {
      if (emp.email) {
        // ✅ Check if mail already sent today
        const alreadySent = await prisma.birthdayLog.findFirst({
          where: {
            employeeId: emp.id,
            date: today.toISOString().split("T")[0], // yyyy-mm-dd
          },
        });

        if (!alreadySent) {
          await sendBirthdayEmail(emp.email, emp.fullName);
          console.log(`🎂 Birthday mail sent to ${emp.fullName} (${emp.email})`);

          // ✅ Save a log so we don't send again
          await prisma.birthdayLog.create({
            data: {
              employeeId: emp.id,
              date: today.toISOString().split("T")[0],
            },
          });
        } else {
          console.log(`⚡ Already sent to ${emp.fullName}`);
        }
      }
    }
  } catch (error) {
    console.error("Birthday cron job error:", error);
  }
});
