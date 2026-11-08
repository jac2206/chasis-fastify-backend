-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "test";

-- CreateEnum
CREATE TYPE "test"."document_type" AS ENUM ('CC', 'CE', 'NIT', 'PT');

-- CreateTable
CREATE TABLE "test"."addresses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test"."users" (
    "id" UUID NOT NULL,
    "document_number" VARCHAR(50) NOT NULL,
    "document_type" "test"."document_type" NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" TEXT NOT NULL,
    "has_pin" BOOLEAN NOT NULL DEFAULT false,
    "pin_hash" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_document_number_key" ON "test"."users"("document_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "test"."users"("email");

-- AddForeignKey
ALTER TABLE "test"."addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "test"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
