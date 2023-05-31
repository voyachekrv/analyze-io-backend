-- CreateTable
CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "avatar" VARCHAR(512),
    "managerId" INTEGER NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalystsOnShop" (
    "shopId" INTEGER NOT NULL,
    "analystId" INTEGER NOT NULL,

    CONSTRAINT "AnalystsOnShop_pkey" PRIMARY KEY ("shopId","analystId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_uuid_key" ON "Shop"("uuid");

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalystsOnShop" ADD CONSTRAINT "AnalystsOnShop_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalystsOnShop" ADD CONSTRAINT "AnalystsOnShop_analystId_fkey" FOREIGN KEY ("analystId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
