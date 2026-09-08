-- AlterTable
ALTER TABLE "lancamentos" ADD COLUMN     "identificador_externo" TEXT;

-- CreateTable
CREATE TABLE "contas_externas" (
    "id" TEXT NOT NULL,
    "titular_id" TEXT NOT NULL,
    "identificador_externo" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "saldo_em_centavos" INTEGER NOT NULL,

    CONSTRAINT "contas_externas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contas_externas_titular_id_idx" ON "contas_externas"("titular_id");

-- CreateIndex
CREATE INDEX "lancamentos_titular_id_identificador_externo_idx" ON "lancamentos"("titular_id", "identificador_externo");
