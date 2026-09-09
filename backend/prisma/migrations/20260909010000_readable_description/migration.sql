-- HN-004 (RF-010, RN-010): descrição legível derivada. A coluna é nova e
-- opcional; "description" continua sendo o texto do agregador, intocado.
ALTER TABLE "transactions" ADD COLUMN "readable_description" TEXT;
