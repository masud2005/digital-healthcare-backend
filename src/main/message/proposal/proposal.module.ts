import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { NotificationModule } from "../../notification/notification.module";
import { ProposalController } from "./proposal.controller";
import { ProposalRepository } from "./proposal.repository";
import { ProposalService } from "./proposal.service";

@Module({
    imports: [PrismaModule, NotificationModule],
    controllers: [ProposalController],
    providers: [ProposalService, ProposalRepository],
})
export class ProposalModule {}
