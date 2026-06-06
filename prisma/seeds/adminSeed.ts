import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync, randomBytes } from "crypto";

const PASSWORD_ITERATIONS = 120000;

export async function adminSeed(prisma: PrismaClient) {
	const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
	const password = process.env.ADMIN_PASSWORD?.trim();
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
	const role = await prisma.role.upsert({
		where: { name: "ADMIN" },
		update: { isActive: true },
		create: {
			name: "ADMIN",
			displayName: "Admin",
			isSystem: true,
		},
	});
	const user = await prisma.user.create({
		data: {
			name,
			email,
			password: passwordHash,
			status: "ACTIVE",
			emailVerifiedAt: new Date(),
		},
	});

	await prisma.userRole.create({
		data: {
			userId: user.id,
			roleId: role.id,
		},
	});

	console.log(`✅ Admin seed created: ${email}`);
}
