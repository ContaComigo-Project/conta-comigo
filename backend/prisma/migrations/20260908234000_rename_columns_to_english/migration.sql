-- Rename physical columns to English (HT-020 follow-up): models and tables
-- are already English; the columns kept Portuguese names via @map. Data preserved.
ALTER TABLE "transactions" RENAME COLUMN "titular_id" TO "holder_id";
ALTER TABLE "transactions" RENAME COLUMN "descricao" TO "description";
ALTER TABLE "transactions" RENAME COLUMN "valor_em_centavos" TO "amount_in_cents";
ALTER TABLE "transactions" RENAME COLUMN "data_de_competencia" TO "due_date";
ALTER TABLE "transactions" RENAME COLUMN "identificador_externo" TO "external_id";
ALTER TABLE "external_accounts" RENAME COLUMN "titular_id" TO "holder_id";
ALTER TABLE "external_accounts" RENAME COLUMN "identificador_externo" TO "external_id";
ALTER TABLE "external_accounts" RENAME COLUMN "tipo" TO "type";
ALTER TABLE "external_accounts" RENAME COLUMN "saldo_em_centavos" TO "balance_in_cents";
ALTER TABLE "accounts" RENAME COLUMN "hash_da_senha" TO "password_hash";
ALTER TABLE "accounts" RENAME COLUMN "criada_em" TO "created_at";
ALTER TABLE "sessions" RENAME COLUMN "titular_id" TO "holder_id";
ALTER TABLE "sessions" RENAME COLUMN "hash_do_refresh" TO "refresh_token_hash";
ALTER TABLE "sessions" RENAME COLUMN "expira_em" TO "expires_at";
ALTER TABLE "sessions" RENAME COLUMN "revogado_em" TO "revoked_at";
ALTER TABLE "consents" RENAME COLUMN "titular_id" TO "holder_id";
ALTER TABLE "consents" RENAME COLUMN "criada_em" TO "created_at";
ALTER TABLE "consents" RENAME COLUMN "expira_em" TO "expires_at";
ALTER TABLE "consents" RENAME COLUMN "revogado_em" TO "revoked_at";
ALTER TABLE "consents" RENAME COLUMN "exclusao_agendada_em" TO "deletion_scheduled_at";
ALTER TABLE "consents" RENAME COLUMN "ultima_sincronizacao_em" TO "last_sync_at";
