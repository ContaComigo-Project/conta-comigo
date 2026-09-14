-- AlterTable
ALTER TABLE "accounts" RENAME CONSTRAINT "contas_pkey" TO "accounts_pkey";

-- AlterTable
ALTER TABLE "external_accounts" RENAME CONSTRAINT "contas_externas_pkey" TO "external_accounts_pkey";

-- AlterTable
ALTER TABLE "sessions" RENAME CONSTRAINT "sessoes_pkey" TO "sessions_pkey";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "institution_id" TEXT;
ALTER TABLE "transactions" RENAME CONSTRAINT "lancamentos_pkey" TO "transactions_pkey";

-- RenameIndex
ALTER INDEX "contas_email_key" RENAME TO "accounts_email_key";

-- RenameIndex
ALTER INDEX "budget_alerts_holder_month_idx" RENAME TO "budget_alerts_holder_id_month_idx";

-- RenameIndex
ALTER INDEX "consents_titular_id_idx" RENAME TO "consents_holder_id_idx";

-- RenameIndex
ALTER INDEX "contas_externas_titular_id_idx" RENAME TO "external_accounts_holder_id_idx";

-- RenameIndex
ALTER INDEX "sessoes_hash_do_refresh_key" RENAME TO "sessions_refresh_token_hash_key";

-- RenameIndex
ALTER INDEX "sessoes_titular_id_idx" RENAME TO "sessions_holder_id_idx";

-- RenameIndex
ALTER INDEX "lancamentos_titular_id_identificador_externo_idx" RENAME TO "transactions_holder_id_external_id_idx";

-- RenameIndex
ALTER INDEX "lancamentos_titular_id_idx" RENAME TO "transactions_holder_id_idx";
