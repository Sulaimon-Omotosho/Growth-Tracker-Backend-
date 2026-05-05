-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('ONBOARDING', 'EXTENDED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "OnboardingRoom" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT,
    "cellId" TEXT,

    CONSTRAINT "OnboardingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingParticipant" (
    "id" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedEndDate" TIMESTAMP(3) NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'ONBOARDING',
    "extensionWeeks" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "onboardingRoomId" TEXT NOT NULL,

    CONSTRAINT "OnboardingParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRoom_departmentId_key" ON "OnboardingRoom"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRoom_cellId_key" ON "OnboardingRoom"("cellId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingParticipant_userId_onboardingRoomId_key" ON "OnboardingParticipant"("userId", "onboardingRoomId");

-- AddForeignKey
ALTER TABLE "OnboardingRoom" ADD CONSTRAINT "OnboardingRoom_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingRoom" ADD CONSTRAINT "OnboardingRoom_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingParticipant" ADD CONSTRAINT "OnboardingParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingParticipant" ADD CONSTRAINT "OnboardingParticipant_onboardingRoomId_fkey" FOREIGN KEY ("onboardingRoomId") REFERENCES "OnboardingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
