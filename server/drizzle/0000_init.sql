CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"photo_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trails" (
	"id" serial PRIMARY KEY NOT NULL,
	"sloc" jsonb NOT NULL,
	"floc" jsonb NOT NULL,
	"checkp" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"price" numeric DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"difficulty" double precision,
	"uid" text NOT NULL,
	"u_name" text NOT NULL,
	"u_photo" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"from_date" timestamp with time zone NOT NULL,
	"to_date" timestamp with time zone NOT NULL,
	"location" text NOT NULL,
	"participants" text[] DEFAULT '{}' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Upgrade databases created by the pre-v1 server/db/schema.sql (no-ops on a fresh database).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "created_by" text;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'messages' AND column_name = 'timestamp')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'messages' AND column_name = 'created_at') THEN
    ALTER TABLE "messages" RENAME COLUMN "timestamp" TO "created_at";
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS "messages_event_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_lower_idx" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trails_uid_idx" ON "trails" USING btree ("uid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trails_created_at_idx" ON "trails" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_from_date_idx" ON "events" USING btree ("from_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_event_created_idx" ON "messages" USING btree ("event_id","created_at");