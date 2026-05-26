import { z } from 'zod';
import {
  projectDetailSchema,
  projectsListResponseSchema,
  sharedDesignSchema,
  type ProjectDetail,
  type ProjectSummary,
  type SharedDesign,
  type CreateProjectRequest,
  type SaveCanvasRequest,
} from '@/features/projects/schema';
import { getAccessToken, setAccessToken, clearAccessToken } from '@/features/auth/token';
import { queryClient } from '@/shared/lib/query-client';
import { userQueryKey } from '@/features/auth/query-keys';
import { createApiClient } from '@/shared/lib/api-client';

const refreshResponseSchema = z.object({ accessToken: z.string() });
const shareTokenResponseSchema = z.object({ shareToken: z.string().uuid() });

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
  forkAsProject: async (id: string, token?: string): Promise<ProjectDetail> => {
    const path = token
      ? `/projects/${id}/fork?token=${encodeURIComponent(token)}`
      : `/projects/${id}/fork`;
    const data = await apiClient.post(path, undefined);
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
  createShareToken: async (id: string): Promise<{ shareToken: string }> => {
    const data = await apiClient.post(`/designs/${id}/share`, undefined);
    return shareTokenResponseSchema.parse(data);
  },
  revokeShareToken: async (id: string): Promise<void> => {
    await apiClient.delete(`/designs/${id}/share`);
  },
  getSharedDesign: async (token: string): Promise<SharedDesign> => {
    const data = await apiClient.get(`/shared/designs/${token}`);
    return sharedDesignSchema.parse(data);
  },
};

export { api, apiClient };
