-- DropForeignKey
ALTER TABLE "DepTeam" DROP CONSTRAINT "DepTeam_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_leaderId_fkey";

-- DropIndex
DROP INDEX "ChurchTeam_name_key";

-- DropIndex
DROP INDEX "Community_name_key";

-- DropIndex
DROP INDEX "District_name_key";
