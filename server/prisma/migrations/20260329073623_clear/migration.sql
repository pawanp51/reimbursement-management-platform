/*
  Warnings:

  - You are about to drop the `Approval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reimbursement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_reimbursementId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_reimbursementId_fkey";

-- DropForeignKey
ALTER TABLE "Reimbursement" DROP CONSTRAINT "Reimbursement_userId_fkey";

-- DropTable
DROP TABLE "Approval";

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "Reimbursement";
