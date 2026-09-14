-- HN-007: budget band-crossing alert (RN-005) — one per band per category per month.
CREATE TABLE "budget_alerts" (
  "id" TEXT NOT NULL,
  "holder_id" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "band" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "budget_alerts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "budget_alerts_holder_month_idx" ON "budget_alerts"("holder_id","month");
