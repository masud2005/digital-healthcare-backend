type DoctorCredentialEmailInput = {
    name: string;
    email: string;
    password: string;
};

const BRAND_NAME = "WeightLossMD";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@weightlossmd.com";

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function buildDoctorCredentialEmail({ name, email, password }: DoctorCredentialEmailInput) {
    const safeName = escapeHtml(name || "Doctor");
    const safeEmail = escapeHtml(email);
    const safePassword = escapeHtml(password);
    const subject = `${BRAND_NAME} doctor account credentials`;

    const text = [
        `Hi ${name || "Doctor"},`,
        "",
        "Your doctor account has been created.",
        "",
        `Email: ${email}`,
        `Password: ${password}`,
        "",
        "Use these credentials to sign in.",
        "",
        `Need help? Contact ${SUPPORT_EMAIL}`,
    ].join("\n");

    const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#12211d;background:#ffffff;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${subject}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:rgba(11,24,21,0.92);border:1px solid rgba(154,184,169,0.16);border-radius:28px;overflow:hidden;box-shadow:0 22px 60px rgba(0,0,0,0.38);">
            <tr>
              <td style="padding:28px 32px 18px;background:linear-gradient(135deg,#2c615b 0%,#5d8e87 48%,#18312c 100%);">
                <div style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.78);margin-bottom:10px;">${BRAND_NAME}</div>
                <div style="font-size:30px;line-height:1.15;font-weight:700;color:#ffffff;">Doctor account created</div>
                <div style="margin-top:10px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.88);max-width:520px;">Your doctor account has been created. Use the credentials below to sign in securely.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px 10px;">
                <div style="font-size:14px;line-height:1.6;color:#c7d1cb;margin-bottom:14px;">Hi ${safeName},</div>
                <div style="background:linear-gradient(180deg,rgba(243,248,245,0.08) 0%,rgba(17,33,29,0.95) 100%);border:1px solid rgba(255,255,255,0.08);border-radius:22px;padding:24px 18px;">
                  <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9fc5ba;margin-bottom:16px;text-align:center;">Login credentials</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;background:rgba(255,255,255,0.03);">
                    <tr>
                      <td style="padding:14px 16px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9fc5ba;width:110px;">Email</td>
                      <td style="padding:14px 16px;font-size:14px;line-height:1.6;color:#ffffff;">${safeEmail}</td>
                    </tr>
                    <tr>
                      <td style="padding:14px 16px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9fc5ba;width:110px;border-top:1px solid rgba(255,255,255,0.08);">Password</td>
                      <td style="padding:14px 16px;font-size:16px;line-height:1.4;font-weight:700;color:#ffffff;border-top:1px solid rgba(255,255,255,0.08);font-family:'Courier New',Courier,monospace;">${safePassword}</td>
                    </tr>
                  </table>
                  <div style="margin-top:16px;font-size:13px;line-height:1.7;color:#bbcbc4;text-align:center;">Use this password to sign in to your doctor account.</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 4px;">
                <div style="display:flex;flex-wrap:wrap;gap:18px;">
                  <div style="flex:1;min-width:190px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:18px;padding:16px 18px;">
                    <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#9fc5ba;margin-bottom:8px;">Secure access</div>
                    <div style="font-size:13px;line-height:1.7;color:#dfe8e3;">Keep these credentials private and use them only for your own account access.</div>
                  </div>
                  <div style="flex:1;min-width:190px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:18px;padding:16px 18px;">
                    <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#9fc5ba;margin-bottom:8px;">Need help?</div>
                    <div style="font-size:13px;line-height:1.7;color:#dfe8e3;">If you did not expect this email, contact our team at <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#f0c874;text-decoration:none;">${escapeHtml(SUPPORT_EMAIL)}</a>.</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 30px;">
                <div style="height:1px;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.12) 50%,transparent 100%);margin-bottom:18px;"></div>
                <div style="font-size:12px;line-height:1.8;color:#9fb2ab;">
                  ${BRAND_NAME} Support • ${escapeHtml(SUPPORT_EMAIL)}
                </div>
                <div style="font-size:12px;line-height:1.8;color:#7d928a;margin-top:8px;">
                  This is an automated message. Please do not reply to this email.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    return { subject, text, html };
}
