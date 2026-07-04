import { PrismaClient } from "@prisma/client";

export const websiteManageSeed = async (prisma: PrismaClient) => {
    console.log("🌱 Seeding Website Manage contents (HIPAA, Privacy, Terms)...");

    const hippaContent = `
        <h1>HIPAA Notice of Privacy Practices</h1>
        <p>This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.</p>
        <h2>Our Responsibilities</h2>
        <p>We are required by law to maintain the privacy and security of your protected health information.</p>
    `;

    const privacyContent = `
        <h1>Privacy Policy</h1>
        <p>Your privacy is important to us. It is our policy to respect your privacy regarding any information we may collect from you across our website.</p>
        <h2>Information We Collect</h2>
        <p>We only ask for personal information when we truly need it to provide a service to you.</p>
    `;

    const termsContent = `
        <h1>Terms of Service</h1>
        <p>These terms and conditions outline the rules and regulations for the use of our Website.</p>
        <h2>License</h2>
        <p>Unless otherwise stated, we own the intellectual property rights for all material on the website.</p>
    `;

    // Seed HIPAA Notice
    const existingHippa = await prisma.hippaNotice.findFirst();
    if (!existingHippa) {
        await prisma.hippaNotice.create({
            data: { content: hippaContent },
        });
        console.log("✅ Seeded HIPAA Notice");
    }

    // Seed Privacy Policy
    const existingPrivacy = await prisma.privacyPolicy.findFirst();
    if (!existingPrivacy) {
        await prisma.privacyPolicy.create({
            data: { content: privacyContent },
        });
        console.log("✅ Seeded Privacy Policy");
    }

    // Seed Terms of Service
    const existingTerms = await prisma.termsOfService.findFirst();
    if (!existingTerms) {
        await prisma.termsOfService.create({
            data: { content: termsContent },
        });
        console.log("✅ Seeded Terms of Service");
    }

    console.log("✅ Website Manage seeding completed!");
};
