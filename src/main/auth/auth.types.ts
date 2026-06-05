export interface AuthenticatedUser {
    id: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    roles: string[];
    role: string;
    status: string;
}

export interface AuthSessionContext {
    user: AuthenticatedUser;
    sessionId: string;
}
