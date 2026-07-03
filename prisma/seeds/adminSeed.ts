import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync, randomBytes } from "crypto";

const PASSWORD_ITERATIONS = 120000;

const adminAccounts = [
    "muhammadabrrar921@gmail.com",
    "ashimsarkar5558@gmail.com",
    "masud.softvenceomega@gmail.com",
    "devlopersabbir@gmail.com",
    "doc4881@gmail.com",
    "alif.mia@softvence.com",
    "mrshaikot01@gmail.com",
];

function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derived = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, "sha256").toString("hex");
    return `${salt}:${derived}`;
}

export async function adminSeed(prisma: PrismaClient) {
    const password = "12345678"; // process.env.ADMIN_PASSWORD?.trim();
    const name = process.env.ADMIN_NAME?.trim() || "Admin";

    if (!password) {
        console.log("Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD is missing");
        return;
    }

    const role = await prisma.role.upsert({
        where: { name: "ADMIN" },
        update: { isActive: true },
        create: {
            name: "ADMIN",
            displayName: "Admin",
            isSystem: true,
        },
    });

    for (const email of adminAccounts) {
        const passwordHash = hashPassword(password);
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name,
                password: passwordHash,
                status: "ACTIVE",
                emailVerifiedAt: new Date(),
            },
            create: {
                name,
                email,
                password: passwordHash,
                status: "ACTIVE",
                emailVerifiedAt: new Date(),
            },
        });

        await prisma.userRole.upsert({
            where: {
                userId_roleId: {
                    userId: user.id,
                    roleId: role.id,
                },
            },
            update: {},
            create: {
                userId: user.id,
                roleId: role.id,
            },
        });

        console.log(`✅ Admin seed ensured: ${email}`);
    }
}
