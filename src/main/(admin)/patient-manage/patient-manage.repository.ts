import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { SubmissionStatus, UserStatus } from "@prisma/client";
import { DateFilter } from "./dto/assessment-query.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class PatientManageRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAllAssessments(params: {
        page?: number;
        limit?: number;
        status?: SubmissionStatus;
        categoryId?: string;
        patientType?: string;
        date?: DateFilter;
        search?: string;
    }) {
        const page = params.page ?? DEFAULT_PAGE;
        const limit = params.limit ?? DEFAULT_LIMIT;
        const skip = (page - 1) * limit;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const where: any = {
            status: { not: SubmissionStatus.DRAFT },
            ...(params.status ? { status: params.status } : {}),
            ...(params.date === DateFilter.TODAY
                ? { createdAt: { gte: today, lt: tomorrow } }
                : {}),
            ...(params.categoryId ? { assessment: { categoryId: params.categoryId } } : {}),
            user: { deletedAt: null },
            ...(params.search
                ? {
                      OR: [
                          {
                              user: {
                                  patientProfile: {
                                      name: { contains: params.search, mode: "insensitive" },
                                  },
                              },
                          },
                          {
                              assessment: {
                                  category: {
                                      name: { contains: params.search, mode: "insensitive" },
                                  },
                              },
                          },
                      ],
                  }
                : {}),
        };

        if (params.patientType) {
            const submissionIds = await this.resolvePatientTypeFilter(params.patientType);
            if (submissionIds.length === 0) return { data: [], total: 0, page, limit };
            where.id = { in: submissionIds };
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.assessmentSubmission.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        include: {
                            patientProfile: {
                                select: { name: true, avatar: { select: { fileUrl: true } } },
                            },
                        },
                    },
                    assessment: {
                        select: {
                            id: true,
                            title: true,
                            category: { select: { id: true, name: true } },
                        },
                    },
                },
            }),
            this.prisma.assessmentSubmission.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    private async resolvePatientTypeFilter(patientType: string): Promise<string[]> {
        const allSubmissions = await this.prisma.assessmentSubmission.findMany({
            where: { status: { not: SubmissionStatus.DRAFT } },
            select: { id: true, userId: true },
            orderBy: { createdAt: "asc" },
        });

        const firstSubmissionByUser = new Map<string, string>();
        for (const s of allSubmissions) {
            if (!firstSubmissionByUser.has(s.userId)) {
                firstSubmissionByUser.set(s.userId, s.id);
            }
        }

        if (patientType === "New Patient") {
            return Array.from(firstSubmissionByUser.values());
        }

        // Repeat Patient = submissions that are NOT the user's first
        return allSubmissions
            .filter((s) => firstSubmissionByUser.get(s.userId) !== s.id)
            .map((s) => s.id);
    }

    async findAllCategories() {
        return this.prisma.category.findMany({
            where: { status: "ACTIVE" },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });
    }

    async findAllDoctors() {
        return this.prisma.doctorProfile.findMany({
            where: {
                deletedAt: null,
                user: {
                    deletedAt: null,
                    status: "ACTIVE",
                    userRoles: { some: { role: { name: "DOCTOR" } } },
                },
            },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });
    }

    findSubmissionById(id: string) {
        return this.prisma.assessmentSubmission.findUnique({
            where: { id },
            select: { id: true, reviewedBy: true },
        });
    }

    findDoctorById(id: string) {
        return this.prisma.doctorProfile.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, userId: true },
        });
    }

    assignDoctor(submissionId: string, doctorUserId: string) {
        return this.prisma.assessmentSubmission.update({
            where: { id: submissionId },
            data: { reviewedBy: doctorUserId },
            select: { id: true, reviewedBy: true },
        });
    }

    async findAllPatients(params: {
        page?: number;
        limit?: number;
        status?: UserStatus;
        search?: string;
    }) {
        const page = params.page ?? DEFAULT_PAGE;
        const limit = params.limit ?? DEFAULT_LIMIT;
        const skip = (page - 1) * limit;

        const where: any = {
            deletedAt: null,
            userRoles: { some: { role: { name: { not: "DOCTOR" } } } },
            ...(params.status ? { status: params.status } : {}),
            ...(params.search
                ? {
                      OR: [
                          {
                              patientProfile: {
                                  name: { contains: params.search, mode: "insensitive" },
                              },
                          },
                          { email: { contains: params.search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    assessmentSubmissions: {
                        where: { status: "PENDING" },
                        select: { id: true },
                    },
                    patientProfile: {
                        include: {
                            avatar: { select: { fileUrl: true } },
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { data, total, page, limit };
    }

    findPatientById(id: string) {
        return this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: {
                assessmentSubmissions: {
                    where: { status: "PENDING" },
                    select: { id: true },
                },
                patientProfile: {
                    include: {
                        avatar: { select: { fileUrl: true } },
                    },
                },
            },
        });
    }

    updatePatientStatus(id: string, status: UserStatus) {
        const data: any = { status };
        if (status === UserStatus.DELETED) {
            data.deletedAt = new Date();
        }
        return this.prisma.user.update({ where: { id }, data, select: { id: true, status: true } });
    }

    countSubmissionsByUserId(userId: string) {
        return this.prisma.assessmentSubmission.count({
            where: { userId, status: { not: SubmissionStatus.DRAFT } },
        });
    }

    findDoctorByUserId(userId: string) {
        return this.prisma.doctorProfile.findFirst({
            where: { userId, deletedAt: null },
            select: { id: true, name: true },
        });
    }
}
