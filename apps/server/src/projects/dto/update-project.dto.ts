import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    width?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    height?: number;
}
