-- CreateTable
CREATE TABLE "app_versions" (
    "id" SERIAL NOT NULL,
    "app" VARCHAR(20) NOT NULL,
    "platform" VARCHAR(10) NOT NULL,
    "latest_version" VARCHAR(20) NOT NULL,
    "minimum_version" VARCHAR(20) NOT NULL,
    "store_url" VARCHAR(500) NOT NULL,
    "update_message" VARCHAR(500) NOT NULL DEFAULT 'A new version is available. Please update for the best experience.',
    "force_message" VARCHAR(500) NOT NULL DEFAULT 'This version is no longer supported. Please update to continue.',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_versions_app_platform_key" ON "app_versions"("app", "platform");
