import { z } from 'zod';

const projectSummarySchema = z.object({
  id: z.string().uuid(),
  userID: z.string().uuid(),
  userName: z.string().optional(),
  name: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  isPublic: z.boolean(),
  type: z.enum(['project', 'template']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const layerObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  visible: z.boolean(),
  locked: z.boolean(),
});

const layerSchema = z.object({
  id: z.string(),
  name: z.string(),
  visible: z.boolean(),
  locked: z.boolean(),
  opacity: z.number(),
  objects: z.array(layerObjectSchema),
  collapsed: z.boolean(),
});

const projectDetailSchema = projectSummarySchema.extend({
  canvasJSON: z.record(z.string(), z.unknown()).nullable(),
  layersJSON: z.array(layerSchema).nullable(),
});

const projectsListResponseSchema = z.array(projectSummarySchema);

const createProjectRequestSchema = z.object({
  name: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const saveCanvasRequestSchema = z.object({
  canvasJSON: z.record(z.string(), z.unknown()),
  layersJSON: z.array(layerSchema),
});

type ProjectSummary = z.infer<typeof projectSummarySchema>;
type ProjectDetail = z.infer<typeof projectDetailSchema>;
type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;
type SaveCanvasRequest = z.infer<typeof saveCanvasRequestSchema>;

export {
  projectSummarySchema,
  projectDetailSchema,
  projectsListResponseSchema,
  createProjectRequestSchema,
  saveCanvasRequestSchema,
};
export type { ProjectSummary, ProjectDetail, CreateProjectRequest, SaveCanvasRequest };
