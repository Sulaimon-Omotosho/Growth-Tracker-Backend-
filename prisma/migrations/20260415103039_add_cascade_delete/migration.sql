/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ChurchTeam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Community` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `District` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DepTeam" DROP CONSTRAINT "DepTeam_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_leaderId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "ChurchTeam_name_key" ON "ChurchTeam"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_key" ON "Community"("name");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_key" ON "District"("name");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepTeam" ADD CONSTRAINT "DepTeam_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
