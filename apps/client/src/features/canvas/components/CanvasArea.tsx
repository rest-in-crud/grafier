import type { RefObject } from 'react';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import { useCanvas } from '@/features/canvas/hooks/useCanvas';
import { useLayerSync } from '@/features/layers/hooks/useLayerSync';
import { useHistory } from '@/features/canvas/hooks/useHistory';

type Props = {
  engineRef: RefObject<CanvasEngine | null>;
};

export const CanvasArea = ({ engineRef }: Props) => {
  const { containerRef, canvasRef } = useCanvas(engineRef);
  useLayerSync(engineRef);
  useHistory(engineRef);

  return (
    <div ref={containerRef} className="h-full w-full">
      <canvas ref={canvasRef} />
    </div>
  );
};
