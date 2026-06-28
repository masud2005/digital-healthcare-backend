import { ApiProperty } from "@nestjs/swagger";

export class DashboardStatsResponseDto {
    @ApiProperty({ example: 5, description: "Total number of drafted assessments (status: DRAFT)" })
    TotalDraft: number;

    @ApiProperty({
        example: 10,
        description: "Total number of pending assessments (status: PENDING)",
    })
    TotalPending: number;

    @ApiProperty({
        example: 2,
        description: "Total number of reviewed assessments (status: REVIEWED)",
    })
    TotalReviewed: number;

    @ApiProperty({
        example: 15,
        description: "Total number of approved assessments (status: ACCEPTED)",
    })
    TotalApproved: number;

    @ApiProperty({
        example: 1,
        description: "Total number of refill requested assessments (status: REFIL_REQUESTED)",
    })
    TotalRefilRequested: number;

    @ApiProperty({
        example: 3,
        description: "Total number of declined assessments (status: REJECTED)",
    })
    TotalDeclined: number;

    @ApiProperty({ example: 1250.0, description: "Total successful payment amount" })
    TotalPayment: number;
}
