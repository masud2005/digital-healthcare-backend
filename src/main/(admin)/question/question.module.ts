import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { QuestionOptionController } from "./question-option/question-option.controller";
import { QuestionOptionRepository } from "./question-option/question-option.repository";
import { QuestionOptionService } from "./question-option/question-option.service";
import { QuestionController } from "./question.controller";
import { QuestionRepository } from "./question.repository";
import { QuestionService } from "./question.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [QuestionController, QuestionOptionController],
    providers: [QuestionService, QuestionRepository, QuestionOptionService, QuestionOptionRepository],
})
export class QuestionModule {}
