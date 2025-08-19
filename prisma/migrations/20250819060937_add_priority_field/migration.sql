-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "public"."Todo" ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM';
