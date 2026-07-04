import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "path";
import { adminSeed } from "./adminSeed";
import { systemHealthSeed } from "./systemHealthSeed";
import { consentSeed } from "./consentSeed";
import { communicationTemplateSeed } from "./communicationTemplateSeed";
import { permissionSeed } from "./permissionSeed";
import { blogSeed } from "./blogSeed";
import { pageSectionsSeed } from "./pageSectionsSeed";
import { heroSeed } from "./heroSeed";
import { sideWidgetSeed } from "./sideWidgetSeed";

expand(config({ path: path.resolve(process.cwd(), ".env") }));

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Prisma seed started");
    await adminSeed(prisma);
    await permissionSeed(prisma);
    // await systemHealthSeed(prisma);
    // await consentSeed(prisma);
    await communicationTemplateSeed(prisma);
    await blogSeed(prisma);
    await pageSectionsSeed(prisma);
    await heroSeed(prisma);
    await sideWidgetSeed(prisma);
    console.log("✅ Prisma seed finished");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
