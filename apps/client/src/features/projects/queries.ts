import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/features/projects/api';
import { designsKeys } from '@/features/projects/query-keys';
import type { ProjectDetail, ProjectSummary, SaveCanvasRequest } from '@/features/projects/schema';
import { useUser } from '@/features/auth/queries';
import { HttpError } from '@/shared/lib/api-client';

const isPermanentSaveFailure = (error: unknown): boolean => {
  if (!(error instanceof HttpError)) return false;
  return error.status === 404 || error.status === 403 || error.status === 413;
};

const useMyProjects = () => {
  const { user } = useUser();
  return useQuery({
    queryKey: designsKeys.myProjects(),
    queryFn: () => api.listMyProjects(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });
};

const useMyTemplates = () => {
  const { user } = useUser();
  return useQuery({
    queryKey: designsKeys.myTemplates(),
    queryFn: () => api.listMyTemplates(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });
};

const usePublicTemplates = () =>
  useQuery({
    queryKey: designsKeys.publicTemplates(),
    queryFn: () => api.listPublicTemplates(),
  });

const useAllTemplates = () => {
  const mine = useMyTemplates();
  const pub = usePublicTemplates();
  const isPending = mine.isPending || pub.isPending;
  const merged: ProjectSummary[] = [];
  if (!isPending) {
    const map = new Map<string, ProjectSummary>();
    for (const row of pub.data ?? []) map.set(row.id, row);
    for (const row of mine.data ?? []) map.set(row.id, row);
    merged.push(...map.values());
    merged.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }
  return { data: isPending ? undefined : merged, isPending };
};

const useCommunityProjects = () =>
  useQuery({
    queryKey: designsKeys.community(),
    queryFn: () => api.listCommunityProjects(),
  });

const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: designsKeys.detail(id),
    queryFn: () => api.get(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

const useProject = (id: string) => useQuery(projectQueryOptions(id));

const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, width, height }: { name: string; width?: number; height?: number }) =>
      api.create({ name, width, height, type: 'project' }),
    onSuccess: (created: ProjectDetail) => {
      queryClient.setQueryData(designsKeys.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: designsKeys.myProjects() });
    },
  });
};

const useSaveCanvas = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...designsKeys.detail(projectId), 'save-canvas'],
    mutationFn: (body: SaveCanvasRequest) => api.saveCanvas(projectId, body),
    onSuccess: (saved: ProjectDetail) => {
      queryClient.setQueryData(designsKeys.detail(projectId), saved);
    },
    retry: (failureCount, error) => {
      if (isPermanentSaveFailure(error)) return false;
      return failureCount < 3;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  });
};

const useForkAsProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) => api.forkAsProject(id, token),
    onSuccess: (created: ProjectDetail) => {
      queryClient.setQueryData(designsKeys.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: designsKeys.myProjects() });
    },
  });
};

const useForkAsTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => api.forkAsTemplate(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: designsKeys.myTemplates() });
    },
  });
};

const useSetVisibility = (designId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isPublic: boolean) => api.setVisibility(designId, isPublic),
    onSuccess: (updated: ProjectDetail) => {
      queryClient.setQueryData(designsKeys.detail(designId), updated);
      if (updated.type === 'project') {
        queryClient.invalidateQueries({ queryKey: designsKeys.community() });
      } else {
        queryClient.invalidateQueries({ queryKey: designsKeys.publicTemplates() });
      }
    },
  });
};

const useRenameProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.updateName(id, name),
    onSuccess: (updated: ProjectDetail) => {
      queryClient.setQueryData(designsKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: designsKeys.all });
    },
  });
};

const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.remove(id),
    onSuccess: (_void, id) => {
      queryClient.removeQueries({ queryKey: designsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: designsKeys.all });
    },
  });
};

const useCreateShareToken = (designId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.createShareToken(designId),
    onSuccess: ({ shareToken }) => {
      queryClient.setQueryData<ProjectDetail | undefined>(designsKeys.detail(designId), (prev) =>
        prev ? { ...prev, shareToken } : prev,
      );
    },
  });
};

const useRevokeShareToken = (designId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.revokeShareToken(designId),
    onSuccess: () => {
      queryClient.setQueryData<ProjectDetail | undefined>(designsKeys.detail(designId), (prev) =>
        prev ? { ...prev, shareToken: null } : prev,
      );
    },
  });
};

const useSharedDesign = (token: string) =>
  useQuery({
    queryKey: designsKeys.shared(token),
    queryFn: () => api.getSharedDesign(token),
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (error instanceof HttpError && error.status === 404) return false;
      return failureCount < 2;
    },
  });

export {
  useMyProjects,
  useMyTemplates,
  usePublicTemplates,
  useAllTemplates,
  useCommunityProjects,
  useProject,
  useCreateProject,
  useSaveCanvas,
  useForkAsProject,
  useForkAsTemplate,
  useSetVisibility,
  useRenameProject,
  useDeleteProject,
  useCreateShareToken,
  useRevokeShareToken,
  useSharedDesign,
};
