/*
  Warnings:

  - Added the required column `titular_id` to the `lancamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lancamentos" ADD COLUMN     "titular_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "lancamentos_titular_id_idx" ON "lancamentos"("titular_id");
