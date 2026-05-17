export type IconProps = { size?: number };

export type ToolId =
  | 'move'
  | 'marquee'
  | 'lasso'
  | 'brush'
  | 'pencil'
  | 'eraser'
  | 'shape'
  | 'text'
  | 'dropper'
  | 'hand'
  | 'zoom';

export type BlendMode = 'NORMAL' | 'MULTIPLY' | 'SCREEN' | 'OVERLAY';

export type EditorOpts = {
  size: number;
  opacity: number;
  hardness: number;
  blend: BlendMode;
  stroke: number;
};

export type LayerType = 'group' | 'rect' | 'circle' | 'text' | 'shape';

export type LayerNode = {
  id: string;
  name: string;
  type: LayerType;
  open?: boolean;
  visible?: boolean;
  locked?: boolean;
  children?: LayerNode[];
};
