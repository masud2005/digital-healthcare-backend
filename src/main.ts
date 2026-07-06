import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import "reflect-metadata";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "https://client.weightlossmdcherrycreek.com",
            "https://doc-frontend-omega.vercel.app",
            "https://doc-dashboard-delta.vercel.app",
            "https://dashboard.weightlossmdcherrycreek.com",
            "https://impracticably-sclerometric-niki.ngrok-free.dev",
            "http://127.0.0.1:5500",
            "https://doc-frontend-pied.vercel.app",
            "https://localhost:3000"
        ],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true,
    });
    app.use(cookieParser());
    app.use(json({ limit: "512mb" }));
    app.use(urlencoded({ limit: "512mb", extended: true }));
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    //global prefix for api
    app.setGlobalPrefix("/api/v1");

    // ✅ Swagger config with Bearer Auth
    const adminConfig = new DocumentBuilder()
        .setTitle("Admin API")
        .setDescription("API endpoints for Admin operations")
        .setVersion("1.0")
        .addBearerAuth()
        .build();

    const authConfig = new DocumentBuilder()
        .setTitle("Auth API")
        .setDescription("API endpoints for Authentication and User management")
        .setVersion("1.0")
        .addBearerAuth()
        .build();

    const patientConfig = new DocumentBuilder()
        .setTitle("Patient API")
        .setDescription("API endpoints for Patient operations")
        .setVersion("1.0")
        .addBearerAuth()
        .build();

    const complianceConfig = new DocumentBuilder()
        .setTitle("Compliance API")
        .setDescription("API endpoints for Compliance and System Health")
        .setVersion("1.0")
        .addBearerAuth()
        .build();

    const globalConfig = new DocumentBuilder()
        .setTitle("Doc API (All)")
        .setDescription("Full API documentation for the Doc System")
        .setVersion("1.0")
        .addBearerAuth()
        .build();

    // Import modules dynamically to avoid circular references at runtime
    const { AdminModule } = require("./main/(admin)/admin.module");
    const { AuthModule } = require("./main/auth/auth.module");
    const { PatientModule } = require("./main/(patient)/patient.module");
    const { ComplianceModule } = require("./main/(compliance)/compliance.module");

    // Setup Admin Docs
    const adminDocument = SwaggerModule.createDocument(app, adminConfig, {
        include: [AdminModule],
        deepScanRoutes: true,
    });
    SwaggerModule.setup("docs/admin", app, adminDocument, {
        swaggerOptions: { persistAuthorization: true },
    });

    // Setup Auth Docs
    const authDocument = SwaggerModule.createDocument(app, authConfig, {
        include: [AuthModule],
        deepScanRoutes: true,
    });
    SwaggerModule.setup("docs/auth", app, authDocument, {
        swaggerOptions: { persistAuthorization: true },
    });

    // Setup Patient Docs
    const patientDocument = SwaggerModule.createDocument(app, patientConfig, {
        include: [PatientModule],
        deepScanRoutes: true,
    });
    SwaggerModule.setup("docs/patient", app, patientDocument, {
        swaggerOptions: { persistAuthorization: true },
    });

    // Setup Compliance Docs
    const complianceDocument = SwaggerModule.createDocument(app, complianceConfig, {
        include: [ComplianceModule],
        deepScanRoutes: true,
    });
    SwaggerModule.setup("docs/compliance", app, complianceDocument, {
        swaggerOptions: { persistAuthorization: true },
    });

    // Setup Global Docs
    const globalDocument = SwaggerModule.createDocument(app, globalConfig, {
        deepScanRoutes: true,
    });
    SwaggerModule.setup("docs", app, globalDocument, {
        swaggerOptions: { persistAuthorization: true },
    });

    // dose-ignore
    console.log("Server running at: " + (process.env.PORT ?? 3031));
    // dose-ignore
    await app.listen(process.env.PORT ?? 3031);
}
bootstrap();
