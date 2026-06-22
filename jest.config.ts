import type { Config } from "jest";

const config: Config = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: "src",
    testRegex: ".*\\.spec\\.ts$",
    transform: { "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "tsconfig.json" }] },
    testEnvironment: "node",
    moduleNameMapper: {
        "^@common/(.*)$": "<rootDir>/common/$1",
        "^@global/(.*)$": "<rootDir>/global/$1",
        "^@main/(.*)$": "<rootDir>/main/$1",
        "^@config/(.*)$": "<rootDir>/configs/$1",
        "^@constant/(.*)$": "<rootDir>/constants/$1",
        "^@util/(.*)$": "<rootDir>/utils/$1",
    },
};

export default config;
