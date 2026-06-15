import { SideEffectSeverity, SideEffectStatus } from "@constant/enums";

export interface SeedSideEffectReport {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    serviceName: string; // Used to look up Category
    providerName: string; // Used to look up DoctorProfile
    severity: SideEffectSeverity;
    description: string;
    status: SideEffectStatus;
    detectedAt: Date;
    attachmentCount: number;
}

export const DEFAULT_SIDE_EFFECT_REPORTS: SeedSideEffectReport[] = [
    {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        phone: "(408) 555-0110",
        serviceName: "Semaglutide",
        providerName: "Dr. Runa Pradhan",
        severity: "MILD",
        description:
            "Experiencing mild nausea after taking the medication. It lasts for a few hours but is manageable.",
        status: "REVIEWED",
        detectedAt: new Date("2026-06-04T09:00:00Z"),
        attachmentCount: 0,
    },
    {
        firstName: "Michael",
        lastName: "Roberts",
        email: "m.roberts@gmail.com",
        phone: "(408) 555-0120",
        serviceName: "Phentermine",
        providerName: "Dr. Jeffrey Richker",
        severity: "SEVERE",
        description:
            "Severe headaches and chest tightness. Need to discuss alternative medication options.",
        status: "REVIEWED",
        detectedAt: new Date("2026-06-04T08:45:00Z"),
        attachmentCount: 2,
    },
    {
        firstName: "Emily",
        lastName: "Chen",
        email: "emily.chen@outlook.com",
        phone: "(408) 555-0130",
        serviceName: "Testosterone Cypionate",
        providerName: "Dr. Nicole Sheeder",
        severity: "LIFE_THREATENING",
        description:
            "Sudden difficulty breathing and severe allergic reaction. Called emergency services.",
        status: "PENDING",
        detectedAt: new Date("2026-06-04T08:30:00Z"),
        attachmentCount: 3,
    },
    {
        firstName: "David",
        lastName: "Wilson",
        email: "dwilson@yahoo.com",
        phone: "(408) 555-0140",
        serviceName: "Metformin",
        providerName: "Dr. Runa Pradhan",
        severity: "MILD",
        description: "Slight stomach upset. Taking with meals as instructed seems to help.",
        status: "REVIEWED",
        detectedAt: new Date("2026-06-04T08:15:00Z"),
        attachmentCount: 0,
    },
    {
        firstName: "Robert",
        lastName: "Adams",
        email: "r.adams@proton.me",
        phone: "(408) 555-0150",
        serviceName: "Bupropion",
        providerName: "Dr. Christine Czarnecki",
        severity: "MODERATE",
        description: "Having trouble sleeping and feeling unusually anxious in the evenings.",
        status: "REVIEWED",
        detectedAt: new Date("2026-06-03T17:00:00Z"),
        attachmentCount: 1,
    },
    {
        firstName: "Arlene",
        lastName: "McCoy",
        email: "arlene.mccoy@email.com",
        phone: "(408) 555-0160",
        serviceName: "Naltrexone",
        providerName: "Tara Terrones",
        severity: "MODERATE",
        description: "Moderate fatigue and muscle aches since starting the dosage.",
        status: "PENDING",
        detectedAt: new Date("2026-06-03T16:30:00Z"),
        attachmentCount: 0,
    },
    {
        firstName: "Devon",
        lastName: "Lane",
        email: "devon.lane@gmail.com",
        phone: "(408) 555-0170",
        serviceName: "Adderall",
        providerName: "Dr. Christine Czarnecki",
        severity: "LIFE_THREATENING",
        description: "Extreme chest palpitations and shortness of breath.",
        status: "PENDING",
        detectedAt: new Date("2026-06-03T15:45:00Z"),
        attachmentCount: 2,
    },
];
