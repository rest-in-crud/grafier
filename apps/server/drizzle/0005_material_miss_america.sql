CREATE TYPE "public"."design_type" AS ENUM('project', 'template');--> statement-breakpoint
ALTER TABLE "project_history" RENAME TO "design_history";--> statement-breakpoint
ALTER TABLE "projects" RENAME TO "designs";--> statement-breakpoint
ALTER TABLE "design_history" RENAME COLUMN "project_id" TO "design_id";--> statement-breakpoint
ALTER TABLE "designs" DROP CONSTRAINT "projects_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "design_history" DROP CONSTRAINT "project_history_project_id_projects_id_fk";
--> statement-breakpoint
DROP INDEX "projects_user_id_idx";--> statement-breakpoint
DROP INDEX "history_project_id_idx";--> statement-breakpoint
DROP INDEX "history_project_created_idx";--> statement-breakpoint
ALTER TABLE "designs" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "designs" ADD COLUMN "type" "design_type" DEFAULT 'project' NOT NULL;--> statement-breakpoint
ALTER TABLE "designs" ADD CONSTRAINT "designs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_history" ADD CONSTRAINT "design_history_design_id_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."designs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "designs_user_id_idx" ON "designs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "history_design_id_idx" ON "design_history" USING btree ("design_id");--> statement-breakpoint
CREATE INDEX "history_design_created_idx" ON "design_history" USING btree ("design_id","created_at");