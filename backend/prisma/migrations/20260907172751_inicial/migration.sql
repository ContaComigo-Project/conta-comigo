-- CreateTable
CREATE TABLE "lancamentos" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor_em_centavos" INTEGER NOT NULL,
    "data_de_competencia" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id")
);
