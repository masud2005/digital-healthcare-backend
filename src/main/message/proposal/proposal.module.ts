import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { ProposalController } from "./proposal.controller";
import { ProposalRepository } from "./proposal.repository";
import { ProposalService } from "./proposal.service";

@Module({
    imports: [PrismaModule],
    controllers: [ProposalController],
    providers: [ProposalService, ProposalRepository],
})
export class ProposalModule {}
