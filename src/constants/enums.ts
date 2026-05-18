export const role = ["ADMIN", "DOCTOR", "PATIENT"] as const;
export type Role = (typeof role)[number];

export const categoryStatus = ["ACTIVE", "DISABLED"] as const;
export type CategoryStatus = (typeof categoryStatus)[number];

export const assessmentStatus = ["DRAFT", "ACTIVE", "DISABLED"] as const;
export type AssessmentStatus = (typeof assessmentStatus)[number];

export const questionType = [
    "INFORMATION_ONLY",
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "INPUT",
] as const;
export type QuestionType = (typeof questionType)[number];

export const alignment = ["LEFT", "CENTER", "RIGHT"] as const;
export type Alignment = (typeof alignment)[number];

export const submissionStatus = ["PENDING", "ACCEPTED", "REJECTED"] as const;
export type SubmissionStatus = (typeof submissionStatus)[number];
