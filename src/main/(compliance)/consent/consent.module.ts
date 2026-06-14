import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { ExportModule } from "@global/export/export.module";
import { ConsentController } from "./consent.controller";
import { ConsentRepository } from "./consent.repository";
import { ConsentService } from "./consent.service";

@Module({
    imports: [PrismaModule, ExportModule],
    controllers: [ConsentController],
    providers: [ConsentService, ConsentRepository],
    exports: [ConsentService, ConsentRepository],
})
export class ConsentModule {}
