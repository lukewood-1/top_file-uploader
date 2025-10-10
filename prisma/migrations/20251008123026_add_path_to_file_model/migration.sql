/*
  Warnings:

  - Added the required column `donwloadLink` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "donwloadLink" VARCHAR(255) NOT NULL;
