import { z } from 'zod';

const versionSchema = z.object({
  id: z.string().uuid(),
  designID: z.string().uuid(),
  label: z.string().nullable(),
  createdAt: z.string(),
});

const versionDetailSchema = versionSchema.extend({
  canvasJSON: z.unknown(),
  layersJSON: z.unknown(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const versionsListResponseSchema = z.array(versionSchema);

type Version = z.infer<typeof versionSchema>;
type VersionDetail = z.infer<typeof versionDetailSchema>;

export { versionSchema, versionDetailSchema, versionsListResponseSchema };
export type { Version, VersionDetail };
