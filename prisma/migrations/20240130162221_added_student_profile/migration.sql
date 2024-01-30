-- CreateTable
CREATE TABLE "Profil" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "studies" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Profil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Profil_categoryId_idx" ON "Profil"("categoryId");
