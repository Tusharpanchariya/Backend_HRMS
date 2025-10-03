/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Profile` table. All the data in the column will be lost.
  - Added the required column `category` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Made the column `industry` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fullName` on table `Profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `Profile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Company_domain_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "category" TEXT NOT NULL,
ALTER COLUMN "industry" SET NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "companyDomain" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companySize" TEXT,
ALTER COLUMN "fullName" SET NOT NULL,
ALTER COLUMN "role" SET NOT NULL;
