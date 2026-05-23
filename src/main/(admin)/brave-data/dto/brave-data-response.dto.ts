import { ApiProperty } from "@nestjs/swagger";

export class BraveHistoryItemDto {
    @ApiProperty({ nullable: true })
    time: string | null;

    @ApiProperty()
    title: string;

    @ApiProperty()
    url: string;
}

export class BraveDownloadItemDto {
    @ApiProperty({ nullable: true })
    time: string | null;

    @ApiProperty()
    targetPath: string;

    @ApiProperty()
    sourceUrl: string;
}

export class BraveProfileDataDto {
    @ApiProperty()
    profileName: string;

    @ApiProperty()
    historyPath: string;

    @ApiProperty({ type: [BraveHistoryItemDto] })
    history: BraveHistoryItemDto[];

    @ApiProperty({ type: [BraveDownloadItemDto] })
    downloads: BraveDownloadItemDto[];
}

export class BraveDataResponseDto {
    @ApiProperty()
    platform: string;

    @ApiProperty({ type: [String] })
    searchedDirectories: string[];

    @ApiProperty({ type: [BraveProfileDataDto] })
    profiles: BraveProfileDataDto[];
}
