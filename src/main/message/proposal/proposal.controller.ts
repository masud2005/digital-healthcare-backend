import { Roles } from "@common/decorators";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { RolesGuard } from "@common/guards";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Body, Controller, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AcceptProposalDto } from "./dto/proposal.dto";
import { ProposalService } from "./proposal.service";

@ApiTags("(Patient / Doctor)Proposal")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("proposal")
export class ProposalController {
    constructor(private readonly proposalService: ProposalService) {}

    @Patch(":id/reject")
    @Roles("DOCTOR", "PATIENT")
    @ApiOperation({ summary: "Reject a proposal (DOCTOR or PATIENT)" })
    async rejectProposal(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
        const data = await this.proposalService.rejectProposal(id, user.id);
        return { success: true, statusCode: 200, message: "Proposal rejected successfully.", data };
    }

    @Post(":id/accept")
    @Roles("PATIENT")
    @ApiOperation({ summary: "Accept a proposal and store payment info (PATIENT only)" })
    async acceptProposal(
        @Param("id") id: string,
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: AcceptProposalDto,
    ) {
        const data = await this.proposalService.acceptProposal(id, user.id, dto);
        return {
            success: true,
            statusCode: 201,
            message: "Proposal accepted and payment recorded.",
            data,
        };
    }
}
