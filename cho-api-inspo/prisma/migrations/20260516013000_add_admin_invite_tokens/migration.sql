CREATE TABLE "admin_invite_tokens" (
  "id" BIGSERIAL NOT NULL,
  "admin_id" BIGINT NOT NULL,
  "token_hash" VARCHAR(64) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "admin_invite_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_invite_tokens_token_hash_key" ON "admin_invite_tokens"("token_hash");
CREATE INDEX "admin_invite_tokens_admin_id_idx" ON "admin_invite_tokens"("admin_id");
CREATE INDEX "admin_invite_tokens_expires_at_idx" ON "admin_invite_tokens"("expires_at");

ALTER TABLE "admin_invite_tokens"
  ADD CONSTRAINT "admin_invite_tokens_admin_id_fkey"
  FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
