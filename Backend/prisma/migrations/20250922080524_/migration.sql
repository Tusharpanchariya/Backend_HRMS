/*
  Warnings:

  - You are about to drop the column `employeeType` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `stateId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `Leave` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Leave` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Leave` table. All the data in the column will be lost.
  - You are about to drop the `State` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[employeeId,attendanceDate]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aadhaarNumber` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankAccount` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `esicNumber` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ifscCode` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panNumber` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uanNumber` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaveReason` to the `Leave` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaveType` to the `Leave` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDays` to the `Leave` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "TrainerType" AS ENUM ('Internal', 'External');

-- CreateEnum
CREATE TYPE "TrainingMode" AS ENUM ('Online', 'Offline');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('Required', 'NotRequired');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_stateId_fkey";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "faceData" JSONB,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "establishDate" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "manager" TEXT;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "employeeType",
DROP COLUMN "stateId",
ADD COLUMN     "aadhaarNumber" TEXT NOT NULL,
ADD COLUMN     "activeStatus" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "bankAccount" TEXT NOT NULL,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "baseSalary" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "esicNumber" TEXT NOT NULL,
ADD COLUMN     "faceData" JSONB,
ADD COLUMN     "ifscCode" TEXT NOT NULL,
ADD COLUMN     "panNumber" TEXT NOT NULL,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "uanNumber" TEXT NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "departmentId" DROP NOT NULL,
ALTER COLUMN "designation" DROP NOT NULL,
ALTER COLUMN "emergencyContact" DROP NOT NULL,
ALTER COLUMN "pinCode" DROP NOT NULL,
ALTER COLUMN "trainingStatus" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Leave" DROP COLUMN "reason",
DROP COLUMN "status",
DROP COLUMN "type",
ADD COLUMN     "approvalStatus" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "leaveReason" TEXT NOT NULL,
ADD COLUMN     "leaveType" "LeaveType" NOT NULL,
ADD COLUMN     "totalDays" INTEGER NOT NULL;

-- DropTable
DROP TABLE "State";

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "allowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "incentive" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advancePayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attendanceId" INTEGER,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "trainingId" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "trainerType" "TrainerType" NOT NULL,
    "trainerName" VARCHAR(100) NOT NULL,
    "mode" "TrainingMode" NOT NULL,
    "trainingTopic" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "certificate" "CertificateStatus" NOT NULL,
    "departmentId" INTEGER,
    "departmentName" TEXT,
    "managerId" INTEGER,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("trainingId")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "task" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserRoles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RolePermissions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RolePermissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Training_employeeId_idx" ON "Training"("employeeId");

-- CreateIndex
CREATE INDEX "Training_departmentId_idx" ON "Training"("departmentId");

-- CreateIndex
CREATE INDEX "Training_managerId_idx" ON "Training"("managerId");

-- CreateIndex
CREATE INDEX "_UserRoles_B_index" ON "_UserRoles"("B");

-- CreateIndex
CREATE INDEX "_RolePermissions_B_index" ON "_RolePermissions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_employeeId_attendanceDate_key" ON "Attendance"("employeeId", "attendanceDate");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
