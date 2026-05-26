import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/features/versions/api';
import { versionsKeys } from '@/features/versions/query-keys';
import type { Version } from '@/features/versions/schema';
import { useSaveStatusStore } from '@/features/projects/store/save-status.store';
import { useNoticeStore } from '@/features/notice/store/notice.store';

const useVersionsList = (designId: string, enabled: boolean) =>
  useQuery({
    queryKey: versionsKeys.list(designId),
    queryFn: () => api.listVersions(designId),
    enabled,
    staleTime: 0,
  });

type SaveVersionInput = {
  label: string | null;
  canvasJSON: unknown;
  layersJSON: unknown;
};

const useSaveVersion = (designId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveVersionInput) =>
      api.saveVersion(designId, {
        label: input.label,
        canvasJSON: input.canvasJSON,
        layersJSON: input.layersJSON,
      }),
    onSuccess: () => {
      /* saveCheckpoint also overwrites the design row server-side, so the autosave state is no longer dirty */
      useSaveStatusStore.getState().markIdle();
      void queryClient.invalidateQueries({ queryKey: versionsKeys.list(designId) });
    },
  });
};

type RenameVersionInput = { versionId: string; label: string | null };

const useRenameVersion = (designId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RenameVersionInput) =>
      api.renameVersion(designId, input.versionId, { label: input.label }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: versionsKeys.list(designId) });
      const previous = queryClient.getQueryData<Version[]>(versionsKeys.list(designId));
      queryClient.setQueryData<Version[]>(versionsKeys.list(designId), (rows) =>
        (rows ?? []).map((row) =>
          row.id === input.versionId ? { ...row, label: input.label } : row,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(versionsKeys.list(designId), context.previous);
      }
      useNoticeStore.getState().show('✕ Could not rename');
    },
  });
};

const useDeleteVersion = (designId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => api.deleteVersion(designId, versionId),
    onMutate: async (versionId) => {
      await queryClient.cancelQueries({ queryKey: versionsKeys.list(designId) });
      const previous = queryClient.getQueryData<Version[]>(versionsKeys.list(designId));
      queryClient.setQueryData<Version[]>(versionsKeys.list(designId), (rows) =>
        (rows ?? []).filter((row) => row.id !== versionId),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(versionsKeys.list(designId), context.previous);
      }
      useNoticeStore.getState().show('✕ Could not delete version');
    },
  });
};

export { useVersionsList, useSaveVersion, useRenameVersion, useDeleteVersion };
export type { SaveVersionInput, RenameVersionInput };
