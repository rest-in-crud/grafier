import { useCanvas } from '@/features/canvas/hooks/useCanvas';
import { useLayerSync } from '@/features/layers/hooks/useLayerSync';
import { useHistory } from '@/features/canvas/hooks/useHistory';

export const CanvasArea = () => {
  const { containerRef, canvasRef, engineRef } = useCanvas();
  useLayerSync(engineRef);
  useHistory(engineRef);

  return (
    <div ref={containerRef} className="h-full w-full">
      <canvas ref={canvasRef} />
    </div>
  );
};
