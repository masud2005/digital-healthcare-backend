import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AcceptProposalDto {
    @ApiProperty({ example: "CARD" })
    @IsString()
    @IsNotEmpty()
    paymentMethod: string;

    @ApiProperty({ required: false, description: "ID of a previously saved payment card." })
    @IsString()
    @IsOptional()
    savedCardId?: string;

    @ApiProperty({ required: false, description: "Clover secure token for frontend tokenization." })
    @IsString()
    @IsOptional()
    cloverToken?: string;

    @ApiProperty({ required: false, example: "John Doe" })
    @IsString()
    @IsOptional()
    cardholderName?: string;

    @ApiProperty({ required: false, example: "4111111111111111" })
    @IsString()
    @IsOptional()
    cardNumber?: string;

    @ApiProperty({ required: false, example: "12/27" })
    @IsString()
    @IsOptional()
    expiryDate?: string;

    @ApiProperty({ required: false, example: "123" })
    @IsString()
    @IsOptional()
    cvv?: string;
}
