import { IsEmail } from 'class-validator';

export class InitiateEmailChangeDto {
    @IsEmail()
    email!: string;
}
