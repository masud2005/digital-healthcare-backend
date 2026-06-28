import { PrismaService } from "@global/prisma/prisma.service";
import { AuthSharedService } from "@main/auth/services/auth-shared.service";
import { MailService } from "@global/mail/mail.service";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { UserStatus } from "@prisma/client";
import { CreateEmployeeDto, UpdateEmployeeDto } from "./dto/employee.dto";
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";

@Injectable()
export class EmployeePermissionService {
    private readonly logger = new Logger(EmployeePermissionService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly authSharedService: AuthSharedService,
        private readonly mailService: MailService,
    ) {}

    // --- Permissions ---
    async listPermissions() {
        return this.prisma.permission.findMany({
            orderBy: { key: "asc" },
        });
    }

    // --- Roles ---
    async listRoles() {
        return this.prisma.role.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });
    }

    async createRole(dto: CreateRoleDto) {
        // Check unique role name
        const normalizedName = dto.name.toUpperCase().trim().replace(/\s+/g, "_");
        const existing = await this.prisma.role.findUnique({
            where: { name: normalizedName },
        });

        if (existing) {
            throw new BadRequestException(`Role with name '${normalizedName}' already exists.`);
        }

        // Verify permissions exist
        const permissionIds = dto.permissionIds || [];
        const permissionCount = await this.prisma.permission.count({
            where: { id: { in: permissionIds } },
        });

        if (permissionCount !== permissionIds.length) {
            throw new BadRequestException("One or more permission IDs are invalid.");
        }

        return this.prisma.$transaction(async (tx) => {
            const role = await tx.role.create({
                data: {
                    name: normalizedName,
                    displayName: dto.displayName || dto.name,
                    description: dto.description,
                    isSystem: false,
                    isActive: true,
                },
            });

            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map((permId) => ({
                        roleId: role.id,
                        permissionId: permId,
                    })),
                });
            }

            return tx.role.findUnique({
                where: { id: role.id },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });
        });
    }

    async updateRole(id: string, dto: UpdateRoleDto) {
        const role = await this.prisma.role.findFirst({
            where: { id, deletedAt: null },
        });

        if (!role) {
            throw new NotFoundException("Role not found.");
        }

        if (role.isSystem && dto.isActive === false) {
            throw new BadRequestException("Cannot deactivate a system role.");
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.role.update({
                where: { id },
                data: {
                    displayName: dto.displayName,
                    description: dto.description,
                    isActive: dto.isActive,
                },
            });

            if (dto.permissionIds) {
                // Verify new permissions exist
                const permissionCount = await tx.permission.count({
                    where: { id: { in: dto.permissionIds } },
                });

                if (permissionCount !== dto.permissionIds.length) {
                    throw new BadRequestException("One or more permission IDs are invalid.");
                }

                // Delete old permissions
                await tx.rolePermission.deleteMany({
                    where: { roleId: id },
                });

                // Create new ones
                if (dto.permissionIds.length > 0) {
                    await tx.rolePermission.createMany({
                        data: dto.permissionIds.map((permId) => ({
                            roleId: id,
                            permissionId: permId,
                        })),
                    });
                }
            }

            return tx.role.findUnique({
                where: { id },
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });
        });
    }

    // --- Employees ---
    async listEmployees() {
        return this.prisma.user.findMany({
            where: {
                deletedAt: null,
                userRoles: {
                    some: {
                        role: {
                            name: { notIn: ["PATIENT", "DOCTOR"] },
                        },
                    },
                },
            },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
                userPermissions: {
                    include: {
                        permission: true,
                    },
                },
                adminProfile: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async createEmployee(dto: CreateEmployeeDto) {
        // Check email uniqueness
        const email = this.authSharedService.normalizeEmail(dto.email);
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            throw new BadRequestException(`User with email '${email}' already exists.`);
        }

        // Verify role exists and is active
        const role = await this.prisma.role.findFirst({
            where: { id: dto.roleId, deletedAt: null, isActive: true },
        });

        if (!role) {
            throw new BadRequestException("Assigned role is invalid or inactive.");
        }

        const passwordHash = this.authSharedService.hashPassword(dto.password);

        const createdUser = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    name: dto.name,
                    password: passwordHash,
                    status: UserStatus.ACTIVE,
                    emailVerifiedAt: new Date(),
                },
            });

            await tx.userRole.create({
                data: {
                    userId: user.id,
                    roleId: role.id,
                },
            });

            if (dto.permissionIds && dto.permissionIds.length > 0) {
                // Verify permissions exist
                const permissionCount = await tx.permission.count({
                    where: { id: { in: dto.permissionIds } },
                });

                if (permissionCount !== dto.permissionIds.length) {
                    throw new BadRequestException("One or more permission IDs are invalid.");
                }

                await tx.userPermission.createMany({
                    data: dto.permissionIds.map((permId) => ({
                        userId: user.id,
                        permissionId: permId,
                    })),
                });
            }

            await tx.adminProfile.create({
                data: {
                    userId: user.id,
                    name: dto.name,
                },
            });

            return tx.user.findUnique({
                where: { id: user.id },
                include: {
                    userRoles: {
                        include: {
                            role: true,
                        },
                    },
                    userPermissions: {
                        include: {
                            permission: true,
                        },
                    },
                    adminProfile: true,
                },
            });
        });

        if (createdUser) {
            const roleNames = createdUser.userRoles.map(
                (ur) => ur.role.displayName || ur.role.name,
            );
            const directPermissions = createdUser.userPermissions.map(
                (up) => up.permission.name || up.permission.key,
            );

            // Fetch role-based permissions as well to list all permissions
            const roleIds = createdUser.userRoles.map((ur) => ur.roleId);
            const rolePermissions = await this.prisma.rolePermission.findMany({
                where: { roleId: { in: roleIds } },
                include: { permission: true },
            });
            const allPermissions = Array.from(
                new Set([
                    ...rolePermissions.map((rp) => rp.permission.name || rp.permission.key),
                    ...directPermissions,
                ]),
            );

            this.mailService
                .sendMail({
                    to: createdUser.email,
                    subject: "Your Employee Account Has Been Created",
                    html: `
                        <p>Hello ${dto.name},</p>
                        <p>Your employee account has been successfully created.</p>
                        <p><strong>Role:</strong> ${roleNames.join(", ")}</p>
                        <p><strong>Permissions:</strong></p>
                        <ul>
                            ${allPermissions.map((p) => `<li>${p}</li>`).join("")}
                        </ul>
                    `,
                })
                .catch((err) => {
                    this.logger.error(
                        `Failed to send account creation email to ${createdUser.email}`,
                        err,
                    );
                });
        }

        return createdUser;
    }

    async updateEmployee(id: string, dto: UpdateEmployeeDto) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException("Employee not found.");
        }

        return this.prisma.$transaction(async (tx) => {
            let passwordHash: string | undefined;
            if (dto.password) {
                passwordHash = this.authSharedService.hashPassword(dto.password);
            }

            let email: string | undefined;
            if (dto.email) {
                email = this.authSharedService.normalizeEmail(dto.email);
                if (email !== user.email) {
                    const existing = await tx.user.findUnique({
                        where: { email },
                    });
                    if (existing) {
                        throw new BadRequestException(`Email '${email}' is already taken.`);
                    }
                }
            }

            await tx.user.update({
                where: { id },
                data: {
                    name: dto.name,
                    email,
                    password: passwordHash,
                    status: dto.status,
                },
            });

            if (dto.name) {
                await tx.adminProfile.upsert({
                    where: { userId: id },
                    update: { name: dto.name },
                    create: { userId: id, name: dto.name },
                });
            }

            if (dto.roleId) {
                const role = await tx.role.findFirst({
                    where: { id: dto.roleId, deletedAt: null, isActive: true },
                });

                if (!role) {
                    throw new BadRequestException("New assigned role is invalid or inactive.");
                }

                await tx.userRole.deleteMany({
                    where: { userId: id },
                });

                await tx.userRole.create({
                    data: {
                        userId: id,
                        roleId: dto.roleId,
                    },
                });
            }

            if (dto.permissionIds) {
                // Verify new permissions exist
                const permissionCount = await tx.permission.count({
                    where: { id: { in: dto.permissionIds } },
                });

                if (permissionCount !== dto.permissionIds.length) {
                    throw new BadRequestException("One or more permission IDs are invalid.");
                }

                // Delete old mappings
                await tx.userPermission.deleteMany({
                    where: { userId: id },
                });

                // Create new ones
                if (dto.permissionIds.length > 0) {
                    await tx.userPermission.createMany({
                        data: dto.permissionIds.map((permId) => ({
                            userId: id,
                            permissionId: permId,
                        })),
                    });
                }
            }

            return tx.user.findUnique({
                where: { id },
                include: {
                    userRoles: {
                        include: {
                            role: true,
                        },
                    },
                    userPermissions: {
                        include: {
                            permission: true,
                        },
                    },
                    adminProfile: true,
                },
            });
        });
    }

    async deleteEmployee(id: string) {
        const user = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });

        if (!user) {
            throw new NotFoundException("Employee not found.");
        }

        await this.prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: UserStatus.DELETED,
            },
        });

        return { success: true, message: "Employee deactivated/suspended successfully." };
    }
}
