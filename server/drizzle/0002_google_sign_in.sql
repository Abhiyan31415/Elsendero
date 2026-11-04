ALTER TABLE "users" ADD COLUMN "google_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_id_idx" ON "users" USING btree ("google_id");--> statement-breakpoint
-- Drop the random stock photos new accounts used to get; the app shows the user's initial instead.
UPDATE "users" SET "photo_url" = '' WHERE "photo_url" LIKE 'https://randomuser.me/%';--> statement-breakpoint
UPDATE "trails" SET "u_photo" = '' WHERE "u_photo" LIKE 'https://randomuser.me/%';
