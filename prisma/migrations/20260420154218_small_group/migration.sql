-- CreateTable
CREATE TABLE "SmallGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "description" TEXT,
    "leaderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmallGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserDepTeams" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserDepTeams_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserSmallGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserSmallGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserDepTeams_B_index" ON "_UserDepTeams"("B");

-- CreateIndex
CREATE INDEX "_UserSmallGroups_B_index" ON "_UserSmallGroups"("B");

-- AddForeignKey
ALTER TABLE "SmallGroup" ADD CONSTRAINT "SmallGroup_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserDepTeams" ADD CONSTRAINT "_UserDepTeams_A_fkey" FOREIGN KEY ("A") REFERENCES "DepTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserDepTeams" ADD CONSTRAINT "_UserDepTeams_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSmallGroups" ADD CONSTRAINT "_UserSmallGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "SmallGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSmallGroups" ADD CONSTRAINT "_UserSmallGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
