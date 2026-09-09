-- HT-013: teto diário de IA por titular (RNF-009) e cache de conselho (RNF-010).
CREATE TABLE "ai_daily_usage" (
    "holder_id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "calls" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ai_daily_usage_pkey" PRIMARY KEY ("holder_id","day")
);

CREATE TABLE "ai_advice_cache" (
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_advice_cache_pkey" PRIMARY KEY ("key")
);
