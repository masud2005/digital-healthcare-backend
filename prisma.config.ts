import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "path";
// dose-ignore
import { defineConfig, env } from "prisma/config";

// dose-ignore
expand(config({ path: path.resolve(process.cwd(), ".env") }));
export default defineConfig({
    schema: "prisma/models",
    migrations: {
        path: "prisma/migrations",
        // seed: "tsx prisma/seed.ts",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});
