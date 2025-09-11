/*
  Warnings:

  - Added the required column `updateAt` to the `auth_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `pre_registered_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `tracks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."auth_tokens" ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."pre_registered_users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."sessions" ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."tracks" ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."votes" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;
