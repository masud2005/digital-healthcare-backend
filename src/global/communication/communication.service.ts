import { Injectable, Logger, ServiceUnavailableException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { MailService } from "@global/mail/mail.service";
import { SystemHealthService } from "@main/(compliance)/system-healthar/system-health.service";
import * as Handlebars from "handlebars";
import { CommunicationAction, CommunicationChannel } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { StorageService } from "@global/storage/storage.service";

@Injectable()
export class CommunicationService {
    private readonly logger = new Logger(CommunicationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
        private readonly systemHealthService: SystemHealthService,
        private readonly storageService: StorageService,
    ) {}

    async dispatch(options: {
        action: CommunicationAction;
        channel: CommunicationChannel;
        to: string;
        payload: Record<string, any>;
        attachments?: Array<{ filename: string; content: Buffer }>;
    }) {
        const { action, channel, to, payload, attachments } = options;

        // 1. Fetch Template
        let template: any = null;
        if (channel === "SMS") {
            template = await this.prisma.smsTemplate.findUnique({
                where: { action },
            });
        } else {
            template = await this.prisma.messageTemplate.findUnique({
                where: { action },
            });
        }

        // 2. Fetch Global Layout for EMAIL
        let globalLayout: any = null;
        let s3LogoBuffer: Buffer | null = null;
        if (channel === "EMAIL") {
            globalLayout = await this.prisma.emailLayout.findFirst({
                where: { name: "DEFAULT", isActive: true },
                include: { logo: true },
            });
            // Fetch S3 buffer for inline attachment if dynamic logo exists
            if (globalLayout?.logo?.fileUrl) {
                try {
                    s3LogoBuffer = await this.storageService.getFileBuffer(
                        globalLayout.logo.fileUrl,
                    );
                } catch (err) {
                    this.logger.warn(
                        `Failed to fetch dynamic logo from S3: ${(err as Error).message}`,
                    );
                }
            }
        }

        // Fallback templates logic if DB is empty
        const templateContent = template?.content ?? this.getFallbackContent(action, channel);
        const templateSubject = template?.subject ?? this.getFallbackSubject(action);

        if (!templateContent) {
            this.logger.error(`No template found for action ${action} and channel ${channel}`);
            throw new NotFoundException("Message template not found");
        }

        // 3. Compile with Handlebars
        const compiledSubject = Handlebars.compile(templateSubject)(payload);
        const compiledBody = Handlebars.compile(templateContent)(payload);

        // 4. Dispatch based on channel
        if (channel === "EMAIL") {
            const finalHtml = this.buildEmailHtml(compiledBody, globalLayout, template);
            const plainText = this.stripHtmlAndFormatPlain(compiledBody);

            // Attach logo as CID inline image (works in Gmail, Outlook, Apple Mail)
            let logoAttachment: { filename: string; content: Buffer; cid: string } | null = null;

            if (s3LogoBuffer) {
                logoAttachment = {
                    filename: "dynamic-logo.png", // Ext doesn't strictly matter for CID display, but you can parse it
                    content: s3LogoBuffer,
                    cid: "email-logo",
                };
            } else {
                logoAttachment = this.getFallbackLogoAttachment();
            }

            const allAttachments = [
                ...(logoAttachment ? [logoAttachment] : []),
                ...(attachments ?? []),
            ];

            await this.mailService.sendMail({
                to,
                subject: compiledSubject,
                html: finalHtml,
                text: plainText,
                attachments: allAttachments,
            });
        } else if (channel === "SMS") {
            await this.sendSms(to, compiledBody);
        }
    }

    /**
     * Builds the full HTML email from dynamic layout fields + template content.
     * Design is fixed in code; admin controls only the text content via DB fields.
     */
    private buildEmailHtml(compiledBody: string, layout: any | null, template: any | null): string {
        // ── Resolve layout values with fallbacks ──────────────────────────────
        const isBlack = layout?.isBlack ?? true;
        const logoSrc = "cid:email-logo";
        const logoBgColor = isBlack ? "#ffffff" : "#1b2622";

        const brandName = layout?.brandName ?? "WEIGHTLOSSMD";
        const headerTitle = template?.headerTitle ?? layout?.headerTitle ?? "System Notification";
        const headerSubtitle =
            template?.headerSubtitle ??
            layout?.headerSubtitle ??
            "We have an important update regarding your account.";

        const infoCard1Title = template?.infoCard1Title;
        const infoCard1Text = template?.infoCard1Text;
        const infoCard2Title = template?.infoCard2Title;
        const infoCard2Text = template?.infoCard2Text;
        const hasCard1 = !!infoCard1Title || !!infoCard1Text;
        const hasCard2 = !!infoCard2Title || !!infoCard2Text;
        const footerCompanyName = layout?.footerCompanyName ?? "WeightLossMD Support";
        const footerEmail = layout?.footerEmail ?? "support@weightlossmd.com";
        const footerTagline =
            layout?.footerTagline ??
            "This is an automated message. Please do not reply to this email.";
        const showInfoCards = template?.showInfoCards ?? true;

        // ── Parse body: detect OTP code block ─────────────────────────────────
        const bodyHtml = this.parseBodyToHtml(compiledBody);

        // ── Build complete email HTML ──────────────────────────────────────────
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
  <style>
    /* Reset */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f0f4f2;
      margin: 0;
      padding: 40px 20px;
    }

    /* Container */
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1b2622;
      border-radius: 20px;
      overflow: hidden;
      color: #ffffff;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    /* Header */
    .header {
      background: linear-gradient(135deg,#2c615b 0%,#5d8e87 48%,#18312c 100%);
      padding: 36px 40px;
    }
    .header-inner {
      display: table;
      width: 100%;
    }
    .header-logo-cell {
      display: table-cell;
      width: 140px;
      vertical-align: middle;
      padding-right: 28px;
    }
    .header-text-cell {
      display: table-cell;
      vertical-align: middle;
    }
    .header-logo-pill {
      display: inline-block;
      background-color: ${logoBgColor};
      border-radius: 12px;
      padding: 11px 16px;
      line-height: 0;
      box-shadow: 0 3px 14px rgba(0, 0, 0, 0.28);
    }
    .header-logo-pill img {
      display: block;
      height: 40px;
      width: auto;
      max-width: 130px;
    }
    .header-title {
      font-size: 26px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #ffffff;
      line-height: 1.2;
    }
    .header-subtitle {
      font-size: 14px;
      line-height: 1.6;
      color: #c4d9d3;
      margin: 0;
    }

    /* Content Area */
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 16px;
      color: #c8d8d4;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    /* OTP Code Box */
    .otp-wrapper {
      background-color: #212c29;
      border: 1px solid #2e3d38;
      border-radius: 16px;
      padding: 30px 24px;
      text-align: center;
      margin-bottom: 28px;
    }
    .otp-label {
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #8a9b96;
      margin-bottom: 20px;
    }
    .otp-code {
      display: inline-block;
      background-color: #2a3c36;
      border: 1px solid #3a5048;
      border-radius: 12px;
      padding: 18px 36px;
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #ffffff;
      font-family: 'Courier New', Courier, monospace;
    }
    .otp-note {
      font-size: 14px;
      color: #8a9b96;
      margin-top: 20px;
      line-height: 1.6;
    }
    .otp-note strong, .otp-note b {
      color: #ffffff;
    }

    /* Regular body text */
    .body-text {
      font-size: 15px;
      color: #c8d8d4;
      line-height: 1.8;
      margin-bottom: 10px;
      white-space: pre-wrap;
    }
    .body-text strong, .body-text b {
      color: #ffffff;
    }

    /* Info Cards Grid */
    .info-grid {
      display: table;
      width: 100%;
      margin-top: 12px;
    }
    .info-card {
      display: table-cell;
      width: 48%;
      background-color: #212c29;
      border: 1px solid #2e3d38;
      border-radius: 12px;
      padding: 22px;
      vertical-align: top;
    }
    .info-card-spacer {
      display: table-cell;
      width: 4%;
    }
    .info-card-title {
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #6b8880;
      margin-bottom: 12px;
      margin-top: 0;
    }
    .info-card p {
      font-size: 13px;
      line-height: 1.6;
      color: #b0c4be;
      margin: 0;
    }
    .info-card a {
      color: #dcb37b;
      text-decoration: none;
    }

    /* Footer */
    .footer {
      padding: 0 40px 20px 40px;
    }
    .footer-inner {
      border-top: 1px solid #2a3532;
      padding-top: 20px;
      font-size: 13px;
      color: #6b8880;
      line-height: 1.6;
    }
    .footer-inner a {
      color: #2475a3;
      text-decoration: none;
    }

    /* Responsive */
    @media only screen and (max-width: 600px) {
      body { padding: 20px 12px; }
      .header { padding: 28px 24px; }
      .header-title { font-size: 22px; }
      .content { padding: 28px 24px; }
      .footer { padding: 0 24px 28px 24px; }
      .info-card {
        display: block;
        width: 100%;
        margin-bottom: 12px;
        box-sizing: border-box;
      }
      .info-card-spacer { display: none; }
      .otp-code { font-size: 28px; letter-spacing: 5px; padding: 14px 24px; }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Header: Logo Left + Text Right -->
    <div class="header">
      <div class="header-inner">
        <div class="header-logo-cell">
          <span class="header-logo-pill">
            <img src="${logoSrc}" alt="${this.escapeHtml(brandName)}" />
          </span>
        </div>
        <div class="header-text-cell">
          <h1 class="header-title">${this.escapeHtml(headerTitle)}</h1>
          <p class="header-subtitle">${this.escapeHtml(headerSubtitle)}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      ${bodyHtml}

      ${
          showInfoCards && (hasCard1 || hasCard2)
              ? `
      <!-- Info Cards -->
      <div class="info-grid">
        ${
            hasCard1
                ? `
        <div class="info-card" style="width: ${hasCard2 ? "48%" : "100%"};">
          ${infoCard1Title ? `<h3 class="info-card-title">${this.escapeHtml(infoCard1Title)}</h3>` : ""}
          ${infoCard1Text ? `<p>${this.escapeHtml(infoCard1Text)}</p>` : ""}
        </div>
        `
                : ""
        }
        ${
            hasCard1 && hasCard2
                ? `
        <div class="info-card-spacer"></div>
        `
                : ""
        }
        ${
            hasCard2
                ? `
        <div class="info-card" style="width: ${hasCard1 ? "48%" : "100%"};">
          ${infoCard2Title ? `<h3 class="info-card-title">${this.escapeHtml(infoCard2Title)}</h3>` : ""}
          ${infoCard2Text ? `<p>${this.escapeHtml(infoCard2Text)}</p>` : ""}
        </div>
        `
                : ""
        }
      </div>
      `
              : ""
      }
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-inner">
        ${this.escapeHtml(footerCompanyName)} &bull;
        <a href="mailto:${this.escapeHtml(footerEmail)}">${this.escapeHtml(footerEmail)}</a><br>
        ${this.escapeHtml(footerTagline)}
      </div>
    </div>

  </div>
</body>
</html>`;
    }

    /**
     * Parses the compiled body text into HTML blocks.
     *
     * Body text format (what admin writes):
     *   "Hi {{name}},"              → greeting paragraph
     *   "SECTION LABEL"             → if followed by an OTP code line, renders OTP box
     *   "{{code}}"                  → OTP code (already compiled to digits by Handlebars)
     *   "Regular text"              → body-text paragraph
     *   "**bold text**"             → renders as <strong>
     */
    private parseBodyToHtml(compiledBody: string): string {
        const lines = compiledBody.split("\n");
        const htmlParts: string[] = [];

        let i = 0;
        while (i < lines.length) {
            const line = lines[i].trim();

            if (!line) {
                i++;
                continue;
            }

            // Detect OTP-style pattern:
            // Line is ALL CAPS label (e.g. "ONE-TIME VERIFICATION CODE")
            // followed by a line that is purely digits (6-digit OTP already resolved)
            const isOtpLabel = /^[A-Z][A-Z\s\-]+$/.test(line) && line.length > 3;
            const nextLine = lines[i + 1]?.trim() ?? "";
            const isNextLineCode = /^\d{4,8}$/.test(nextLine);

            if (isOtpLabel && isNextLineCode) {
                // Find the note line (comes after the code)
                const noteLine = lines[i + 2]?.trim() ?? "";

                htmlParts.push(`
      <div class="otp-wrapper">
        <div class="otp-label">${this.escapeHtml(line)}</div>
        <div class="otp-code">${this.escapeHtml(nextLine)}</div>
        ${noteLine ? `<div class="otp-note">${this.renderInlineMarkdown(noteLine)}</div>` : ""}
      </div>`);

                i += noteLine ? 3 : 2;
                continue;
            }

            // First line starting with "Hi " → greeting
            if (line.startsWith("Hi ") && htmlParts.length === 0) {
                htmlParts.push(`<p class="greeting">${this.renderInlineMarkdown(line)}</p>`);
                i++;
                continue;
            }

            // Regular text line
            htmlParts.push(`<p class="body-text">${this.renderInlineMarkdown(line)}</p>`);
            i++;
        }

        return htmlParts.join("\n      ");
    }

    /**
     * Converts **bold** markdown to <strong> HTML tags.
     */
    private renderInlineMarkdown(text: string): string {
        return this.escapeHtml(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    }

    /**
     * Escapes HTML special characters to prevent XSS.
     */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Strips HTML tags and formats the email as plain text.
     */
    private stripHtmlAndFormatPlain(body: string): string {
        return body.replace(/<[^>]*>?/gm, "").trim();
    }

    private async sendSms(phone: string, bodyText: string) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_FROM_NUMBER ?? process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !from) {
            this.logger.error("Twilio credentials or phone number is missing in .env");
            throw new ServiceUnavailableException("SMS provider is not configured properly");
        }

        const formattedPhone = phone.trim().replace(/\s+/g, "");

        const body = new URLSearchParams({
            To: formattedPhone,
            Body: bodyText,
            From: from,
        });

        const startTime = Date.now();
        try {
            const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body,
                },
            );

            const duration = Date.now() - startTime;
            if (!response.ok) {
                const errorBody = await response.text();
                this.logger.error(`Twilio SMS failed with status ${response.status}: ${errorBody}`);
                await this.systemHealthService.recordSmsDelivery(false, duration).catch(() => {});
                throw new ServiceUnavailableException("Unable to send SMS verification code");
            }

            await this.systemHealthService.recordSmsDelivery(true, duration).catch(() => {});
        } catch (error) {
            const duration = Date.now() - startTime;
            if (!(error instanceof ServiceUnavailableException)) {
                await this.systemHealthService.recordSmsDelivery(false, duration).catch(() => {});
            }
            throw error;
        }
    }

    private getFallbackContent(action: CommunicationAction, channel: CommunicationChannel): string {
        if (channel === "SMS") {
            switch (action) {
                case "OTP_LOGIN":
                    return "Your login code is {{code}}";
                case "OTP_REGISTER":
                    return "Your registration code is {{code}}";
                case "OTP_FORGOT_PASSWORD":
                    return "Your password reset code is {{code}}";
                default:
                    return "";
            }
        } else {
            switch (action) {
                case "OTP_LOGIN":
                    return "Hi {{name}},\n\nONE-TIME VERIFICATION CODE\n{{code}}\n\nEnter this code to sign in. It expires in **10 minutes**.";
                case "OTP_REGISTER":
                    return "Hi {{name}},\n\nEMAIL VERIFICATION CODE\n{{code}}\n\nEnter this code to verify your email. It expires in **10 minutes**.";
                case "OTP_FORGOT_PASSWORD":
                    return "Hi {{name}},\n\nPASSWORD RESET CODE\n{{code}}\n\nEnter this code to reset your password. It expires in **10 minutes**.";
                case "DOCTOR_CREDENTIALS":
                    return "Hi {{name}},\n\nYour login credentials:\n\nEmail: **{{email}}**\nPassword: **{{password}}**\n\nPlease change your password after first login.";
                case "CONTACT_LEAD_REPLY":
                    return "Hi {{name}},\n\n{{message}}";
                default:
                    return "";
            }
        }
    }

    private getFallbackSubject(action: CommunicationAction): string {
        switch (action) {
            case "OTP_LOGIN":
                return "Login Verification Code";
            case "OTP_REGISTER":
                return "Registration Verification Code";
            case "OTP_FORGOT_PASSWORD":
                return "Password Reset Verification Code";
            case "DOCTOR_CREDENTIALS":
                return "Your Doctor Account Credentials";
            case "CONTACT_LEAD_REPLY":
                return "{{subject}}";
            default:
                return "Notification from System";
        }
    }

    // ── Logo CID Attachment ────────────────────────────────────────────────────

    /** Cached logo buffer — read once, reused for every email. */
    private _logoBuffer: Buffer | null = null;

    /**
     * Returns the logo as a nodemailer CID inline attachment.
     * Using CID (Content-ID) instead of base64 data URI because Gmail
     * and most email clients BLOCK data: URIs for security reasons.
     * CID attachments are the industry-standard way to embed images in emails.
     */
    private getFallbackLogoAttachment(): { filename: string; content: Buffer; cid: string } | null {
        if (this._logoBuffer === null) {
            try {
                const relPath = path.join(
                    "global",
                    "communication",
                    "logo",
                    "weightLossMDLogo.png",
                );
                const devPath = path.join(process.cwd(), "src", relPath);
                const prodPath = path.join(process.cwd(), "dist", relPath);
                const logoPath = fs.existsSync(devPath) ? devPath : prodPath;
                this._logoBuffer = fs.readFileSync(logoPath);
            } catch {
                this.logger.warn("Logo file not found — emails will be sent without logo.");
                return null;
            }
        }

        return {
            filename: "weightLossMDLogo.png",
            content: this._logoBuffer,
            cid: "email-logo", // matches src="cid:email-logo" in HTML
        };
    }
}
