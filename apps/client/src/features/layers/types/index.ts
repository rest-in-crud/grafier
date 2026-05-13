export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  objectsIds: string[];
  collapsed: boolean;
}
