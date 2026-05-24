import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCheckpointDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    label?: string;
}
