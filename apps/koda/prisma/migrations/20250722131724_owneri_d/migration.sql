/*
  Warnings:

  - Added the required column `ownerId` to the `workspaces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "ownerId" TEXT NOT NULL;
