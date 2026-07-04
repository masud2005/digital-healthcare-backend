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

    // Seed Coverage Section
    const existingCoverage = await prisma.coverageSection.findFirst();
    if (!existingCoverage) {
        await prisma.coverageSection.create({
            data: {
                title: "Our Coverage",
                description: "We provide comprehensive coverage across multiple states.",
            },
        });
        console.log("✅ Seeded Coverage Section");
    }

    // Seed Medical Team Section
    const existingMedicalTeam = await prisma.medicalTeamSection.findFirst();
    if (!existingMedicalTeam) {
        await prisma.medicalTeamSection.create({
            data: {
                title: "Meet Our Medical Team",
                description:
                    "Our team consists of highly qualified professionals dedicated to your health.",
            },
        });
        console.log("✅ Seeded Medical Team Section");
    }

    // Seed Contact Side Widget
    const existingContactSideWidget = await prisma.contactSideWidget.findFirst();
    if (!existingContactSideWidget) {
        await prisma.contactSideWidget.create({
            data: {
                title: "Office Hours",
                opening: "Monday - Friday: 9 AM - 6 PM",
                offDay: "Our Office is closed from 2 PM to 3 PM for lunch during the week.",
                phone: "(720) 279-1164",
                email: "info@wlmd.net",
            },
        });
        console.log("✅ Seeded Contact Side Widget");
    }

    // Seed Contact Partner Section
    const existingContactPartnerSection = await prisma.contactPartnerSection.findFirst();
    if (!existingContactPartnerSection) {
        await prisma.contactPartnerSection.create({
            data: {
                sectionTitle: "Our partner pharmacies",
            },
        });
        console.log("✅ Seeded Contact Partner Section");
    }

    // Seed Lab Testing Hero
    const existingLabTestingHero = await prisma.labTestingHero.findFirst();
    if (!existingLabTestingHero) {
        await prisma.labTestingHero.create({
            data: {
                title: "WLMD Lab Tests",
                description: "Learn about our extensive lab testing services.",
                buttonText: "Book a consultation",
                buttonUrl: "https://weightlossmd.com",
                isBlank: true
            },
        });
        console.log("✅ Seeded Lab Testing Hero");
    }

    // Seed Lab Testing Section
    const existingLabTestingSection = await prisma.labTestingSection.findFirst();
    if (!existingLabTestingSection) {
        await prisma.labTestingSection.create({
            data: {
                sectionTitle: "See what's inside the panel",
                sectionDescription: "Measure what matters—up to 130 biomarker tests, twice a year on the Advanced plan."
            },
        });
        console.log("✅ Seeded Lab Testing Section");
    }

    console.log("✅ Website Manage seeding completed!");
};
