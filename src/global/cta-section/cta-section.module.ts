import { PrismaModule } from "@global/prisma/prisma.module";
import { Global, Module } from "@nestjs/common";
import { CtaSectionController } from "./cta-section.controller";
import { CtaSectionService } from "./cta-section.service";

@Global()
@Module({
    imports: [PrismaModule],
    controllers: [CtaSectionController],
    providers: [CtaSectionService],
    exports: [CtaSectionService],
})
export class CtaSectionModule {}
