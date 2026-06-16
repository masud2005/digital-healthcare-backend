import { PrismaService } from "@global/prisma/prisma.service";
import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from "@nestjs/common";
import { pbkdf2Sync, randomBytes } from "crypto";
import { CreateSideEffectReportDto } from "./dto/create-side-effect-report.dto";
import { SideEffectReportQueryDto } from "./dto/side-effect-report-query.dto";
import { UpdateSideEffectReportDto } from "./dto/update-side-effect-report.dto";
import { SideEffectReportRepository } from "./side-effect-report.repository";
import { DEFAULT_SIDE_EFFECT_REPORTS } from "./side-effect-report-seed.data";
import { slugify } from "@util/functions";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const PASSWORD_ITERATIONS = 120000;

@Injectable()
export class SideEffectReportService implements OnModuleInit {
    private readonly logger = new Logger(SideEffectReportService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly sideEffectReportRepository: SideEffectReportRepository,
    ) {}

    async onModuleInit() {
        // await this.seedSideEffectReports();
    }

    private hashPassword(password: string) {
        const salt = randomBytes(16).toString("hex");
        const derived = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, "sha256").toString(
            "hex",
        );
        return `${salt}:${derived}`;
    }

    async seedSideEffectReports() {
        try {
            const count = await this.sideEffectReportRepository.count();
            if (count > 0) return;

            this.logger.log("🌱 Seeding Side Effect Reports...");

            // 1. Ensure DOCTOR role exists
            const role = await this.prisma.role.upsert({
                where: { name: "DOCTOR" },
                update: { isActive: true },
                create: {
                    name: "DOCTOR",
                    displayName: "Doctor",
                    isSystem: true,
                },
            });

            const categoriesMap = new Map<string, string>();
            const doctorsMap = new Map<string, string>();

            const defaultPasswordHash = this.hashPassword("12345678");

            for (const report of DEFAULT_SIDE_EFFECT_REPORTS) {
                // Ensure category exists
                const catName = report.serviceName;
                if (!categoriesMap.has(catName)) {
                    const normalizedCatName = slugify(catName.trim());

                    const category = await this.prisma.category.upsert({
                        where: { slug: normalizedCatName },
                        update: {},
                        create: {
                            name: catName.trim(),
                            slug: normalizedCatName,
                            status: "ACTIVE",
                        },
                    });
                    categoriesMap.set(catName, category.id);
                }

                // Ensure doctor exists
                const docName = report.providerName;
                if (!doctorsMap.has(docName)) {
                    const docEmail = `${docName.toLowerCase().replace(/[^a-z0-9]/g, "")}@weightlossmd.com`;
                    let docProfile = await this.prisma.doctorProfile.findFirst({
                        where: { name: docName },
                    });

                    if (!docProfile) {
                        const user = await this.prisma.user.create({
                            data: {
                                email: docEmail,
                                password: defaultPasswordHash,
                                status: "ACTIVE",
                                emailVerifiedAt: new Date(),
                                userRoles: {
                                    create: {
                                        roleId: role.id,
                                    },
                                },
                                doctorProfile: {
                                    create: {
                                        name: docName,
                                        title: "Medical Specialist",
                                    },
                                },
                            },
                            include: {
                                doctorProfile: true,
                            },
                        });
                        docProfile = user.doctorProfile!;
                    }
                    doctorsMap.set(docName, docProfile.id);
                }

                const serviceId = categoriesMap.get(catName)!;
                const providerId = doctorsMap.get(docName)!;

                // Create report
                const createdReport = await this.sideEffectReportRepository.create({
                    firstName: report.firstName,
                    lastName: report.lastName,
                    email: report.email,
                    phone: report.phone,
                    severity: report.severity,
                    description: report.description,
                    status: report.status,
                    serviceId,
                    providerId,
                    createdAt: report.detectedAt,
                });

                // Create attachments if any
                if (report.attachmentCount > 0) {
                    const attachmentIds: string[] = [];
                    for (let i = 1; i <= report.attachmentCount; i++) {
                        const fileExt = i === 1 ? "jpg" : i === 2 ? "png" : "pdf";
                        const fileName = `symptom_doc_${i}.${fileExt}`;
                        const fileType =
                            fileExt === "pdf"
                                ? "application/pdf"
                                : `image/${fileExt === "jpg" ? "jpeg" : "png"}`;

                        const attachment = await this.prisma.attachment.create({
                            data: {
                                fileName,
                                fileUrl: `https://s3.amazonaws.com/weightlossmd/${fileName}`,
                                fileType,
                                fileSize: 102400 * i,
                                context: "SIDE_EFFECT_REPORT_ATTACHMENT",
                                sideEffectReportId: createdReport.id,
                            },
                        });
                        attachmentIds.push(attachment.id);
                    }
                }
            }

            this.logger.log(
                `✅ Seeded ${DEFAULT_SIDE_EFFECT_REPORTS.length} Side Effect Reports successfully.`,
            );
        } catch (error) {
            this.logger.error("Failed to seed side effect reports", error as Error);
        }
    }

    async create(payload: CreateSideEffectReportDto) {
        // Validate category exists
        const category = await this.prisma.category.findUnique({
            where: { id: payload.serviceId },
        });
        if (!category) {
            throw new BadRequestException("Service (Category) not found");
        }

        // Validate provider exists
        const provider = await this.prisma.doctorProfile.findUnique({
            where: { id: payload.providerId },
        });
        if (!provider) {
            throw new BadRequestException("Provider (DoctorProfile) not found");
        }

        const data = this.normalizeCreatePayload(payload);
        return this.sideEffectReportRepository.create(data);
    }

    async getOverview() {
        const counts = await this.sideEffectReportRepository.getOverview();
        return { counts };
    }

    async findAll(query: SideEffectReportQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.sideEffectReportRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            severity: query.severity,
            status: query.status,
            serviceId: query.serviceId,
            providerId: query.providerId,
            from: this.parseQueryDate(query.from, "from"),
            to: this.parseQueryDate(query.to, "to"),
        });

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const report = await this.sideEffectReportRepository.findById(id);
        if (!report) {
            throw new NotFoundException("Side effect report not found");
        }
        return report;
    }

    async update(id: string, payload: UpdateSideEffectReportDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        return this.sideEffectReportRepository.update(id, data);
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.sideEffectReportRepository.delete(id);
    }

    private normalizeCreatePayload(payload: CreateSideEffectReportDto) {
        return {
            firstName: payload.firstName.trim(),
            lastName: payload.lastName.trim(),
            email: payload.email.trim().toLowerCase(),
            phone: payload.phone?.trim() || null,
            severity: payload.severity,
            description: payload.description.trim(),
            status: payload.status ?? "PENDING",
            serviceId: payload.serviceId,
            providerId: payload.providerId,
            attachmentIds: payload.attachmentIds ?? [],
        };
    }

    private normalizeUpdatePayload(payload: UpdateSideEffectReportDto) {
        const data: ReturnType<typeof this.normalizeCreatePayload> = {} as any;

        if (payload.firstName !== undefined) data.firstName = payload.firstName.trim();
        if (payload.lastName !== undefined) data.lastName = payload.lastName.trim();
        if (payload.email !== undefined) data.email = payload.email.trim().toLowerCase();
        if (payload.phone !== undefined) data.phone = payload.phone?.trim() || null;
        if (payload.severity !== undefined) data.severity = payload.severity;
        if (payload.description !== undefined) data.description = payload.description.trim();
        if (payload.status !== undefined) data.status = payload.status;
        if (payload.serviceId !== undefined) data.serviceId = payload.serviceId;
        if (payload.providerId !== undefined) data.providerId = payload.providerId;
        if (payload.attachmentIds !== undefined) data.attachmentIds = payload.attachmentIds;

        return data;
    }

    private parseQueryDate(value: string | undefined, fieldName: string) {
        if (!value) {
            return undefined;
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${fieldName} must be a valid date`);
        }

        return date;
    }
}
