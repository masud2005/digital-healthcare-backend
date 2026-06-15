import { StateComplianceStatus } from "@constant/enums";
import { PrismaService } from "@global/prisma/prisma.service";
import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { slugify } from "@util/functions";
import { CreateStateCoverageDto } from "./dto/create-state-coverage.dto";
import { StateCoverageQueryDto } from "./dto/state-coverage-query.dto";
import { UpdateStateRestrictionsDto } from "./dto/update-state-restrictions.dto";
import { StateCoverageRepository } from "./state-coverage.repository";
import { getSeedStateCoverages } from "./state-coverage-seed.data";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class StateCoverageService implements OnModuleInit {
    private readonly logger = new Logger(StateCoverageService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly stateCoverageRepository: StateCoverageRepository,
    ) {}

    async onModuleInit() {
        await this.seedStateCoverages();
    }

    async seedStateCoverages() {
        try {
            const count = await this.stateCoverageRepository.count();
            if (count === 50) return;

            if (count > 0) {
                this.logger.log("⚠️ State Coverage count is not 50. Clearing existing states and re-seeding...");
                await this.prisma.stateCoverage.deleteMany();
            }

            this.logger.log("🌱 Seeding State Coverage compliance data...");

            const categoriesMap = new Map<string, string>();
            const serviceNames = [
                "Telemedicine",
                "Weight Loss",
                "Hormone Therapy",
                "Anxiety & Depression",
                "Sexual Health",
                "Hair care",
                "Skin Care",
                "Sleep",
                "Hair Loss",
                "Controlled Substances",
                "Hair Loss (Finasteride)",
            ];

            // 1. Ensure all categories exist
            for (const name of serviceNames) {
                const normalizedCatName = name.trim().includes(" ") ? slugify(name.trim()) : name.trim();
                const category = await this.prisma.category.upsert({
                    where: { name: normalizedCatName },
                    update: {},
                    create: {
                        name: normalizedCatName,
                        status: "ACTIVE",
                    },
                });
                categoriesMap.set(name, category.id);
            }

            // 2. Create state coverages
            const seedData = getSeedStateCoverages();
            for (const item of seedData) {
                const allowedCategoryIds = item.allowedServices
                    .map((serviceName) => categoriesMap.get(serviceName))
                    .filter((id): id is string => Boolean(id));

                await this.stateCoverageRepository.create({
                    stateCode: item.stateCode,
                    stateName: item.stateName,
                    status: item.status,
                    isComingSoon: item.isComingSoon,
                    allowedCategoryIds,
                });
            }

            this.logger.log(`✅ Seeded ${seedData.length} State Coverages successfully.`);
        } catch (error) {
            this.logger.error("Failed to seed state coverages", error as Error);
        }
    }

    async create(payload: CreateStateCoverageDto) {
        const existing = await this.stateCoverageRepository.findByStateCode(payload.stateCode.trim().toUpperCase());
        if (existing) {
            throw new BadRequestException("State code already exists");
        }

        return this.stateCoverageRepository.create({
            stateCode: payload.stateCode.trim().toUpperCase(),
            stateName: payload.stateName.trim(),
            status: payload.status ?? "COMPLIANT",
            isComingSoon: payload.isComingSoon ?? false,
            allowedCategoryIds: payload.allowedCategoryIds ?? [],
        });
    }

    async findAll(query: StateCoverageQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.stateCoverageRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            status: query.status,
        });

        // Resolve restricted categories for each state
        const allCategories = await this.prisma.category.findMany({
            where: { status: "ACTIVE" },
            select: { id: true, name: true },
        });

        const mappedData = data.map((state) => {
            const allowedIds = new Set(state.allowedCategories.map((c) => c.id));
            const restrictedCategories = state.isComingSoon
                ? []
                : allCategories.filter((c) => !allowedIds.has(c.id));

            return {
                ...state,
                restrictedCategories,
            };
        });

        return {
            data: mappedData,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const state = await this.stateCoverageRepository.findById(id);
        if (!state) {
            throw new NotFoundException("State coverage not found");
        }

        const allCategories = await this.prisma.category.findMany({
            where: { status: "ACTIVE" },
            select: { id: true, name: true },
        });

        const allowedIds = new Set(state.allowedCategories.map((c) => c.id));
        const restrictedCategories = state.isComingSoon
            ? []
            : allCategories.filter((c) => !allowedIds.has(c.id));

        return {
            ...state,
            restrictedCategories,
        };
    }

    async updateRestrictions(id: string, payload: UpdateStateRestrictionsDto) {
        const existing = await this.findOne(id);

        let status = existing.status as StateComplianceStatus;
        if (payload.isComingSoon === true) {
            status = "COMING_SOON";
        } else if (payload.isComingSoon === false && existing.isComingSoon) {
            status = "COMPLIANT";
        }

        // If transitioning to coming soon, clear allowed categories
        const allowedCategoryIds = payload.isComingSoon === true ? [] : payload.allowedCategoryIds;

        const updated = await this.stateCoverageRepository.update(id, {
            isComingSoon: payload.isComingSoon,
            status,
            allowedCategoryIds,
        });

        const allCategories = await this.prisma.category.findMany({
            where: { status: "ACTIVE" },
            select: { id: true, name: true },
        });

        const allowedIds = new Set(updated.allowedCategories.map((c) => c.id));
        const restrictedCategories = updated.isComingSoon
            ? []
            : allCategories.filter((c) => !allowedIds.has(c.id));

        return {
            ...updated,
            restrictedCategories,
        };
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.stateCoverageRepository.delete(id);
    }
}
