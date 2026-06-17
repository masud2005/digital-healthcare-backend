import type { PrismaClient } from "@prisma/client";

const CONSENTS = [
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

export async function consentSeed(prisma: PrismaClient) {
    console.log("🌱 Seeding consent logs...");

    const count = await prisma.consent.count();
    if (count > 0) {
        console.log("⚠️ Consent logs already seeded.");
        return;
    }

    for (const consent of CONSENTS) {
        await prisma.consent.create({
            data: consent,
        });
    }

    console.log(`✅ Seeded ${CONSENTS.length} consent logs.`);
}
