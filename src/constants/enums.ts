export const userStatus = [
    "PENDING_VERIFICATION",
    "ACTIVE",
    "SUSPENDED",
    "DISABLED",
    "BLOCKED",
    "DELETED",
] as const;
export type UserStatus = (typeof userStatus)[number];

export const categoryStatus = ["ACTIVE", "DISABLED"] as const;
export type CategoryStatus = (typeof categoryStatus)[number];
export const billingCycle = ["MONTHLY", "YEARLY", "QUARTERLY"] as const;
export type BillingCycle = (typeof billingCycle)[number];

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

export const submissionStatus = [
    "DRAFT",
    "PENDING",
    "REVIEWED",
    "ACCEPTED",
    "REFIL_REQUESTED",
    "REJECTED",
] as const;
export type SubmissionStatus = (typeof submissionStatus)[number];

export const otpPurpose = ["LOGIN", "REGISTER", "FORGOT_PASSWORD"] as const;
export type OtpPurpose = (typeof otpPurpose)[number];

export const otpChannel = ["EMAIL", "PHONE"] as const;
export type OtpChannel = (typeof otpChannel)[number];

export const otpStatus = ["PENDING", "VERIFIED", "EXPIRED", "CANCELLED", "FAILED"] as const;
export type OtpStatus = (typeof otpStatus)[number];

export const authAttemptStatus = [
    "STARTED",
    "OTP_SENT",
    "VERIFIED",
    "FAILED",
    "EXPIRED",
    "CANCELLED",
] as const;
export type AuthAttemptStatus = (typeof authAttemptStatus)[number];

export const authSecurityEventType = [
    "REGISTER_STARTED",
    "LOGIN_STARTED",
    "OTP_SENT",
    "OTP_RESENT",
    "OTP_VERIFY_FAILED",
    "OTP_VERIFIED",
    "SESSION_CREATED",
    "SESSION_REVOKED",
    "DEVICE_TRUSTED",
    "DEVICE_REVOKED",
    "PASSWORD_CHANGED",
    "PASSWORD_RESET_STARTED",
    "PASSWORD_RESET_COMPLETED",
] as const;
export type AuthSecurityEventType = (typeof authSecurityEventType)[number];

export const discountType = ["PERCENTAGE", "FIXED_AMOUNT"] as const;
export type DiscountType = (typeof discountType)[number];

export const incidentSeverity = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type IncidentSeverity = (typeof incidentSeverity)[number];

export const incidentSource = [
    "SECURITY_SCAN",
    "SYSTEM_MONITORING",
    "USER_REPORT",
    "MANUAL",
] as const;
export type IncidentSource = (typeof incidentSource)[number];

export const incidentStatus = ["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"] as const;
export type IncidentStatus = (typeof incidentStatus)[number];

export const systemHealthStatus = ["OPERATIONAL", "DEGRADED", "OUTAGE", "MAINTENANCE"] as const;
export type SystemHealthStatus = (typeof systemHealthStatus)[number];

export const consentType = ["DATA_PROCESSING", "MARKETING", "ANALYTICS", "AI_TRAINING"] as const;
export type ConsentType = (typeof consentType)[number];

export const consentStatus = ["ACCEPTED", "REVOKED", "PENDING"] as const;
export type ConsentStatus = (typeof consentStatus)[number];

export const consentSource = ["WEB", "MOBILE"] as const;
export type ConsentSource = (typeof consentSource)[number];
export const attachmentContext = [
    "PROFILE_PICTURE",
    "CHAT_MESSAGE",
    "PRODUCT_IMAGE",
    "ASSESSMENT_FILE",
    "MEDICAL_REPORT",
    "CATEGORY_ICON",
    "HERO_IMAGE",
    "HERO_BADGE_IMAGE",
    "HOW_IT_WORKS_ICON",
    "WEBSITE_LOGO",
    "WEBSITE_FAVICON",
    "WEBSITE_SOCIAL_PREVIEW",
    "DOCTOR_AVATAR",
    "CONTACT_LEAD_ATTACHMENT",
    "SIDE_EFFECT_REPORT_ATTACHMENT",
] as const;
export type AttachmentContext = (typeof attachmentContext)[number];

export const providerLicenseStatus = ["ACTIVE", "EXPIRING_SOON", "EXPIRED", "PENDING"] as const;
export type ProviderLicenseStatus = (typeof providerLicenseStatus)[number];

export const providerLicenseSource = ["PRIMARY", "DEA", "STATE_BOARD"] as const;
export type ProviderLicenseSource = (typeof providerLicenseSource)[number];

export const sideEffectSeverity = ["MILD", "MODERATE", "SEVERE", "LIFE_THREATENING"] as const;
export type SideEffectSeverity = (typeof sideEffectSeverity)[number];

export const sideEffectStatus = ["PENDING", "REVIEWED", "ESCALATED"] as const;
export type SideEffectStatus = (typeof sideEffectStatus)[number];
