import { StorageService } from "@global/storage/storage.service";
import { Injectable } from "@nestjs/common";
import { PublicProductRepository } from "./public-product.repository";

@Injectable()
export class PublicProductService {
    constructor(
        private readonly repo: PublicProductRepository,
        private readonly storageService: StorageService,
    ) {}

    async getProducts(categoryId: string) {
        const categories = await this.repo.findCategoriesWithProducts(categoryId);

        const data = await Promise.all(
            categories.map(async (category) => ({
                categoryId: category.id,
                categoryName: category.name,
                assessments: category.assessments.map((a) => ({ id: a.id, title: a.title })),
                products: await Promise.all(
                    category.products.map(async (product) => {
                        const image = product.images[0];
                        const price = product.variants[0]?.price ?? product.price;

                        return {
                            id: product.id,
                            name: product.name,
                            description: product.description ?? null,
                            price: price ? String(price) : null,
                            image: image?.fileUrl
                                ? await this.storageService.resolveKey(image.fileUrl)
                                : null,
                        };
                    }),
                ),
            })),
        );

        return {
            success: true,
            statusCode: 200,
            message: "Products fetched successfully",
            data,
        };
    }
}
