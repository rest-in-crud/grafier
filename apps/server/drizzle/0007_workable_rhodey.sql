ALTER TABLE "designs" ADD COLUMN "share_token" uuid;--> statement-breakpoint
ALTER TABLE "designs" ADD CONSTRAINT "designs_share_token_unique" UNIQUE("share_token");