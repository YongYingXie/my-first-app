/*
  Warnings:

  - You are about to drop the column `priority` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Todo" DROP COLUMN "priority";

-- DropEnum
DROP TYPE "public"."Priority";
