import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { UserStatus } from "@constant/enums";

type DoctorCreateData = {
    email: string;
    password: string;
    status: UserStatus;
    avatarId?: string | null;
    name: string;
    title?: string | null;
    bio?: string | null;
    officeLocation?: string | null;
};

type DoctorUpdateData = {
    email?: string;
    password?: string;
    status?: UserStatus;
    avatarId?: string | null;
    name?: string;
    title?: string | null;
    bio?: string | null;
    officeLocation?: string | null;
};

type DoctorFindAllParams = {
    search?: string;
    status?: UserStatus;
    title?: string;
    page: number;
    limit: number;
};

const doctorInclude = {
    user: {
        select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    },
    avatar: true,
} as const;

@Injectable()
export class ManageDoctorRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: DoctorCreateData) {
        return this.prisma.$transaction(async (tx) => {
            const role = await tx.role.upsert({
                where: { name: "DOCTOR" },
                update: { isActive: true },
                create: {
                    name: "DOCTOR",
                    displayName: "Doctor",
                    isSystem: true,
                },
                select: { id: true },
            });

            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: data.password,
                    status: data.status,
                    emailVerifiedAt: data.status === "ACTIVE" ? new Date() : undefined,
                    userRoles: {
                        create: {
                            roleId: role.id,
                        },
                    },
                    doctorProfile: {
                        create: {
                            name: data.name,
                            avatarId: data.avatarId,
                            title: data.title,
                            bio: data.bio,
                            officeLocation: data.officeLocation,
                        },
                    },
                },
                select: { doctorProfile: { include: doctorInclude } },
            });

            return user.doctorProfile;
        });
    }

    async findAll(params: DoctorFindAllParams) {
        const { page, limit, search, status, title } = params;
        const where = {
            deletedAt: null,
            ...(title ? { title: { equals: title, mode: "insensitive" as const } } : {}),
            user: {
                deletedAt: null,
                ...(status ? { status } : {}),
                userRoles: {
                    some: {
                        role: {
                            name: "DOCTOR",
                        },
                    },
                },
            },
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" as const } },
                          { officeLocation: { contains: search, mode: "insensitive" as const } },
                          { user: { email: { contains: search, mode: "insensitive" as const } } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.doctorProfile.findMany({
                where,
                include: doctorInclude,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.doctorProfile.count({ where }),
        ]);

        return { data, total };
    }

    async findTitles() {
        const rows = await this.prisma.doctorProfile.findMany({
            where: {
                deletedAt: null,
                title: {
                    not: null,
                },
                user: {
                    deletedAt: null,
                    userRoles: {
                        some: {
                            role: {
                                name: "DOCTOR",
                            },
                        },
                    },
                },
            },
            distinct: ["title"],
            select: {
                title: true,
            },
            orderBy: {
                title: "asc",
            },
        });

        return rows.map((row) => row.title).filter((title): title is string => Boolean(title));
    }

    findById(id: string) {
        return this.prisma.doctorProfile.findFirst({
            where: {
                id,
                deletedAt: null,
                user: {
                    deletedAt: null,
                    userRoles: {
                        some: {
                            role: {
                                name: "DOCTOR",
                            },
                        },
                    },
                },
            },
            include: doctorInclude,
        });
    }

    findByUserId(userId: string) {
        return this.prisma.doctorProfile.findFirst({
            where: {
                userId,
                deletedAt: null,
            },
            include: doctorInclude,
        });
    }

    findUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
    }

    update(id: string, data: DoctorUpdateData) {
        const userData: { email?: string; password?: string; status?: UserStatus } = {};
        const profileData: {
            avatarId?: string | null;
            name?: string;
            title?: string | null;
            bio?: string | null;
            officeLocation?: string | null;
        } = {};

        if (data.email !== undefined) userData.email = data.email;
        if (data.password !== undefined) userData.password = data.password;
        if (data.status !== undefined) userData.status = data.status;
        if (data.avatarId !== undefined) profileData.avatarId = data.avatarId;
        if (data.name !== undefined) profileData.name = data.name;
        if (data.title !== undefined) profileData.title = data.title;
        if (data.bio !== undefined) profileData.bio = data.bio;
        if (data.officeLocation !== undefined) profileData.officeLocation = data.officeLocation;

        return this.prisma.$transaction(async (tx) => {
            const profile = await tx.doctorProfile.update({
                where: { id },
                data: profileData,
                select: { userId: true },
            });

            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { id: profile.userId },
                    data: {
                        ...userData,
                        emailVerifiedAt: userData.status === "ACTIVE" ? new Date() : undefined,
                    },
                });
            }

            return tx.doctorProfile.findUnique({
                where: { id },
                include: doctorInclude,
            });
        });
    }

    updateStatus(id: string, status: UserStatus) {
        return this.prisma.$transaction(async (tx) => {
            const profile = await tx.doctorProfile.findUnique({
                where: { id },
                select: { userId: true },
            });

            if (!profile) {
                return null;
            }

            await tx.user.update({
                where: { id: profile.userId },
                data: {
                    status,
                    emailVerifiedAt: status === "ACTIVE" ? new Date() : undefined,
                },
            });

            return tx.doctorProfile.findUnique({
                where: { id },
                include: doctorInclude,
            });
        });
    }

    delete(id: string) {
        return this.prisma.$transaction(async (tx) => {
            const profile = await tx.doctorProfile.findUnique({
                where: { id },
                select: { userId: true },
            });

            if (!profile) {
                return null;
            }

            await tx.user.delete({
                where: { id: profile.userId },
            });
        });
    }

    async countActiveConsultations(userIds: string[]) {
        if (userIds.length === 0) {
            return new Map<string, number>();
        }

        const rows = await this.prisma.assessmentSubmission.groupBy({
            by: ["reviewedBy"],
            where: {
                reviewedBy: { in: userIds },
                status: "PENDING",
            },
            _count: { _all: true },
        });

        return new Map(rows.map((row) => [row.reviewedBy!, row._count._all]));
    }
}
