import { z } from 'zod';
import {
  projectDetailSchema,
  projectsListResponseSchema,
  type ProjectDetail,
  type ProjectSummary,
  type CreateProjectRequest,
  type SaveCanvasRequest,
} from '@/features/projects/schema';
import { getAccessToken, setAccessToken, clearAccessToken } from '@/features/auth/token';
import { queryClient } from '@/shared/lib/query-client';
import { userQueryKey } from '@/features/auth/query-keys';
import { createApiClient } from '@/shared/lib/api-client';

const refreshResponseSchema = z.object({ accessToken: z.string() });

const apiClient = createApiClient({
  baseUrl: import.meta.env.VITE_URL_BACKEND ?? '/api',
  getToken: getAccessToken,
  onRefresh: async () => {
    const data = await apiClient.post('/auth/refresh', undefined, { skipAuthRefresh: true });
    const { accessToken } = refreshResponseSchema.parse(data);
    setAccessToken(accessToken);
  },
  onUnauthorized: () => {
    clearAccessToken();
    queryClient.setQueryData(userQueryKey, null);
  },
});

const api = {
  list: async (): Promise<ProjectSummary[]> => {
    const data = await apiClient.get('/projects');
    return projectsListResponseSchema.parse(data);
  },
  get: async (id: string): Promise<ProjectDetail> => {
    const data = await apiClient.get(`/projects/${id}`);
    return projectDetailSchema.parse(data);
  },
  create: async (body: CreateProjectRequest): Promise<ProjectDetail> => {
    const data = await apiClient.post('/projects', body);
    return projectDetailSchema.parse(data);
  },
  saveCanvas: async (id: string, body: SaveCanvasRequest): Promise<ProjectDetail> => {
    const data = await apiClient.put(`/projects/${id}/canvas`, body);
    return projectDetailSchema.parse(data);
  },
};

export { api };
