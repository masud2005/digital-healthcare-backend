import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync, randomBytes } from "crypto";

const PASSWORD_ITERATIONS = 120000;

export async function adminSeed(prisma: PrismaClient) {
	const email = "muhammadabrrar921@gmail.com"; // process.env.ADMIN_EMAIL?.trim().toLowerCase(); TODO: need to be use from env both email and password
	const password = "12345678"; // process.env.ADMIN_PASSWORD?.trim();
	const name = process.env.ADMIN_NAME?.trim() || "Admin";

	if (!email || !password) {
		console.log("Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD is missing");
		return;
	}

	const existing = await prisma.user.findUnique({
		where: { email },
		select: { id: true },
	});

	if (existing) {
		console.log(`Admin seed skipped: user already exists (${email})`);
		return;
	}

	const salt = randomBytes(16).toString("hex");
	const derived = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, "sha256").toString("hex");
	const passwordHash = `${salt}:${derived}`;

	await prisma.user.create({
		data: {
			name,
			email,
			passwordHash,
			role: "ADMIN",
			status: "ACTIVE",
			emailVerifiedAt: new Date(),
		},
	});

	console.log(`✅ Admin seed created: ${email}`);
}
