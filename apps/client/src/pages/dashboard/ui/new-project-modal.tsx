import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useCreateProject } from '@/features/projects/queries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

const todayPlaceholder = (): string => {
  const d = new Date();
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'long' });
  const year = d.getFullYear();
  return `Untitled · ${day} ${month} ${year}`;
};

const PRESETS = [
  { label: 'HD 16:9', width: 1920, height: 1080 },
  { label: 'Square', width: 1080, height: 1080 },
  { label: 'Story 9:16', width: 1080, height: 1920 },
  { label: 'OG card', width: 1200, height: 630 },
  { label: 'A4 portrait', width: 1240, height: 1754 },
  { label: 'Business card', width: 1050, height: 600 },
] as const;

const MIN_DIM = 1;
const MAX_DIM = 16384;

const parseDim = (raw: string): number | null => {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  if (n < MIN_DIM || n > MAX_DIM) return null;
  return n;
};

type NewProjectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NewProjectModal = ({ open, onOpenChange }: NewProjectModalProps) => {
  const navigate = useNavigate();
  const create = useCreateProject();
  const [name, setName] = useState('');
  const [width, setWidth] = useState<number>(PRESETS[0].width);
  const [height, setHeight] = useState<number>(PRESETS[0].height);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(0);
  const [widthText, setWidthText] = useState<string>(String(PRESETS[0].width));
  const [heightText, setHeightText] = useState<string>(String(PRESETS[0].height));
  const placeholder = todayPlaceholder();

  const onPresetClick = (index: number) => {
    const preset = PRESETS[index];
    setSelectedPreset(index);
    setWidth(preset.width);
    setHeight(preset.height);
    setWidthText(String(preset.width));
    setHeightText(String(preset.height));
  };

  const onWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setWidthText(text);
    setSelectedPreset(null);
    const parsed = parseDim(text);
    if (parsed !== null) setWidth(parsed);
  };

  const onHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setHeightText(text);
    setSelectedPreset(null);
    const parsed = parseDim(text);
    if (parsed !== null) setHeight(parsed);
  };

  const widthValid = parseDim(widthText) !== null;
  const heightValid = parseDim(heightText) !== null;
  const canSubmit = widthValid && heightValid && !create.isPending;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const finalName = name.trim() || placeholder;
    const project = await create.mutateAsync({ name: finalName, width, height });
    onOpenChange(false);
    navigate(`/editor/${project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Name your canvas.</DialogTitle>
          <DialogDescription>You can rename it any time from the editor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={placeholder}
            disabled={create.isPending}
          />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRESETS.map((preset, i) => {
              const active = selectedPreset === i;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onPresetClick(i)}
                  disabled={create.isPending}
                  className={`flex flex-col items-start gap-1 border px-3 py-2 text-left transition-colors ${
                    active
                      ? 'border-foreground bg-white/[0.04]'
                      : 'border-hairline-strong hover:border-foreground'
                  }`}
                >
                  <span className="font-sans text-[13px] text-foreground">{preset.label}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-dim">
                    {preset.width} × {preset.height} PX
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
            <Input
              type="text"
              inputMode="numeric"
              value={widthText}
              onChange={onWidthChange}
              disabled={create.isPending}
              aria-label="Width"
              className="max-w-[120px]"
            />
            <span>×</span>
            <Input
              type="text"
              inputMode="numeric"
              value={heightText}
              onChange={onHeightChange}
              disabled={create.isPending}
              aria-label="Height"
              className="max-w-[120px]"
            />
            <span>PX</span>
          </div>

          {create.error ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-destructive">
              Could not create project; check your connection and try again
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {create.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { NewProjectModal };
