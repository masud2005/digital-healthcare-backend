import { RequirePermissions } from "@common/decorators";
import { JwtAuthGuard, PermissionsGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateEmployeeDto, UpdateEmployeeDto } from "./dto/employee.dto";
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";
import { EmployeePermissionService } from "./employee-permission.service";

@ApiTags("(Admin) Employee Permissions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("admin/employee-permissions")
export class EmployeePermissionController {
    constructor(private readonly service: EmployeePermissionService) {}

    // --- Permissions ---
    @Get("permissions")
    @ApiOperation({ summary: "Get all available permissions" })
    @RequirePermissions("view:employee_permissions")
    listPermissions() {
        return this.service.listPermissions();
    }

    // --- Roles ---
    @Get("roles")
    @ApiOperation({ summary: "Get all active roles and their permissions" })
    @RequirePermissions("view:employee_permissions")
    listRoles() {
        return this.service.listRoles();
    }

    @Post("roles")
    @ApiOperation({ summary: "Create a new role with permissions" })
    @RequirePermissions("manage:employee_permissions")
    createRole(@Body() dto: CreateRoleDto) {
        return this.service.createRole(dto);
    }

    @Patch("roles/:id")
    @ApiOperation({ summary: "Update an existing role and its permissions" })
    @RequirePermissions("manage:employee_permissions")
    updateRole(@Param("id") id: string, @Body() dto: UpdateRoleDto) {
        return this.service.updateRole(id, dto);
    }

    // --- Employees ---
    @Get("employees")
    @ApiOperation({ summary: "Get all employee users, their roles, and permissions" })
    @RequirePermissions("view:employee_permissions")
    listEmployees() {
        return this.service.listEmployees();
    }

    @Post("employees")
    @ApiOperation({ summary: "Create a new employee user account and assign role" })
    @RequirePermissions("manage:employee_permissions")
    createEmployee(@Body() dto: CreateEmployeeDto) {
        return this.service.createEmployee(dto);
    }

    @Patch("employees/:id")
    @ApiOperation({ summary: "Update an employee account details, status, or role" })
    @RequirePermissions("manage:employee_permissions")
    updateEmployee(@Param("id") id: string, @Body() dto: UpdateEmployeeDto) {
        return this.service.updateEmployee(id, dto);
    }

    @Delete("employees/:id")
    @ApiOperation({ summary: "Deactivate/suspend an employee account" })
    @RequirePermissions("manage:employee_permissions")
    deleteEmployee(@Param("id") id: string) {
        return this.service.deleteEmployee(id);
    }
}
