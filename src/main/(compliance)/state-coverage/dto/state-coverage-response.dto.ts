import { stateComplianceStatus } from "@constant/enums";
import { ApiProperty } from "@nestjs/swagger";

class CategoryMinResponseDto {
    @ApiProperty({ example: "b2dfc059-d890-4c12-92e1-456cb3c829e2" })
    id: string;

    @ApiProperty({ example: "Weight Loss" })
    name: string;
}

export class StateCoverageResponseDto {
    @ApiProperty({ example: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f" })
    id: string;

    @ApiProperty({ example: "CA" })
    stateCode: string;

    @ApiProperty({ example: "California" })
    stateName: string;

    @ApiProperty({ enum: stateComplianceStatus, example: "COMPLIANT" })
    status: string;

    @ApiProperty({ example: false })
    isComingSoon: boolean;

    @ApiProperty({ type: [CategoryMinResponseDto] })
    allowedCategories: CategoryMinResponseDto[];

    @ApiProperty({ type: [CategoryMinResponseDto] })
    restrictedCategories: CategoryMinResponseDto[];

    @ApiProperty({ example: "2026-06-11T08:30:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2026-06-11T08:30:00.000Z" })
    updatedAt: Date;
}

class StateCoverageListMetaDto {
    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 10 })
    total: number;

    @ApiProperty({ example: 1 })
    totalPages: number;
}

export class StateCoverageListResponseDto {
    @ApiProperty({ type: [StateCoverageResponseDto] })
    data: StateCoverageResponseDto[];

    @ApiProperty({ type: StateCoverageListMetaDto })
    meta: StateCoverageListMetaDto;
}
