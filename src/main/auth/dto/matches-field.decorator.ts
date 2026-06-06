import { type ValidationArguments, registerDecorator } from "class-validator";

export function MatchesField(field: string, message: string) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: "matchesField",
            target: object.constructor,
            propertyName,
            constraints: [field],
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    const [relatedField] = args.constraints as [string];
                    const payload = args.object as Record<string, unknown>;

                    return value === payload[relatedField];
                },
                defaultMessage() {
                    return message;
                },
            },
        });
    };
}
