-- CreateTable
CREATE TABLE "contas" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash_da_senha" TEXT NOT NULL,
    "criada_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" TEXT NOT NULL,
    "titular_id" TEXT NOT NULL,
    "hash_do_refresh" TEXT NOT NULL,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "revogado_em" TIMESTAMPTZ(3),

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contas_email_key" ON "contas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_hash_do_refresh_key" ON "sessoes"("hash_do_refresh");

-- CreateIndex
CREATE INDEX "sessoes_titular_id_idx" ON "sessoes"("titular_id");
