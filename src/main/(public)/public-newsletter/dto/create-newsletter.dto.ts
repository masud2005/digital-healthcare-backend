import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateNewsletterDto {
    @ApiProperty({ example: "subscriber@example.com" })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
