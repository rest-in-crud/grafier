import { Control, InteractiveFabricObject, util } from 'fabric';

type RenderFn = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: object | undefined,
  fabricObject: InteractiveFabricObject,
) => void;

const SZ = 5;

function square(ctx: CanvasRenderingContext2D, left: number, top: number, angle: number) {
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(util.degreesToRadians(angle));
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.lineWidth = 1;
  ctx.fillRect(-SZ, -SZ, SZ * 2, SZ * 2);
  ctx.strokeRect(-SZ, -SZ, SZ * 2, SZ * 2);
  ctx.restore();
}

function squareHandle(): RenderFn {
  return function (ctx, left, top, _so, obj) {
    square(ctx, left, top, obj.angle ?? 0);
  };
}

function rotHandle(): RenderFn {
  return function (ctx, left, top) {
    ctx.save();
    ctx.translate(left, top);
    ctx.beginPath();
    ctx.arc(0, 0, SZ, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  };
}

export function applySelectionControls(): void {
  const original = InteractiveFabricObject.createControls.bind(InteractiveFabricObject);

  InteractiveFabricObject.createControls = function () {
    const result = original();
    const c = result.controls;

    c.tl = new Control({ ...c.tl, render: squareHandle() });
    c.tr = new Control({ ...c.tr, render: squareHandle() });
    c.bl = new Control({ ...c.bl, render: squareHandle() });
    c.br = new Control({ ...c.br, render: squareHandle() });

    c.ml.visible = false;
    c.mr.visible = false;
    c.mt = new Control({ ...c.mt, render: squareHandle() });
    c.mb = new Control({ ...c.mb, render: squareHandle() });

    c.mtr = new Control({ ...c.mtr, render: rotHandle() });

    return result;
  };
}
