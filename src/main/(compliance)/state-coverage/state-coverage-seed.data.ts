import { StateComplianceStatus } from "@constant/enums";

export interface SeedStateCoverage {
    stateCode: string;
    stateName: string;
    status: StateComplianceStatus;
    isComingSoon: boolean;
    allowedServices: string[];
}

export const US_STATES_LIST = [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
];

const CONFIGURED_STATES_MAP: Record<string, Omit<SeedStateCoverage, "stateCode" | "stateName">> = {
    CA: {
        status: "COMPLIANT",
        isComingSoon: false,
        allowedServices: ["Telemedicine", "Weight Loss", "Hormone Therapy"],
    },
    TX: {
        status: "COMPLIANT",
        isComingSoon: false,
        allowedServices: [
            "Telemedicine",
            "Weight Loss",
            "Hormone Therapy",
            "Anxiety & Depression",
            "Sexual Health",
            "Hair care",
            "Sleep",
            "Hair Loss",
            "Controlled Substances",
            "Hair Loss (Finasteride)",
        ],
    },
    NY: {
        status: "RESTRICTED",
        isComingSoon: false,
        allowedServices: ["Weight Loss"],
    },
    FL: {
        status: "COMPLIANT",
        isComingSoon: false,
        allowedServices: [
            "Telemedicine",
            "Weight Loss",
            "Hormone Therapy",
            "Anxiety & Depression",
            "Sexual Health",
            "Hair care",
            "Skin Care",
            "Sleep",
            "Hair Loss",
            "Controlled Substances",
            "Hair Loss (Finasteride)",
        ],
    },
    GA: {
        status: "COMPLIANT",
        isComingSoon: false,
        allowedServices: [
            "Telemedicine",
            "Weight Loss",
            "Anxiety & Depression",
            "Sexual Health",
            "Hair care",
            "Skin Care",
            "Sleep",
            "Hair Loss",
            "Controlled Substances",
            "Hair Loss (Finasteride)",
        ],
    },
    WA: {
        status: "RESTRICTED",
        isComingSoon: false,
        allowedServices: [
            "Telemedicine",
            "Weight Loss",
            "Hormone Therapy",
            "Anxiety & Depression",
            "Sexual Health",
            "Hair care",
            "Skin Care",
            "Sleep",
            "Hair Loss",
            "Hair Loss (Finasteride)",
        ],
    },
    OR: {
        status: "COMING_SOON",
        isComingSoon: true,
        allowedServices: [],
    },
    IL: {
        status: "COMPLIANT",
        isComingSoon: false,
        allowedServices: [
            "Telemedicine",
            "Weight Loss",
            "Hormone Therapy",
            "Anxiety & Depression",
            "Sexual Health",
            "Hair care",
            "Skin Care",
            "Sleep",
            "Hair Loss",
            "Controlled Substances",
            "Hair Loss (Finasteride)",
        ],
    },
    AZ: {
        status: "COMPLIANT",
        isComingSoon: false,
        allowedServices: [
            "Telemedicine",
            "Weight Loss",
            "Hormone Therapy",
            "Anxiety & Depression",
            "Sexual Health",
            "Hair care",
            "Skin Care",
            "Sleep",
            "Hair Loss",
            "Controlled Substances",
        ],
    },
    CO: {
        status: "COMPLIANT",
        isComingSoon: false,
        allowedServices: [
            "Telemedicine",
            "Anxiety & Depression",
            "Sexual Health",
            "Hair care",
            "Skin Care",
            "Sleep",
            "Hair Loss",
            "Controlled Substances",
            "Hair Loss (Finasteride)",
        ],
    },
};

export const getSeedStateCoverages = (): SeedStateCoverage[] => {
    return US_STATES_LIST.map((state) => {
        const config = CONFIGURED_STATES_MAP[state.code];
        if (config) {
            return {
                stateCode: state.code,
                stateName: state.name,
                ...config,
            };
        }
        return {
            stateCode: state.code,
            stateName: state.name,
            status: "COMING_SOON",
            isComingSoon: true,
            allowedServices: [],
        };
    });
};
