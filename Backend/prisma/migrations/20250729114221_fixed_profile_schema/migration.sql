/*
  Warnings:

  - You are about to drop the column `companyDomain` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `companySize` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "companyDomain",
DROP COLUMN "companyName",
DROP COLUMN "companySize";
