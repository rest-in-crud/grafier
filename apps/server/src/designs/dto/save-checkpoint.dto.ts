import { IsArray, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class SaveCheckpointDto {
    @IsObject()
    canvasJSON!: Record<string, unknown>;

    @IsArray()
    layersJSON!: unknown[];

    @IsOptional()
    @IsString()
    @MaxLength(255)
    label?: string;
}
