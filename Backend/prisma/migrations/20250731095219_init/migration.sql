/*
  Warnings:

  - You are about to drop the column `email` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Employee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `designation` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyContact` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeType` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `joiningDate` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pinCode` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stateId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trainingStatus` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'RESIGNED', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'NOT_STARTED', 'REQUIRED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY');

-- DropIndex
DROP INDEX "Employee_email_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "role",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "departmentId" INTEGER NOT NULL,
ADD COLUMN     "designation" TEXT NOT NULL,
ADD COLUMN     "emergencyContact" TEXT NOT NULL,
ADD COLUMN     "employeeType" "EmployeeType" NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "joiningDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pinCode" TEXT NOT NULL,
ADD COLUMN     "stateId" INTEGER NOT NULL,
ADD COLUMN     "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "trainingStatus" "TrainingStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leave" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "LeaveType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
