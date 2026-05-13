import { useCanvas } from '@/features/canvas/hooks/useCanvas.ts';
import { useLayerSync } from '@/features/layers/hooks/useLayerSync.ts';

export const CanvasArea = () => {
  const { containerRef, canvasRef } = useCanvas();
  useLayerSync();

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};