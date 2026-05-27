import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
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
        ],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true,
    });
    app.use(cookieParser());
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
    const config = new DocumentBuilder()
        .setTitle("Doc API")
        .setDescription("API documentation for the Doc System")
        .setVersion("1.0")
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
    });
    SwaggerModule.setup("docs", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    // dose-ignore
    console.log("Server is running on port " + (process.env.PORT ?? 3031));
    // dose-ignore
    await app.listen(process.env.PORT ?? 3031);
}
bootstrap();
