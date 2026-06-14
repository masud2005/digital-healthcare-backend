import { ApiProperty } from "@nestjs/swagger";

class ComplianceDashboardKpiDto {
    @ApiProperty({ example: 87 })
    value: number;

    @ApiProperty({ example: "%" })
    unit: string;

    @ApiProperty({ example: "Readiness score" })
    label: string;
}

class ComplianceDashboardStatusItemDto {
    @ApiProperty({ example: "HIPAA Readiness Score" })
    name: string;

    @ApiProperty({ example: "Compliant", enum: ["Compliant", "Active", "Needs Review"] })
    status: string;

    @ApiProperty({ example: 87 })
    percent: number;

    @ApiProperty({
        example: "COMPLIANT",
        enum: ["COMPLIANT", "ACTIVE", "NEEDS_REVIEW", "CRITICAL"],
    })
    statusCode: string;
}

export class ComplianceDashboardResponseDto {
    @ApiProperty({
        type: ComplianceDashboardKpiDto,
        description: "HIPAA compliance readiness score (0-100)",
    })
    hipaaCompliance: ComplianceDashboardKpiDto;

    @ApiProperty({
        type: ComplianceDashboardKpiDto,
        description: "% of active patients with accepted consent",
    })
    consentCompletion: ComplianceDashboardKpiDto;

    @ApiProperty({
        example: { value: 22, unit: "alerts", label: "Active right now" },
        description: "Active open security incidents",
    })
    securityAlerts: ComplianceDashboardKpiDto;

    @ApiProperty({
        example: { value: 47, unit: "attempts", label: "+8 from yesterday" },
        description: "Failed login attempts in the last 24 hours",
    })
    failedLogins24h: ComplianceDashboardKpiDto;

    @ApiProperty({ type: ComplianceDashboardKpiDto, description: "% staff with MFA enabled" })
    mfaAdoption: ComplianceDashboardKpiDto;

    @ApiProperty({
        example: { value: 3847, unit: "events", label: "Events logged" },
        description: "Audit log entries in the last 24 hours",
    })
    auditLog24h: ComplianceDashboardKpiDto;

    @ApiProperty({
        type: [ComplianceDashboardStatusItemDto],
        description: "Compliance status breakdown for the right-panel status list",
    })
    complianceStatus: ComplianceDashboardStatusItemDto[];
}
