import { useCanvas } from '@/features/canvas/hooks/useCanvas.ts';

export const CanvasArea = () => {
  const { containerRef, canvasRef } = useCanvas();

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
