CREATE TABLE "test"."refresh_tokens" (
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("token_hash")
);

CREATE INDEX "refresh_tokens_expires_at_idx" ON "test"."refresh_tokens"("expires_at");
