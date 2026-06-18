import { StorageService } from "@global/storage/storage.service";
import { Injectable } from "@nestjs/common";
import { ServiceCategoryRepository } from "./service-category.repository";

@Injectable()
export class ServiceCategoryService {
    constructor(
        private readonly serviceCategoryRepository: ServiceCategoryRepository,
        private readonly storageService: StorageService,
    ) {}

    async getAllCategoriesName() {
        return this.serviceCategoryRepository.findAllNames();
    }

    async getCategories(categoryName?: string) {
        const categories = await this.serviceCategoryRepository.findAll(categoryName);

        return Promise.all(
            categories.map(async (category) => ({
                ...category,
                assessments: await Promise.all(
                    category.assessments.map(async (assessment) => ({
                        ...assessment,
                        thumbnail: await this.storageService.resolveKey(assessment.thumbnail),
                    })),
                ),
            })),
        );
    }

    async getProductsByCategory(categoryId: string) {
        return this.serviceCategoryRepository.findProductsByCategory(categoryId);
    }
}
