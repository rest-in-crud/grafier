import { useRef } from 'react';
import { clampRailWidth } from '@/pages/editor/lib/preferences';

type Props = {
  currentWidth: number;
  onResize: (next: number) => void;
};

export function RailResizeHandle({ currentWidth, onResize }: Props) {
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: currentWidth };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const next = clampRailWidth(dragRef.current.startWidth - dx);
      onResize(next);
    };

    const handleUp = () => {
      dragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute top-0 bottom-0 left-0 w-1 cursor-col-resize hover:bg-foreground/20"
      title="Drag to resize"
    />
  );
}
