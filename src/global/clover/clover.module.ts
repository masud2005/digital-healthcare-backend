import { Global, Module } from "@nestjs/common";
import { CloverService } from "./clover.service";

@Global()
@Module({
    providers: [CloverService],
    exports: [CloverService],
})
export class CloverModule {}
