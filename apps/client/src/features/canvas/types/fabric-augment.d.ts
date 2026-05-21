declare module 'fabric' {
  interface FabricObject {
    erasable?: boolean;
    data?: { id?: string; [key: string]: unknown };
  }
}

export {};
