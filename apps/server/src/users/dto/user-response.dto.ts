import { Exclude } from 'class-transformer';

export class UserResponseDto {
    id!: string;
    email!: string;
    name!: string;
    provider!: string | null;

    @Exclude()
    password?: string | null;

    @Exclude()
    providerId?: string | null;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
