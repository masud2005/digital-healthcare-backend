// Consent seed data matching the Consent Management screenshot
export const DEFAULT_CONSENTS = [
    {
        userName: "Jessica Martinez",
        email: "jessica.m@email.com",
        type: "DATA_PROCESSING" as const,
        status: "ACCEPTED" as const,
        source: "WEB" as const,
        consentDate: new Date("2026-05-15T09:24:00Z"),
    },
    {
        userName: "Robert Kim",
        email: "r.kim@healthapp.io",
        type: "MARKETING" as const,
        status: "REVOKED" as const,
        source: "MOBILE" as const,
        consentDate: new Date("2026-04-10T11:00:00Z"),
    },
    {
        userName: "Amanda Chen",
        email: "a.chen@clinic.com",
        type: "ANALYTICS" as const,
        status: "ACCEPTED" as const,
        source: "WEB" as const,
        consentDate: new Date("2026-06-01T08:12:00Z"),
    },
    {
        userName: "Marcus Brown",
        email: "marcus.b@telemed.com",
        type: "AI_TRAINING" as const,
        status: "REVOKED" as const,
        source: "WEB" as const,
        consentDate: new Date("2026-05-28T13:30:00Z"),
    },
    {
        userName: "Priya Sharma",
        email: "priya.s@healthnet.org",
        type: "DATA_PROCESSING" as const,
        status: "ACCEPTED" as const,
        source: "MOBILE" as const,
        consentDate: new Date("2026-05-30T07:45:00Z"),
    },
    {
        userName: "David Williams",
        email: "d.williams@care.com",
        type: "MARKETING" as const,
        status: "ACCEPTED" as const,
        source: "WEB" as const,
        consentDate: new Date("2026-05-22T10:15:00Z"),
    },
    {
        userName: "Lisa Thompson",
        email: "l.thompson@medapp.io",
        type: "ANALYTICS" as const,
        status: "ACCEPTED" as const,
        source: "WEB" as const,
        consentDate: new Date("2026-05-18T14:55:00Z"),
    },
    {
        userName: "Kevin Nash",
        email: "k.nash@clinic.org",
        type: "AI_TRAINING" as const,
        status: "REVOKED" as const,
        source: "WEB" as const,
        consentDate: new Date("2026-03-05T09:00:00Z"),
    },
];

// Generate extra consents to hit realistic totals matching the stats cards:
// Total: ~2847, Granted: ~2112, Pending: ~493, Revoked: ~242
export const generateExtraConsents = () => {
    const extras: any[] = [];
    const types = ["DATA_PROCESSING", "MARKETING", "ANALYTICS", "AI_TRAINING"] as const;
    const sources = ["WEB", "MOBILE"] as const;
    const names = [
        "Patient A",
        "Patient B",
        "Patient C",
        "Patient D",
        "Patient E",
        "Patient F",
        "Patient G",
        "Patient H",
        "Patient I",
        "Patient J",
    ];

    const statusDistribution = (i: number): "ACCEPTED" | "REVOKED" | "PENDING" => {
        // ~74% ACCEPTED, ~17% PENDING, ~9% REVOKED
        if (i % 11 === 0) return "REVOKED";
        if (i % 6 === 0) return "PENDING";
        return "ACCEPTED";
    };

    for (let i = 0; i < 2839; i++) {
        extras.push({
            userName: names[i % names.length],
            email: `user${i}@clinic.com`,
            type: types[i % types.length],
            status: statusDistribution(i),
            source: sources[i % sources.length],
            consentDate: new Date(Date.now() - i * 2 * 60 * 60 * 1000),
        });
    }

    return extras;
};
