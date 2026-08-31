-- AlterTable
ALTER TABLE "Build" ADD COLUMN     "encryptionUsed" BOOLEAN,
ADD COLUMN     "minOsVersion" TEXT;

-- CreateTable
CREATE TABLE "BuildGroup" (
    "buildId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "BuildGroup_pkey" PRIMARY KEY ("buildId","groupId")
);

-- AddForeignKey
ALTER TABLE "BuildGroup" ADD CONSTRAINT "BuildGroup_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildGroup" ADD CONSTRAINT "BuildGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BetaGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
