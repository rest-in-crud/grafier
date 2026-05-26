import type { RefObject } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/features/versions/api';
import { versionsKeys } from '@/features/versions/query-keys';
import type { Version } from '@/features/versions/schema';
import { useSaveStatusStore } from '@/features/projects/store/save-status.store';
import { useNoticeStore } from '@/features/notice/store/notice.store';
import { designsKeys } from '@/features/projects/query-keys';
import { reloadFromDesign } from '@/features/canvas/lib/reloadFromDesign';
import { buildAutoBeforeRestoreLabel } from '@/features/versions/lib/version-labels';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { saveCanvasRequestSchema } from '@/features/projects/schema';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';

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

class RestoreAbortedError extends Error {
  constructor() {
    super('restore-aborted');
    this.name = 'RestoreAbortedError';
  }
}

const useRestoreVersion = (designId: string, engineRef: RefObject<CanvasEngine | null>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (versionId: string) => {
      const engine = engineRef.current;
      if (!engine) throw new Error('Engine not mounted');
      const canvasJSON = saveCanvasRequestSchema.shape.canvasJSON.parse(
        engine.fabricCanvas.toJSON(),
      );
      const layersJSON = useLayersStore.getState().layers;
      try {
        await api.saveVersion(designId, {
          label: buildAutoBeforeRestoreLabel(new Date()),
          canvasJSON,
          layersJSON,
        });
      } catch {
        useNoticeStore.getState().show('✕ Could not save current state, restore cancelled');
        throw new RestoreAbortedError();
      }
      await api.restoreVersion(designId, versionId);
      await queryClient.invalidateQueries({ queryKey: versionsKeys.list(designId) });
      await queryClient.invalidateQueries({ queryKey: designsKeys.detail(designId) });
      await reloadFromDesign(engine, designId);
      useSaveStatusStore.getState().markIdle();
    },
    onError: (err) => {
      /* RestoreAbortedError means we already showed a specific notice in the mutationFn; do not overwrite it */
      if (err instanceof RestoreAbortedError) return;
      useNoticeStore.getState().show('✕ Could not restore version');
    },
  });
};

export { useVersionsList, useSaveVersion, useRenameVersion, useDeleteVersion, useRestoreVersion };
export type { SaveVersionInput, RenameVersionInput };
