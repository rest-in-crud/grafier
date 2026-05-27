import { IsArray, IsInt, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SaveCheckpointDto {
    @IsObject()
    canvasJSON!: Record<string, unknown>;

    @IsArray()
    layersJSON!: unknown[];

    @IsInt()
    @Min(1)
    width!: number;

    @IsInt()
    @Min(1)
    height!: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    label?: string;
}
