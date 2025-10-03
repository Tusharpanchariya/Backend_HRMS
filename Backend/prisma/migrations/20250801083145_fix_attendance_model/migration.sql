/*
  Warnings:

  - You are about to drop the column `checkIn` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `checkOut` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Attendance` table. All the data in the column will be lost.
  - Added the required column `attendanceDate` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "checkIn",
DROP COLUMN "checkOut",
DROP COLUMN "date",
ADD COLUMN     "attendanceDate" DATE NOT NULL,
ADD COLUMN     "inTime" TIMESTAMP(3),
ADD COLUMN     "isBiometric" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "outTime" TIMESTAMP(3),
ADD COLUMN     "overtimeHours" DOUBLE PRECISION,
ADD COLUMN     "totalHours" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Attendance_employeeId_idx" ON "Attendance"("employeeId");

-- CreateIndex
CREATE INDEX "Attendance_attendanceDate_idx" ON "Attendance"("attendanceDate");
