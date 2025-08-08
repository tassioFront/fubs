/*
  Warnings:

  - The values [ADMIN,MEMBER] on the enum `WorkspaceMemberRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WorkspaceMemberRole_new" AS ENUM ('admin', 'member', 'owner');
ALTER TABLE "workspace_members" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "workspace_members" ALTER COLUMN "role" TYPE "WorkspaceMemberRole_new" USING ("role"::text::"WorkspaceMemberRole_new");
ALTER TYPE "WorkspaceMemberRole" RENAME TO "WorkspaceMemberRole_old";
ALTER TYPE "WorkspaceMemberRole_new" RENAME TO "WorkspaceMemberRole";
DROP TYPE "WorkspaceMemberRole_old";
ALTER TABLE "workspace_members" ALTER COLUMN "role" SET DEFAULT 'member';
COMMIT;

-- AlterTable
ALTER TABLE "workspace_members" ALTER COLUMN "role" SET DEFAULT 'member';
