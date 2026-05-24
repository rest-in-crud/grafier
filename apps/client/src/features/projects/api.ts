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
  listMyProjects: async (userId: string): Promise<ProjectSummary[]> => {
    const data = await apiClient.get(`/users/${userId}/projects`);
    return projectsListResponseSchema.parse(data);
  },
  listMyTemplates: async (userId: string): Promise<ProjectSummary[]> => {
    const data = await apiClient.get(`/users/${userId}/templates`);
    return projectsListResponseSchema.parse(data);
  },
  listPublicTemplates: async (): Promise<ProjectSummary[]> => {
    const data = await apiClient.get('/templates');
    return projectsListResponseSchema.parse(data);
  },
  listCommunityProjects: async (): Promise<ProjectSummary[]> => {
    const data = await apiClient.get('/projects');
    return projectsListResponseSchema.parse(data);
  },
  get: async (id: string): Promise<ProjectDetail> => {
    const data = await apiClient.get(`/designs/${id}`);
    return projectDetailSchema.parse(data);
  },
  create: async (body: CreateProjectRequest): Promise<ProjectDetail> => {
    const data = await apiClient.post('/designs', body);
    return projectDetailSchema.parse(data);
  },
  saveCanvas: async (id: string, body: SaveCanvasRequest): Promise<ProjectDetail> => {
    const data = await apiClient.post(`/designs/${id}/canvas`, body);
    return projectDetailSchema.parse(data);
  },
  forkAsProject: async (id: string): Promise<ProjectDetail> => {
    const data = await apiClient.post(`/projects/${id}/fork`, undefined);
    return projectDetailSchema.parse(data);
  },
  forkAsTemplate: async (id: string): Promise<ProjectDetail> => {
    const data = await apiClient.post(`/templates/${id}/fork`, undefined);
    return projectDetailSchema.parse(data);
  },
  setVisibility: async (id: string, isPublic: boolean): Promise<ProjectDetail> => {
    const data = await apiClient.patch(`/designs/${id}`, { isPublic });
    return projectDetailSchema.parse(data);
  },
};

export { api };
