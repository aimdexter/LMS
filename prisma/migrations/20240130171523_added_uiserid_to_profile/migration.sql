/*
  Warnings:

  - Added the required column `userId` to the `Profil` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profil" ADD COLUMN     "userId" TEXT NOT NULL;
