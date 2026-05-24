import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/features/projects/api';
import { designsKeys } from '@/features/projects/query-keys';
import type { ProjectDetail, SaveCanvasRequest } from '@/features/projects/schema';

const projectsListQueryOptions = queryOptions({
  queryKey: designsKeys.myProjects(),
  queryFn: () => api.list(),
});

const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: designsKeys.detail(id),
    queryFn: () => api.get(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

const useProjectsList = () => useQuery(projectsListQueryOptions);
const useProject = (id: string) => useQuery(projectQueryOptions(id));

const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.create({ name }),
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
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  });
};

export { useProjectsList, useProject, useCreateProject, useSaveCanvas };
