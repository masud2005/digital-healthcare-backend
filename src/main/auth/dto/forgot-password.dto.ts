import { ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsEmail,
    IsOptional,
    IsString,
    ValidateIf,
    type ValidationArguments,
    registerDecorator,
} from "class-validator";

function ExactlyOneOf(properties: string[]) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: "exactlyOneOf",
            target: object.constructor,
            propertyName,
            constraints: [properties],
            validator: {
                validate(_value: unknown, args: ValidationArguments) {
                    const [fields] = args.constraints as [string[]];
                    const payload = args.object as Record<string, unknown>;

                    return (
                        fields.filter(
                            (field) =>
                                payload[field] !== undefined &&
                                payload[field] !== null &&
                                payload[field] !== "",
                        ).length === 1
                    );
                },
                defaultMessage() {
                    return "Provide exactly one of email or phone";
                },
            },
        });
    };
}

export class ForgotPasswordDto {
    @ApiPropertyOptional({ example: "user@gmail.com" })
    @ValidateIf((o) => !o.phone)
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: "+88017xxxxxxxx" })
    @ValidateIf((o) => !o.email)
    @IsString()
    @IsOptional()
    phone?: string;

    @ExactlyOneOf(["email", "phone"])
    private readonly identifier?: never;
}
