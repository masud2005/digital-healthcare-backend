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
                isBlank: true,
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
                sectionDescription:
                    "Measure what matters—up to 130 biomarker tests, twice a year on the Advanced plan.",
            },
        });
        console.log("✅ Seeded Lab Testing Section");
    }

    // Seed Report Side Effect
    const existingSymptom = await prisma.symptomSeverity.findFirst();
    if (!existingSymptom) {
        await prisma.symptomSeverity.createMany({
            data: [
                { text: "Mild - Manageable, not affecting daily life", order: 1 },
                { text: "Moderate - Affecting daily activities", order: 2 },
                { text: "Severe - Significant impact, may need medical attention", order: 3 },
                { text: "Life-threatening - Requires immediate emergency care", order: 4 },
            ],
        });
        console.log("✅ Seeded Symptom Severity");
    }

    const existingWidget = await prisma.emergencyContactWidget.findFirst();
    if (!existingWidget) {
        await prisma.emergencyContactWidget.create({
            data: {
                sectionTitle: "Billing FAQ",
                contacts: {
                    create: [
                        {
                            title: "Emergency Line",
                            contact: "911",
                            notes: "For life-threatening emergencies",
                            order: 1,
                        },
                        {
                            title: "Clinical Support",
                            contact: "1-800-555-0199",
                            notes: "Mon-Sun, 7AM-10PM CT",
                            order: 2,
                        },
                    ],
                },
            },
        });
        console.log("✅ Seeded Emergency Contact Widget");
    }

    // Seed Request Records
    const existingRequestRecordsWidget = await prisma.requestRecordWidget.findFirst();
    if (!existingRequestRecordsWidget) {
        await prisma.requestRecordWidget.create({
            data: {
                title: "Processing Time",
                order: 1,
                items: {
                    create: [
                        { text: "Medical Records: Up to 30 days", order: 1 },
                        { text: "Prescription History: 3-5 business days", order: 2 },
                        { text: "Billing Records: 1-3 business days", order: 3 },
                        { text: "Account Deletion: Up to 45 days", order: 4 },
                    ]
                }
            }
        });
        await prisma.requestRecordWidget.create({
            data: {
                title: "HIPAA Rights",
                order: 2,
                items: {
                    create: [
                        { text: "Right to access your medical records", order: 1 },
                        { text: "Right to request corrections", order: 2 },
                        { text: "Right to receive an accounting of disclosures", order: 3 },
                        { text: "Right to restrict certain uses", order: 4 },
                        { text: "Right to receive records in electronic format", order: 5 },
                    ]
                }
            }
        });
        console.log("✅ Seeded Request Records Widgets");
    }

    console.log("✅ Website Manage seeding completed!");
};
