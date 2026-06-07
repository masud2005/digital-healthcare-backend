export const userStatus = ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "DISABLED","BLOCKED", "DELETED"] as const;
export type UserStatus = (typeof userStatus)[number];

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

