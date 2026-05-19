import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { QuestionController } from "./question.controller";
import { QuestionRepository } from "./question.repository";
import { QuestionService } from "./question.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [QuestionController],
    providers: [QuestionService, QuestionRepository],
})
export class QuestionModule {}
