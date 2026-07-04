import { Module } from "@nestjs/common";
import { HowItWorksController } from "./how-it-works.controller";
import { HowItWorksService } from "./how-it-works.service";
import { HowItWorksRepository } from "./how-it-works.repository";

@Module({
    controllers: [HowItWorksController],
    providers: [HowItWorksService, HowItWorksRepository],
})
export class HowItWorksModule {}
