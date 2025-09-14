/*
  Warnings:

  - The `deleted_at` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `deleted_at`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL;
