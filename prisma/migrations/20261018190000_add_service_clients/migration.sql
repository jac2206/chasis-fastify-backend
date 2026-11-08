-- CreateTable
CREATE TABLE "test"."service_clients" (
    "id" UUID NOT NULL,
    "client_id" VARCHAR(100) NOT NULL,
    "client_secret_hash" TEXT NOT NULL,
    "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "service_clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_clients_client_id_key" ON "test"."service_clients"("client_id");
