-- HN-005 (RF-011, RF-012, RN-011): categoria do lançamento e quem a definiu.
-- A origem existe para que a correção manual sobreviva à próxima sincronização.
ALTER TABLE "transactions" ADD COLUMN "category" TEXT;
ALTER TABLE "transactions" ADD COLUMN "category_origin" TEXT;
