export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    phoneNumber?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
}

export interface AuthSessionContext {
    user: AuthenticatedUser;
    sessionId: string;
}