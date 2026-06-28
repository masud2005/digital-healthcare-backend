import { ApiProperty } from "@nestjs/swagger";

export class DoctorDashboardStatsResponseDto {
    @ApiProperty({ example: 10, description: "Total sum of all consultations" })
    totalConsulted: number;

    @ApiProperty({ example: 3, description: "Active consultations (status: ACCEPTED)" })
    activeConsultation: number;

    @ApiProperty({
        example: 2,
        description: "New requests (status: PENDING, REFIL_REQUESTED, REVIEWED)",
    })
    newConsultation: number;

    @ApiProperty({ example: 1, description: "Declined requests (status: REJECTED)" })
    declined: number;
}
