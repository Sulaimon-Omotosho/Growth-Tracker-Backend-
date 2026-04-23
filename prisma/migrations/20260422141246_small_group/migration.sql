/*
  Warnings:

  - You are about to drop the column `interest` on the `SmallGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SmallGroup" DROP COLUMN "interest";

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupToInterest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupToInterest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interest_name_key" ON "Interest"("name");

-- CreateIndex
CREATE INDEX "_GroupToInterest_B_index" ON "_GroupToInterest"("B");

-- AddForeignKey
ALTER TABLE "_GroupToInterest" ADD CONSTRAINT "_GroupToInterest_A_fkey" FOREIGN KEY ("A") REFERENCES "Interest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToInterest" ADD CONSTRAINT "_GroupToInterest_B_fkey" FOREIGN KEY ("B") REFERENCES "SmallGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
