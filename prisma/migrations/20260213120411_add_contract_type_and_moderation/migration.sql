-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "contractType" TEXT NOT NULL DEFAULT 'Alternance',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Job_contractType_idx" ON "Job"("contractType");

-- CreateIndex
CREATE INDEX "Job_isActive_idx" ON "Job"("isActive");
