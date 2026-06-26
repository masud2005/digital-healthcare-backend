import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateTemplateDto {
    @ApiPropertyOptional({ description: "Email subject line. Supports Handlebars variables e.g. {{subject}}", example: "Secure login verification" })
    @IsString()
    @IsOptional()
    subject?: string;

    @ApiPropertyOptional({
        description: "Override the email header title for this specific template (overrides global layout default)",
        example: "Secure login verification",
    })
    @IsString()
    @IsOptional()
    headerTitle?: string;

    @ApiPropertyOptional({
        description: "Override the email header subtitle for this specific template (overrides global layout default)",
        example: "We received a request to sign in to your account.",
    })
    @IsString()
    @IsOptional()
    headerSubtitle?: string;

    @ApiPropertyOptional({
        description: `Body message content with Handlebars variables and optional markdown.

Available variables per action:
- OTP_LOGIN / OTP_REGISTER / OTP_FORGOT_PASSWORD: {{name}}, {{code}}
- DOCTOR_CREDENTIALS: {{name}}, {{email}}, {{password}}
- CONTACT_LEAD_REPLY: {{name}}, {{subject}}, {{message}}

OTP Rendering Rule:
To render a styled OTP code box, format two consecutive lines as:
  Line 1: ALL CAPS LABEL  (e.g. "ONE-TIME VERIFICATION CODE")
  Line 2: {{code}}        (the OTP variable)
  Line 3: Optional note text (e.g. "It expires in **10 minutes**.")

Bold Text: Wrap text in **double asterisks** for bold, e.g. **10 minutes**`,
        example: "Hi {{name}},\n\nONE-TIME VERIFICATION CODE\n{{code}}\n\nIt expires in **10 minutes**.",
    })
    @IsString()
    @IsOptional()
    content?: string;

    @ApiPropertyOptional({
        description: "Whether to show the info cards (Secure Access & Need Help) at the bottom of the email",
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    showInfoCards?: boolean;

    @ApiPropertyOptional({ description: "Title of the first info card", example: "SECURE ACCESS" })
    @IsString()
    @IsOptional()
    infoCard1Title?: string;

    @ApiPropertyOptional({ description: "Body text of the first info card", example: "This code helps us confirm it's really you and protects your account from unauthorized access." })
    @IsString()
    @IsOptional()
    infoCard1Text?: string;

    @ApiPropertyOptional({ description: "Title of the second info card (help section)", example: "NEED HELP?" })
    @IsString()
    @IsOptional()
    infoCard2Title?: string;

    @ApiPropertyOptional({ description: "Body text of the second info card", example: "If you did not request this email, ignore it or contact our team at support@weightlossmd.com." })
    @IsString()
    @IsOptional()
    infoCard2Text?: string;

    @ApiPropertyOptional({ description: "Whether the template is active" })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
