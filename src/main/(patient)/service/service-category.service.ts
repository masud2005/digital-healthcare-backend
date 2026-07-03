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
        const categories = await this.serviceCategoryRepository.findAllNames();

        return Promise.all(
            categories.map(async (category) => {
                return {
                    id: category.id,
                    name: category.name,
                    assessments: await Promise.all(
                        category.assessments.map(async (assessment) => ({
                            id: assessment.id,
                            title: assessment.title,
                            image: await this.storageService.resolveKey(assessment.thumbnail),
                        })),
                    ),
                };
            }),
        );
    }

    async getCategories(categoryName?: string) {
        const categories = await this.serviceCategoryRepository.findAll(categoryName);

        return Promise.all(
            categories.map(async (category) => {
                const resolvedIcon = category.icon
                    ? {
                          ...category.icon,
                          fileUrl: await this.storageService.getSignedUrl(category.icon.fileUrl),
                      }
                    : null;

                return {
                    ...category,
                    icon: resolvedIcon,
                    assessments: await Promise.all(
                        category.assessments.map(async (assessment) => ({
                            ...assessment,
                            thumbnail: await this.storageService.resolveKey(assessment.thumbnail),
                        })),
                    ),
                };
            }),
        );
    }

    async getProductsByCategory(categoryId: string) {
        return this.serviceCategoryRepository.findProductsByCategory(categoryId);
    }
}
