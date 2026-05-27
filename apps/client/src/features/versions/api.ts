import {
  versionDetailSchema,
  versionsListResponseSchema,
  type Version,
  type VersionDetail,
} from '@/features/versions/schema';
import { apiClient } from '@/features/projects/api';

type SaveCheckpointBody = {
  label: string | null;
  canvasJSON: unknown;
  layersJSON: unknown;
  width: number;
  height: number;
};

type UpdateCheckpointBody = {
  label: string | null;
};

const api = {
  listVersions: async (designId: string): Promise<Version[]> => {
    const data = await apiClient.get(`/designs/${designId}/checkpoints`);
    return versionsListResponseSchema.parse(data);
  },
  getVersion: async (designId: string, versionId: string): Promise<VersionDetail> => {
    const data = await apiClient.get(`/designs/${designId}/checkpoints/${versionId}`);
    return versionDetailSchema.parse(data);
  },
  saveVersion: async (designId: string, body: SaveCheckpointBody): Promise<VersionDetail> => {
    const data = await apiClient.post(`/designs/${designId}/checkpoints`, body);
    return versionDetailSchema.parse(data);
  },
  renameVersion: async (
    designId: string,
    versionId: string,
    body: UpdateCheckpointBody,
  ): Promise<VersionDetail> => {
    const data = await apiClient.patch(`/designs/${designId}/checkpoints/${versionId}`, body);
    return versionDetailSchema.parse(data);
  },
  deleteVersion: async (designId: string, versionId: string): Promise<void> => {
    await apiClient.delete(`/designs/${designId}/checkpoints/${versionId}`);
  },
  restoreVersion: async (designId: string, versionId: string): Promise<void> => {
    await apiClient.post(`/designs/${designId}/checkpoints/${versionId}/restore`, undefined);
  },
};

export { api };
export type { SaveCheckpointBody, UpdateCheckpointBody };
