export interface LayerObject {
  id: string;
  name: string;
  visible: boolean;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  objects: LayerObject[];
  collapsed: boolean;
}
