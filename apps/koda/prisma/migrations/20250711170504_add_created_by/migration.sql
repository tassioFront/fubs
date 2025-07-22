-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "createdBy" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
