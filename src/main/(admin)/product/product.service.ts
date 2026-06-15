import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { slugify } from "@util/functions";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductRepository } from "./product.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly storageService: StorageService,
    ) {}

    async create(payload: CreateProductDto) {
        const data = this.normalizeCreatePayload(payload);
        await this.ensureNameIsAvailable(data.name);
        await this.ensureCategoryExists(data.categoryId);

        if (data.images && data.images.length > 0) {
            await this.productRepository.validateProductImages(data.images);
        }

        try {
            const product = await this.productRepository.create(data);
            return this.resolveProductImages(product);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async findAll(query: ProductQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;
        const search = query.search?.trim();
        const categoryId = query.categoryId?.trim();

        const { data, total } = await this.productRepository.findAll({
            page,
            limit,
            search,
            categoryId,
        });

        return {
            data: await Promise.all(data.map((p) => this.resolveProductImages(p))),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const product = await this.productRepository.findById(id);

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        return this.resolveProductImages(product);
    }

    async update(id: string, payload: UpdateProductDto) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundException("Product not found");
        }

        const data = this.normalizeUpdatePayload(payload);

        if (data.name) {
            await this.ensureNameIsAvailable(data.name, id);
        }

        if (data.categoryId) {
            await this.ensureCategoryExists(data.categoryId);
        }

        if (data.images) {
            await this.productRepository.validateProductImages(data.images, id);

            const newImageIds = data.images;
            const removedImages = product.images.filter((img) => !newImageIds.includes(img.id));

            if (removedImages.length > 0) {
                await Promise.all(
                    removedImages.map(async (img) => {
                        try {
                            await this.storageService.deleteFile(img.fileUrl);
                        } catch {
                            // Log warning, don't crash
                        }
                        await this.productRepository.deleteAttachment(img.id);
                    }),
                );
            }
        }

        try {
            const updatedProduct = await this.productRepository.update(id, data);
            return this.resolveProductImages(updatedProduct);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async remove(id: string) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundException("Product not found");
        }

        if (product.images && product.images.length > 0) {
            await Promise.all(
                product.images.map(async (img) => {
                    try {
                        await this.storageService.deleteFile(img.fileUrl);
                    } catch {
                        // Log warning, don't crash
                    }
                }),
            );
        }

        try {
            return await this.productRepository.delete(id);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    /**
     * Replace stored image keys with fresh signed URLs.
     */
    private async resolveProductImages<
        T extends {
            price?: any;
            stockQuantity?: any;
            variants?: Array<{
                id: string;
                size: string;
                price: any;
                stockQuantity: number;
                createdAt: Date;
                updatedAt: Date;
            }>;
            images: Array<{
                id: string;
                fileName: string;
                fileUrl: string;
                fileType: string;
                fileSize: number;
                context: string;
                uploadedById?: string | null;
                createdAt: Date;
                updatedAt: Date;
            }>;
        },
    >(product: T) {
        const resolvedImages = await Promise.all(
            product.images.map(async (img) => ({
                ...img,
                fileUrl: await this.storageService.getSignedUrl(img.fileUrl),
            })),
        );
        const resolvedVariants = product.variants
            ? product.variants.map((v) => ({
                  ...v,
                  price: String(v.price),
              }))
            : [];

        // Legacy compatibility fields
        const legacyPrice =
            resolvedVariants.length > 0
                ? resolvedVariants[0].price
                : product.price
                  ? String(product.price)
                  : null;
        const legacyStock =
            resolvedVariants.length > 0
                ? resolvedVariants[0].stockQuantity
                : (product.stockQuantity ?? 0);

        return {
            ...product,
            price: legacyPrice,
            stockQuantity: legacyStock,
            images: resolvedImages,
            variants: resolvedVariants,
        };
    }

    private normalizeCreatePayload(payload: CreateProductDto) {
        return {
            name: this.normalizeName(payload.name),
            images: payload.images.map((img) => img.trim()),
            price: payload.price ? payload.price.trim() : null,
            stockQuantity: payload.stockQuantity ?? 0,
            description: this.parseDescription(payload.description),
            categoryId: payload.categoryId,
            variants: payload.variants
                ? payload.variants.map((v) => ({
                      size: v.size.trim(),
                      price: v.price.trim(),
                      stockQuantity: v.stockQuantity ?? 0,
                  }))
                : [],
        };
    }

    private normalizeUpdatePayload(payload: UpdateProductDto) {
        const data: {
            name?: string;
            images?: string[];
            price?: string | null;
            stockQuantity?: number;
            description?: string | null;
            categoryId?: string;
            variants?: Array<{
                size: string;
                price: string;
                stockQuantity: number;
            }>;
        } = {};

        if (payload.name !== undefined) {
            data.name = this.normalizeName(payload.name);
        }

        if (payload.images !== undefined) {
            const images = Array.isArray(payload.images) ? payload.images : [payload.images];
            data.images = images.map((img) => String(img).trim()).filter(Boolean);
        }

        if (payload.price !== undefined) {
            data.price = payload.price ? payload.price.trim() : null;
        }

        if (payload.stockQuantity !== undefined) {
            data.stockQuantity = payload.stockQuantity;
        }

        if (payload.variants !== undefined) {
            data.variants = payload.variants.map((v) => ({
                size: v.size.trim(),
                price: v.price.trim(),
                stockQuantity: v.stockQuantity ?? 0,
            }));
        }

        if (payload.description !== undefined) {
            data.description = this.parseDescription(payload.description);
        }

        if (payload.categoryId !== undefined) {
            data.categoryId = payload.categoryId;
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one product field is required");
        }

        return data;
    }

    private normalizeName(name: string) {
        const trimmed = name.trim();
        return trimmed.includes(" ") ? slugify(trimmed) : trimmed;
    }

    private parseDescription(description: string | null | undefined) {
        if (description === null) {
            return null;
        }

        if (description === undefined) {
            return undefined;
        }

        const trimmed = description.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private async ensureCategoryExists(categoryId: string) {
        const category = await this.productRepository.findCategoryById(categoryId);

        if (!category) {
            throw new NotFoundException("Category not found");
        }
    }

    private async ensureNameIsAvailable(name: string, excludeId?: string) {
        const existingProduct = await this.productRepository.findByName(name);

        if (existingProduct && existingProduct.id !== excludeId) {
            throw new ConflictException("Product name already exists");
        }
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2002") {
            throw new ConflictException("Product name already exists");
        }

        if (prismaError.code === "P2003") {
            throw new BadRequestException("Invalid category id");
        }
    }
}
