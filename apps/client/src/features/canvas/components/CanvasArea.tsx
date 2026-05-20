import { useCanvas } from '@/features/canvas/hooks/useCanvas';
import { useLayerSync } from '@/features/layers/hooks/useLayerSync';

export const CanvasArea = () => {
  const { containerRef, canvasRef, engineRef } = useCanvas();
  useLayerSync(engineRef);

  return (
    <div ref={containerRef} className="h-full w-full">
      <canvas ref={canvasRef} />
    </div>
  );
};
