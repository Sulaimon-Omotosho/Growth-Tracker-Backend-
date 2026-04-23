/*
  Warnings:

  - A unique constraint covering the columns `[name,districtId]` on the table `Community` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cell" ADD COLUMN     "addressId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_districtId_key" ON "Community"("name", "districtId");

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
