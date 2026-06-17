import type { ProviderLicenseSource, ProviderLicenseStatus } from "@constant/enums";
import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

type ProviderLicenseCreateData = {
    doctorId?: string | null;
    doctorName: string;
    doctorEmail?: string | null;
    avatarColor?: string | null;
    npiNumber?: string | null;
    deaNumber?: string | null;
    licenseNumber?: string | null;
    licenseType?: string | null;
    licenseStates?: string[];
    licenseSource?: ProviderLicenseSource;
    licenseStatus?: ProviderLicenseStatus;
    licenseExpiresAt?: Date | null;
    insuranceProvider?: string | null;
    insuranceStatus?: ProviderLicenseStatus;
    insuranceExpiresAt?: Date | null;
    notes?: string | null;
    isActive?: boolean;
};

type ProviderLicenseUpdateData = Partial<ProviderLicenseCreateData>;

type ProviderLicenseFindAllParams = {
    search?: string;
    licenseStatus?: ProviderLicenseStatus;
    insuranceStatus?: ProviderLicenseStatus;
    licenseSource?: ProviderLicenseSource;
    licenseState?: string;
    licenseType?: string;
    expiresFrom?: Date;
    expiresTo?: Date;
    isActive?: boolean;
    page: number;
    limit: number;
};

@Injectable()
export class ProviderLicenseRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: ProviderLicenseCreateData) {
        return this.prisma.providerLicense.create({
            data: {
                ...data,
                licenseStates: data.licenseStates
                    ? (data.licenseStates as Prisma.InputJsonValue)
                    : undefined,
            },
        });
    }

    async findAll(params: ProviderLicenseFindAllParams) {
        const { page, limit } = params;
        const where = this.buildWhere(params);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.providerLicense.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.providerLicense.count({ where }),
        ]);

        return { data, total };
    }

    findById(id: string) {
        return this.prisma.providerLicense.findUnique({ where: { id } });
    }

    findByDoctorId(doctorId: string) {
        return this.prisma.providerLicense.findMany({ where: { doctorId } });
    }

    update(id: string, data: ProviderLicenseUpdateData) {
        return this.prisma.providerLicense.update({
            where: { id },
            data: {
                ...data,
                licenseStates: data.licenseStates
                    ? (data.licenseStates as Prisma.InputJsonValue)
                    : data.licenseStates === null
                      ? Prisma.JsonNull
                      : undefined,
            },
        });
    }

    delete(id: string) {
        return this.prisma.providerLicense.delete({ where: { id } });
    }

    async getStats() {
        const now = new Date();
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        const [
            total,
            active,
            expiringSoon,
            expired,
            pending,
            expiringIn30Days,
            expiringIn90Days,
            insuranceExpiringIn30Days,
            insuranceExpiringIn90Days,
        ] = await this.prisma.$transaction([
            this.prisma.providerLicense.count({ where: { isActive: true } }),
            this.prisma.providerLicense.count({
                where: { isActive: true, licenseStatus: "ACTIVE" },
            }),
            this.prisma.providerLicense.count({
                where: { isActive: true, licenseStatus: "EXPIRING_SOON" },
            }),
            this.prisma.providerLicense.count({
                where: { isActive: true, licenseStatus: "EXPIRED" },
            }),
            this.prisma.providerLicense.count({
                where: { isActive: true, licenseStatus: "PENDING" },
            }),
            this.prisma.providerLicense.count({
                where: {
                    isActive: true,
                    licenseExpiresAt: { gte: now, lte: in30Days },
                },
            }),
            this.prisma.providerLicense.count({
                where: {
                    isActive: true,
                    licenseExpiresAt: { gte: now, lte: in90Days },
                },
            }),
            this.prisma.providerLicense.count({
                where: {
                    isActive: true,
                    insuranceExpiresAt: { gte: now, lte: in30Days },
                },
            }),
            this.prisma.providerLicense.count({
                where: {
                    isActive: true,
                    insuranceExpiresAt: { gte: now, lte: in90Days },
                },
            }),
        ]);

        return {
            total,
            active,
            expiringSoon,
            expired,
            pending,
            expiringIn30Days,
            expiringIn90Days,
            insuranceExpiringIn30Days,
            insuranceExpiringIn90Days,
        };
    }

    private buildWhere(params: ProviderLicenseFindAllParams): Prisma.ProviderLicenseWhereInput {
        const expiresAtFilter = this.buildDateRangeFilter(params.expiresFrom, params.expiresTo);

        return {
            ...(params.licenseStatus ? { licenseStatus: params.licenseStatus } : {}),
            ...(params.insuranceStatus ? { insuranceStatus: params.insuranceStatus } : {}),
            ...(params.licenseSource ? { licenseSource: params.licenseSource } : {}),
            ...(params.licenseType
                ? { licenseType: { equals: params.licenseType, mode: "insensitive" } }
                : {}),
            ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
            ...(expiresAtFilter ? { licenseExpiresAt: expiresAtFilter } : {}),
            // licenseState filtering: check JSON array contains the state
            ...(params.licenseState
                ? {
                      licenseStates: {
                          array_contains: params.licenseState.toUpperCase(),
                      },
                  }
                : {}),
            ...(params.search
                ? {
                      OR: [
                          { doctorName: { contains: params.search, mode: "insensitive" } },
                          { doctorEmail: { contains: params.search, mode: "insensitive" } },
                          { npiNumber: { contains: params.search, mode: "insensitive" } },
                          { deaNumber: { contains: params.search, mode: "insensitive" } },
                          { licenseNumber: { contains: params.search, mode: "insensitive" } },
                          { licenseType: { contains: params.search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };
    }

    private buildDateRangeFilter(from?: Date, to?: Date): Prisma.DateTimeFilter | undefined {
        if (!from && !to) return undefined;
        return {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
        };
    }
}
