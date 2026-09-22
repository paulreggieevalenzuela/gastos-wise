CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verification_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
-- "username" is added nullable, backfilled, then locked to NOT NULL — a
-- plain "ADD COLUMN ... NOT NULL" would fail outright against a users
-- table that already has rows (e.g. the seeded mock account).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" text;
--> statement-breakpoint
UPDATE "users" SET "username" = "email" WHERE "username" IS NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp;
--> statement-breakpoint
-- Grandfather in any account created before this migration (there is no
-- confirmation email to click for those) so nobody is locked out.
UPDATE "users" SET "email_verified_at" = now() WHERE "email_verified_at" IS NULL;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_verification_tokens_user_id_idx" ON "email_verification_tokens" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
