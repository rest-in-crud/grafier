import { IsArray, IsObject } from 'class-validator';

export class SaveCanvasDto {
    @IsObject()
    canvasJSON!: Record<string, unknown>;

    @IsArray()
    layersJSON!: unknown[];
}
