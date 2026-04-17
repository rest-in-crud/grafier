export interface OAuthUser {
    id: string;
    email: string;
    name: string;
    password?: string;
}

export function isOAuthUser(user: unknown): user is OAuthUser {
    return (
        typeof user === 'object' &&
        user !== null &&
        'id' in user &&
        'email' in user &&
        typeof (user as Record<string, unknown>).id === 'string' &&
        typeof (user as Record<string, unknown>).email === 'string'
    );
}
