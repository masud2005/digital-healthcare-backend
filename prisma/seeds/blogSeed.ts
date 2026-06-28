import { PrismaClient, CategoryStatus } from "@prisma/client";
import slugify from "slugify";

export async function blogSeed(prisma: PrismaClient) {
    console.log("🌱 Starting blog seeding...");

    // 1. Get or create an admin author
    const author = await prisma.user.findFirst({
        where: {
            userRoles: {
                some: {
                    role: {
                        name: "ADMIN",
                    },
                },
            },
        },
    });

    if (!author) {
        console.log("❌ No admin user found for seeding blogs. Please run admin seed first.");
        return;
    }

    // 2. Ensure default categories exist
    const categoriesToSeed = [
        { name: "Weight Loss", description: "Medical weight management and health programs" },
        { name: "Hormone Therapy", description: "Hormonal optimization and replacement" },
        { name: "Regrow Hair", description: "Advanced hair regrowth and retention systems" },
        { name: "Men's Services", description: "Tailored services for men's wellness and strength" },
        { name: "Skin Services", description: "Aesthetic skincare and medical skin procedures" },
    ];

    const categoryMap: Record<string, string> = {};

    for (const cat of categoriesToSeed) {
        const slug = slugify(cat.name, { lower: true });
        const category = await prisma.category.upsert({
            where: { slug },
            update: { name: cat.name, description: cat.description, status: CategoryStatus.ACTIVE },
            create: { name: cat.name, slug, description: cat.description, status: CategoryStatus.ACTIVE },
        });
        categoryMap[cat.name] = category.id;
    }
    console.log("✅ Categories ensured");

    // 3. Ensure a doctor profile exists (to display doctor image/book consultations)
    let doctor = await prisma.doctorProfile.findFirst({
        include: { avatar: true },
    });

    if (!doctor) {
        // Create a doctor user
        const doctorUserEmail = "seeded.doctor@example.com";
        const doctorUser = await prisma.user.upsert({
            where: { email: doctorUserEmail },
            update: { name: "Dr. Ryan Vance, NP", status: "ACTIVE" },
            create: { name: "Dr. Ryan Vance, NP", email: doctorUserEmail, status: "ACTIVE" },
        });

        // Add Doctor role
        const docRole = await prisma.role.upsert({
            where: { name: "DOCTOR" },
            update: { isActive: true },
            create: { name: "DOCTOR", displayName: "Doctor", isSystem: true },
        });

        await prisma.userRole.upsert({
            where: { userId_roleId: { userId: doctorUser.id, roleId: docRole.id } },
            update: {},
            create: { userId: doctorUser.id, roleId: docRole.id },
        });

        // Create doctor avatar attachment
        const doctorAvatar = await prisma.attachment.create({
            data: {
                fileName: "ryan_vance_avatar.jpg",
                fileUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80",
                fileType: "image/jpeg",
                fileSize: 45000,
                context: "PUBLIC",
            },
        });

        doctor = await prisma.doctorProfile.upsert({
            where: { userId: doctorUser.id },
            update: { name: "Dr. Ryan Vance, NP", avatarId: doctorAvatar.id, title: "Medical Director", bio: "Expert in hormone therapy and medical weight management." },
            create: {
                userId: doctorUser.id,
                name: "Dr. Ryan Vance, NP",
                avatarId: doctorAvatar.id,
                title: "Medical Director",
                bio: "Expert in hormone therapy and medical weight management.",
            },
            include: { avatar: true },
        });
    }
    console.log("✅ Provider (doctor profile) ensured");

    // 4. Seed Dummy Blogs with Stock Photos
    const dummyBlogs = [
        {
            title: "Sildenafil & Tadalafil: Treatment Options & Evaluation",
            content: `<h3>Exploring ED Treatments</h3><p>Sildenafil and Tadalafil are two of the most widely used and clinically proven treatments for erectile dysfunction (ED). While they function similarly by relaxing blood vessels and increasing blood flow, they have key differences in terms of active duration and onset.</p><p>Talk with a licensed clinician to evaluate which option fits your lifestyle and medical history best.</p>`,
            categoryName: "Men's Services",
            imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&h=450&q=80",
        },
        {
            title: "3 Male Body Types: Ectomorph, Mesomorph, and Endomorph",
            content: `<h3>Understanding Your Body Type</h3><p>Your genetics influence how you store fat, build muscle, and process nutrients. By identifying whether your body type leans more toward ectomorph (lean, fast metabolism), mesomorph (athletic, naturally muscular), or endomorph (broader frame, slower metabolism), you can tailor your diet and training program for optimal results.</p>`,
            categoryName: "Weight Loss",
            imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&h=450&q=80",
        },
        {
            title: "Protein and Hair Growth: Why It Matters for Healthy Hair",
            content: `<h3>The Science of Hair Strength</h3><p>Hair is primarily composed of keratin, a tough protein. A lack of high-quality protein in your diet can trigger hair thinning or shedding as the body redirects protein usage away from non-essential hair growth. Incorporating clean protein sources and targeted topical treatments can revitalize hair roots and support thicker, healthier hair growth.</p>`,
            categoryName: "Regrow Hair",
            imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&h=450&q=80",
        },
        {
            title: "Does Enclomiphene Increase Testosterone?",
            content: `<h3>A Non-Invasive Approach to Testosterone</h3><p>Enclomiphene citrate works by blocking estrogen receptors in the brain, prompting the pituitary gland to release luteinizing hormone (LH) and follicle-stimulating hormone (FSH). This stimulates your body's natural production of testosterone, offering an effective option for men experiencing symptoms of low T without the fertility risks associated with traditional TRT.</p>`,
            categoryName: "Hormone Therapy",
            imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&h=450&q=80",
        },
        {
            title: "Does Shilajit Increase Testosterone Levels?",
            content: `<h3>Natural Remedies & Clinical Insights</h3><p>Shilajit, a mineral-rich organic substance gathered in high mountain ranges, has been used in traditional medicine for centuries. Modern studies suggest purified Shilajit may help improve sperm counts and support natural testosterone production, but how does it stack up against clinical-grade therapies? Let's break down the data.</p>`,
            categoryName: "Men's Services",
            imageUrl: "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=800&h=450&q=80",
        },
        {
            title: "Enclomiphene Price Guide: Average Costs and Alternatives",
            content: `<h3>Budgeting for Hormone Health</h3><p>When starting testosterone support therapy, understanding the monthly cost of medications, follow-up lab tests, and clinical consultations is critical. Here is a comprehensive breakdown of average Enclomiphene costs, savings plans, and alternative therapies for low testosterone management.</p>`,
            categoryName: "Hormone Therapy",
            imageUrl: "https://images.unsplash.com/photo-1612253692010-333f2da6031d?auto=format&fit=crop&w=800&h=450&q=80",
        },
    ];

    for (const blogItem of dummyBlogs) {
        const slug = slugify(blogItem.title, { lower: true });
        const categoryId = categoryMap[blogItem.categoryName];

        if (!categoryId) {
            console.log(`⚠️ Category ${blogItem.categoryName} missing for blog "${blogItem.title}". Skipping.`);
            continue;
        }

        // Create Featured Image Attachment
        const imgAttachment = await prisma.attachment.create({
            data: {
                fileName: `${slug}_featured.jpg`,
                fileUrl: blogItem.imageUrl,
                fileType: "image/jpeg",
                fileSize: 85000,
                context: "PUBLIC",
            },
        });

        await prisma.blog.upsert({
            where: { slug },
            update: {
                title: blogItem.title,
                content: blogItem.content,
                isPublished: true,
                categoryId,
                providerId: doctor.id,
                featuredImageId: imgAttachment.id,
            },
            create: {
                title: blogItem.title,
                slug,
                content: blogItem.content,
                isPublished: true,
                authorId: author.id,
                categoryId,
                providerId: doctor.id,
                featuredImageId: imgAttachment.id,
            },
        });
        console.log(`✅ Seeded blog: ${blogItem.title}`);
    }

    console.log("🎉 Blog seeding completed successfully.");
}
