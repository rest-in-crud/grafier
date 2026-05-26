import { useEffect, useState } from 'react';
import type { Canvas } from 'fabric';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { exportAs, ExportError } from '../lib/export';
import type { ExportFormat } from '../lib/export';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { IExport } from '../icons';

type FormatRow = { format: ExportFormat; label: string };

const FORMATS: FormatRow[] = [
  { format: 'png', label: 'PNG' },
  { format: 'jpg', label: 'JPG' },
  { format: 'svg', label: 'SVG' },
  { format: 'pdf', label: 'PDF' },
  { format: 'project', label: 'Project' },
];

const ERROR_CLEAR_MS = 3000;

type ExportMenuProps = {
  getCanvas: () => Canvas | null;
  projectName: string;
  projectWidth: number;
  projectHeight: number;
};

const ExportMenu = ({ getCanvas, projectName, projectWidth, projectHeight }: ExportMenuProps) => {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<ExportFormat | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), ERROR_CLEAR_MS);
    return () => clearTimeout(timer);
  }, [error]);

  const onPick = async (format: ExportFormat) => {
    const canvas = getCanvas();
    if (!canvas) return;
    setExporting(format);
    setError(null);
    try {
      const layersJSON = useLayersStore.getState().layers;
      await exportAs(canvas, format, {
        projectName,
        projectWidth,
        projectHeight,
        layersJSON,
      });
    } catch (e) {
      if (e instanceof ExportError) setError(e.format);
      else setError(format);
    } finally {
      setExporting(null);
    }
  };

  const itemLabel = (row: FormatRow): string => {
    if (exporting === row.format) return 'Exporting…';
    if (error === row.format) return 'Export failed';
    return row.label;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="editor-gradient-btn">
          <span className="editor-gradient-btn-label">
            <IExport size={11} />
            Export
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-28 min-w-0">
        {FORMATS.map((row) => (
          <DropdownMenuItem
            key={row.format}
            onSelect={(event) => {
              event.preventDefault();
              void onPick(row.format);
            }}
            disabled={exporting !== null}
            className="cursor-pointer focus:bg-white/10"
          >
            {itemLabel(row)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ExportMenu };
