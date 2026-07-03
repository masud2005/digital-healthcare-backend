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
    /** User profile pictures */
    "PROFILE_PICTURE",
    /** Files uploaded within chat messages */
    "CHAT_MESSAGE",
    /** Product showcase images */
    "PRODUCT_IMAGE",
    /** Files attached to assessment questions or submissions */
    "ASSESSMENT_FILE",
    /** Patient medical reports */
    "MEDICAL_REPORT",
    /** Category icons */
    "CATEGORY_ICON",
    /** Homepage hero section main image */
    "HERO_IMAGE",
    /** Homepage hero section badge/logo image */
    "HERO_BADGE_IMAGE",
    /** Icons for 'How It Works' section steps */
    "HOW_IT_WORKS_ICON",
    /** Website branding logos (light and dark) */
    "WEBSITE_LOGO",
    /** Website favicon assets */
    "WEBSITE_FAVICON",
    /** Website social media preview/OG images */
    "WEBSITE_SOCIAL_PREVIEW",
    /** Doctor avatars/profile photos */
    "DOCTOR_AVATAR",
    /** Files attached to contact lead inquiries */
    "CONTACT_LEAD_ATTACHMENT",
    /** Files attached to side effect reports */
    "SIDE_EFFECT_REPORT_ATTACHMENT",
    /** Public files */
    "PUBLIC",
    /** Other files */
    "OTHERS",
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

export const stateComplianceStatus = ["COMPLIANT", "RESTRICTED", "COMING_SOON"] as const;
export type StateComplianceStatus = (typeof stateComplianceStatus)[number];

export const orderStatus = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
] as const;
export type OrderStatus = (typeof orderStatus)[number];

export const paymentMethod = [
    "CARD",
    "BANK_TRANSFER",
    "CLOVER",
    "STRIPE",
    "PAYPAL",
    "WALLET",
] as const;
export type PaymentMethod = (typeof paymentMethod)[number];

export const paymentItemType = ["FEES", "PRODUCT"] as const;
export type PaymentItemType = (typeof paymentItemType)[number];

export const paymentStatus = [
    "PENDING",
    "COMPLETED",
    "FAILED",
    "REFUNDED",
    "CANCELLED",
    "PROCESSING",
] as const;
export type PaymentStatus = (typeof paymentStatus)[number];

export const refundStatus = ["PENDING", "COMPLETED", "FAILED", "REJECTED"] as const;
export type RefundStatus = (typeof refundStatus)[number];

export const subscriptionStatus = [
    "ACTIVE",
    "CANCELLED",
    "EXPIRED",
    "PAST_DUE",
    "TRIALING",
] as const;
export type SubscriptionStatus = (typeof subscriptionStatus)[number];

export const messageType = ["TEXT", "ATTACHMENT", "PROPOSAL"] as const;
export type MessageType = (typeof messageType)[number];

export const messageStatus = ["SENT", "DELIVERED", "READ", "FAILED"] as const;
export type MessageStatus = (typeof messageStatus)[number];

export const proposalStatus = ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"] as const;
export type ProposalStatus = (typeof proposalStatus)[number];

export const communicationChannel = ["EMAIL", "SMS"] as const;
export type CommunicationChannel = (typeof communicationChannel)[number];

export const communicationAction = [
    "OTP_LOGIN",
    "OTP_REGISTER",
    "OTP_FORGOT_PASSWORD",
    "DOCTOR_CREDENTIALS",
    "CONTACT_LEAD_REPLY",
    "ORDER_CONFIRMATION",
    "PAYMENT_RECEIPT",
    "ASSESSMENT_SUBMITTED",
    "WELCOME_PATIENT",
    "NEW_PATIENT_REGISTERED_ADMIN",
    "ASSESSMENT_APPROVED",
    "ASSESSMENT_REJECTED",
    "ASSESSMENT_REFILL_REQUEST",
    "ASSESSMENT_EDIT_SUBMITTED",
    "NEW_MESSAGE",
    "NEW_PROPOSAL",
    "PROPOSAL_ACCEPTED",
    "PROPOSAL_REJECTED",
    "SUBSCRIPTION_CANCELLED",
] as const;
export type CommunicationAction = (typeof communicationAction)[number];
