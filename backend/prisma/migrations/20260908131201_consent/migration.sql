-- CreateTable
CREATE TABLE "consents" (
    "id" TEXT NOT NULL,
    "titular_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "credential_cipher" TEXT NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "revogado_em" TIMESTAMPTZ(3),
    "ultima_sincronizacao_em" TIMESTAMPTZ(3),

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consents_titular_id_idx" ON "consents"("titular_id");
