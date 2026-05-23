import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateDesignDto {
    @IsString()
    @MaxLength(255)
    name!: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    width?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    height?: number;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @IsOptional()
    @IsEnum(['project', 'template'])
    type?: 'project' | 'template';
}
