-- Rename physical tables to English (HT-020 follow-up): the models were already
-- English; the tables kept the old Portuguese names via @@map. Renaming them
-- keeps code and database consistent. Data is preserved (ALTER TABLE RENAME).
ALTER TABLE "lancamentos" RENAME TO "transactions";
ALTER TABLE "contas_externas" RENAME TO "external_accounts";
ALTER TABLE "contas" RENAME TO "accounts";
ALTER TABLE "sessoes" RENAME TO "sessions";
