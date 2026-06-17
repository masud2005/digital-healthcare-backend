export const Role = {
    ADMIN: "ADMIN",
    DOCTOR: "DOCTOR",
    PATIENT: "PATIENT",
    USER: "PATIENT",
} as const;

export type AppRole = (typeof Role)[keyof typeof Role];
