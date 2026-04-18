export interface AuthUser {
    id: string;
    email: string;
    name: string;
    password?: string;
}

export function isAuthUser(user: unknown): user is AuthUser {
    return (
        typeof user === 'object' &&
        user !== null &&
        'id' in user &&
        'email' in user &&
        typeof user.id === 'string' &&
        typeof user.email === 'string'
    );
}
