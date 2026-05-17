ALTER TABLE "users"
ADD COLUMN "auth_provider" TEXT NOT NULL DEFAULT 'password',
ADD COLUMN "provider_id" TEXT,
ADD COLUMN "avatar_url" TEXT,
ADD COLUMN "oauth_enabled" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "users_provider_id_key" ON "users"("provider_id");
