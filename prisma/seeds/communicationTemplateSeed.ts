import { PrismaClient, CommunicationAction, CommunicationChannel } from "@prisma/client";

export async function communicationTemplateSeed(prisma: PrismaClient) {
    console.log("Seeding Communication Templates...");

    // ─── Seed Global Layout (Dynamic Content Fields) ───────────────────────────
    await prisma.emailLayout.upsert({
        where: { name: "DEFAULT" },
        update: {},
        create: {
            name: "DEFAULT",
            isActive: true,

            // Brand & Header Section
            brandName: "WEIGHTLOSSMD",
            headerTitle: "System Notification",
            headerSubtitle: "We have an important update regarding your account.",

            // Footer
            footerCompanyName: "WeightLossMD Support",
            footerEmail: "support@weightlossmd.com",
            footerTagline: "This is an automated message. Please do not reply to this email.",
        },
    });

    // ─── Seed Message Templates ────────────────────────────────────────────────

    const templates: {
        action: CommunicationAction;
        channel: CommunicationChannel;
        subject: string;
        headerTitle: string;
        headerSubtitle: string;
        content: string;
        showInfoCards: boolean;
        infoCard1Title?: string;
        infoCard1Text?: string;
        infoCard2Title?: string;
        infoCard2Text?: string;
        isActive: boolean;
    }[] = [
        {
            action: "OTP_LOGIN",
            channel: "EMAIL",
            subject: "Secure login verification",
            headerTitle: "Secure login verification",
            headerSubtitle:
                "We received a request to sign in to your account. Use the code below to continue your login securely.",
            content:
                "Hi {{name}},\n\nONE-TIME VERIFICATION CODE\n{{code}}\n\nEnter this code to sign in with your code. It expires in **10 minutes**.",
            showInfoCards: true,
            infoCard1Title: "SECURE ACCESS",
            infoCard1Text:
                "This code helps us confirm it's really you and protects your account from unauthorized access.",
            infoCard2Title: "NEED HELP?",
            infoCard2Text:
                "If you did not request this email, ignore it or contact our team at support@weightlossmd.com.",
            isActive: true,
        },
        {
            action: "OTP_REGISTER",
            channel: "EMAIL",
            subject: "Verify your email address",
            headerTitle: "Verify your email address",
            headerSubtitle:
                "Welcome to WeightLossMD! Use the verification code below to complete your registration.",
            content:
                "Hi {{name}},\n\nEMAIL VERIFICATION CODE\n{{code}}\n\nEnter this code to verify your email address. It expires in **10 minutes**.",
            showInfoCards: true,
            infoCard1Title: "SECURE ACCESS",
            infoCard1Text:
                "This code helps us confirm it's really you and protects your account from unauthorized access.",
            infoCard2Title: "NEED HELP?",
            infoCard2Text:
                "If you did not request this email, ignore it or contact our team at support@weightlossmd.com.",
            isActive: true,
        },
        {
            action: "OTP_FORGOT_PASSWORD",
            channel: "EMAIL",
            subject: "Password reset request",
            headerTitle: "Password reset request",
            headerSubtitle:
                "We received a request to reset your password. Use the code below to continue securely.",
            content:
                "Hi {{name}},\n\nPASSWORD RESET CODE\n{{code}}\n\nEnter this code to reset your password. It expires in **10 minutes**. If you did not request this, please ignore this email.",
            showInfoCards: true,
            infoCard1Title: "SECURE ACCESS",
            infoCard1Text:
                "This code helps us confirm it's really you and protects your account from unauthorized access.",
            infoCard2Title: "NEED HELP?",
            infoCard2Text:
                "If you did not request this email, ignore it or contact our team at support@weightlossmd.com.",
            isActive: true,
        },
        {
            action: "DOCTOR_CREDENTIALS",
            channel: "EMAIL",
            subject: "Account access details",
            headerTitle: "Account access details",
            headerSubtitle: "An administrator has granted you access to the WeightLossMD platform.",
            content:
                "Hi {{name}},\n\nYour secure login credentials are provided below:\n\nEmail: **{{email}}**\nPassword: **{{password}}**\n\nFor your security, please log in and change your password immediately.",
            showInfoCards: false,
            isActive: true,
        },
        {
            action: "CONTACT_LEAD_REPLY",
            channel: "EMAIL",
            subject: "Reply: {{subject}}",
            headerTitle: "We've replied to your inquiry",
            headerSubtitle: "We're following up regarding your recent inquiry with our team.",
            content:
                "Hi {{name}},\n\nWe're following up regarding your recent inquiry:\n\n{{message}}\n\nIf you have any further questions, please feel free to reply to this email.",
            showInfoCards: false,
            isActive: true,
        },
        {
            action: "ORDER_CONFIRMATION",
            channel: "EMAIL",
            subject: "Order Confirmation #{{orderId}}",
            headerTitle: "Your Order is Confirmed!",
            headerSubtitle: "Thank you for shopping with WeightLossMD.",
            content:
                "Hi {{name}},\n\nYour order **#{{orderId}}** for the total amount of **${{amount}}** has been confirmed.\n\nHere are the details of your order:\n\n{{items}}\n\nWe will notify you once it has been shipped.",
            showInfoCards: true,
            isActive: true,
        },
        {
            action: "PAYMENT_RECEIPT",
            channel: "EMAIL",
            subject: "Payment Receipt for #{{orderId}}",
            headerTitle: "Payment Received",
            headerSubtitle: "We have successfully processed your payment.",
            content:
                "Hi {{name}},\n\nThis email confirms that we have received your payment of **${{amount}}** for order **#{{orderId}}**.\n\nThank you for choosing WeightLossMD.",
            showInfoCards: false,
            isActive: true,
        },
    ];

    for (const t of templates) {
        await prisma.messageTemplate.upsert({
            where: { action: t.action },
            update: {},
            create: {
                action: t.action,
                channel: t.channel,
                subject: t.subject,
                headerTitle: t.headerTitle,
                headerSubtitle: t.headerSubtitle,
                content: t.content,
                showInfoCards: t.showInfoCards,
                infoCard1Title: t.infoCard1Title,
                infoCard1Text: t.infoCard1Text,
                infoCard2Title: t.infoCard2Title,
                infoCard2Text: t.infoCard2Text,
                isActive: t.isActive,
            },
        });
    }

    // ─── Seed SMS Templates ────────────────────────────────────────────────
    const smsTemplates: {
        action: CommunicationAction;
        channel: CommunicationChannel;
        content: string;
        isActive: boolean;
    }[] = [
        {
            action: "OTP_LOGIN",
            channel: "SMS",
            content:
                "Your WeightLossMD login verification code is: {{code}}. It expires in 10 minutes.",
            isActive: true,
        },
        {
            action: "OTP_REGISTER",
            channel: "SMS",
            content:
                "Your WeightLossMD registration verification code is: {{code}}. It expires in 10 minutes.",
            isActive: true,
        },
        {
            action: "OTP_FORGOT_PASSWORD",
            channel: "SMS",
            content:
                "Your WeightLossMD password reset code is: {{code}}. It expires in 10 minutes.",
            isActive: true,
        },
    ];

    for (const t of smsTemplates) {
        await prisma.smsTemplate.upsert({
            where: { action: t.action },
            update: {},
            create: {
                action: t.action,
                channel: t.channel,
                content: t.content,
                isActive: t.isActive,
            },
        });
    }

    console.log("✅ Communication Templates seeded successfully");
}
