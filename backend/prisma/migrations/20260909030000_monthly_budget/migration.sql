-- HN-006 (RF-013, RN-002): limite mensal por titular, mês e categoria.
-- A ausência de linha é o estado "sem limite"; zero é um limite de verdade.
CREATE TABLE "monthly_budgets" (
    "holder_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "limit_in_cents" INTEGER NOT NULL,
    CONSTRAINT "monthly_budgets_pkey" PRIMARY KEY ("holder_id","month","category")
);
