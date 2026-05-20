import { useCanvas } from '@/features/canvas/hooks/useCanvas';

export const CanvasArea = () => {
  const { containerRef, canvasRef } = useCanvas();

  return (
    <div ref={containerRef} className="h-full w-full">
      <canvas ref={canvasRef} />
    </div>
  );
};
