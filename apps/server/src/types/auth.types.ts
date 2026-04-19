export interface AuthUser {
    id: string;
    email: string;
    name: string;
    provider: string | null;
}

export function isAuthUser(user: unknown): user is AuthUser {
    if (typeof user !== 'object' || user === null) return false;
    if (!('id' in user) || !('email' in user) || !('name' in user) || !('provider' in user))
        return false;
    return (
        typeof user.id === 'string' &&
        typeof user.email === 'string' &&
        typeof user.name === 'string' &&
        (user.provider === null || typeof user.provider === 'string')
    );
}
