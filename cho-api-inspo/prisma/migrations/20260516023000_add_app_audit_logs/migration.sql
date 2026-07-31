CREATE TYPE "AppActorType" AS ENUM ('USER', 'VENDOR', 'RIDER');

CREATE TABLE "app_audit_logs" (
  "id" BIGSERIAL NOT NULL,
  "actor_type" "AppActorType" NOT NULL,
  "actor_id" BIGINT NOT NULL,
  "action" VARCHAR(120) NOT NULL,
  "target_type" VARCHAR(80) NOT NULL,
  "target_id" VARCHAR(80),
  "method" VARCHAR(10) NOT NULL,
  "path" VARCHAR(500) NOT NULL,
  "status_code" INTEGER NOT NULL,
  "meta" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "app_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "app_audit_logs_actor_type_actor_id_idx" ON "app_audit_logs"("actor_type", "actor_id");
CREATE INDEX "app_audit_logs_target_type_target_id_idx" ON "app_audit_logs"("target_type", "target_id");
CREATE INDEX "app_audit_logs_action_idx" ON "app_audit_logs"("action");
CREATE INDEX "app_audit_logs_created_at_idx" ON "app_audit_logs"("created_at");
