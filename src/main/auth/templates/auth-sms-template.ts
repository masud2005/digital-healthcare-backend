type OtpPurpose = "LOGIN" | "REGISTER" | "FORGOT_PASSWORD";

type BuildOtpSmsInput = {
    code: string;
    purpose: OtpPurpose;
};

const BRAND_NAME = "WeightLossMD";

function getAction(purpose: OtpPurpose) {
    if (purpose === "LOGIN") {
        return "sign in";
    }

    if (purpose === "FORGOT_PASSWORD") {
        return "reset your password";
    }

    return "verify your account";
}

export function buildOtpSms({ code, purpose }: BuildOtpSmsInput) {
    return `${BRAND_NAME}: Your code to ${getAction(purpose)} is ${code}. It expires in 10 minutes. Do not share this code.`;
}
