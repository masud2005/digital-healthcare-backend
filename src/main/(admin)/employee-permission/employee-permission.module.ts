import { Module } from "@nestjs/common";
import { AuthModule } from "@main/auth/auth.module";
import { EmployeePermissionController } from "./employee-permission.controller";
import { EmployeePermissionService } from "./employee-permission.service";

@Module({
    imports: [AuthModule],
    controllers: [EmployeePermissionController],
    providers: [EmployeePermissionService],
    exports: [EmployeePermissionService],
})
export class EmployeePermissionModule {}
