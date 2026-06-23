import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AcceptProposalDto {
    @ApiProperty({ example: "CARD" })
    @IsString()
    @IsNotEmpty()
    paymentMethod: string;

    @ApiProperty({ example: "John Doe" })
    @IsString()
    @IsNotEmpty()
    cardholderName: string;

    @ApiProperty({ example: "4111111111111111" })
    @IsString()
    @IsNotEmpty()
    cardNumber: string;

    @ApiProperty({ example: "12/27" })
    @IsString()
    @IsNotEmpty()
    expiryDate: string;

    @ApiProperty({ example: "123" })
    @IsString()
    @IsNotEmpty()
    cvv: string;
}
