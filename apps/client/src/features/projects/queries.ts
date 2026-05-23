import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/features/projects/api';
import { projectsKeys } from '@/features/projects/query-keys';
import type { ProjectDetail, SaveCanvasRequest } from '@/features/projects/schema';

const projectsListQueryOptions = queryOptions({
  queryKey: projectsKeys.list(),
  queryFn: () => api.list(),
});

const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: projectsKeys.detail(id),
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
      queryClient.setQueryData(projectsKeys.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: projectsKeys.list() });
    },
  });
};

const useSaveCanvas = (projectId: string) => {
  return useMutation({
    mutationKey: [...projectsKeys.detail(projectId), 'save-canvas'],
    mutationFn: (body: SaveCanvasRequest) => api.saveCanvas(projectId, body),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  });
};

export { useProjectsList, useProject, useCreateProject, useSaveCanvas };
