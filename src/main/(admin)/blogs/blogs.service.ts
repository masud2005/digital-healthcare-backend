import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { slugify } from "@util/functions";
import { StorageService } from "@global/storage/storage.service";
import { PrismaService } from "@global/prisma/prisma.service";
import { BlogsRepository } from "./blogs.repository";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { BlogQueryDto } from "./dto/blog-query.dto";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class BlogsService {
    constructor(
        private readonly blogsRepository: BlogsRepository,
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    async create(payload: CreateBlogDto, authorId: string) {
        await this.validateRelations(
            payload.categoryId,
            payload.providerId,
            payload.featuredImageId,
        );

        const slug = await this.generateUniqueSlug(payload.title);

        const blogData = {
            title: payload.title.trim(),
            slug,
            content: payload.content,
            isPublished: payload.isPublished ?? true,
            authorId,
            categoryId: payload.categoryId,
            providerId: payload.providerId ?? null,
            featuredImageId: payload.featuredImageId ?? null,
        };

        const blog = await this.blogsRepository.create(blogData);
        return this.resolveUrls(blog);
    }

    async findAll(query: BlogQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.blogsRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            categoryId: query.categoryId,
            isPublished: query.isPublished,
        });

        const resolvedData = await Promise.all(data.map((blog) => this.resolveUrls(blog)));

        return {
            data: resolvedData,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const blog = await this.blogsRepository.findById(id);
        if (!blog) {
            throw new NotFoundException("Blog not found");
        }
        return this.resolveUrls(blog);
    }

    async findOneByIdOrSlug(idOrSlug: string) {
        let blog = await this.blogsRepository.findById(idOrSlug);
        if (!blog) {
            blog = await this.blogsRepository.findBySlug(idOrSlug);
        }
        if (!blog) {
            throw new NotFoundException("Blog not found");
        }
        return this.resolveUrls(blog);
    }

    async update(id: string, payload: UpdateBlogDto) {
        const existingBlog = await this.blogsRepository.findById(id);
        if (!existingBlog) {
            throw new NotFoundException("Blog not found");
        }

        await this.validateRelations(
            payload.categoryId,
            payload.providerId,
            payload.featuredImageId,
        );

        const updateData: any = {};

        if (payload.title !== undefined) {
            const titleTrimmed = payload.title.trim();
            if (titleTrimmed !== existingBlog.title) {
                updateData.title = titleTrimmed;
                updateData.slug = await this.generateUniqueSlug(titleTrimmed, id);
            }
        }

        if (payload.content !== undefined) {
            updateData.content = payload.content;
        }

        if (payload.isPublished !== undefined) {
            updateData.isPublished = payload.isPublished;
        }

        if (payload.categoryId !== undefined) {
            updateData.categoryId = payload.categoryId;
        }

        if (payload.providerId !== undefined) {
            updateData.providerId = payload.providerId;
        }

        if (payload.featuredImageId !== undefined) {
            updateData.featuredImageId = payload.featuredImageId;
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException("At least one field must be provided for update");
        }

        const updatedBlog = await this.blogsRepository.update(id, updateData);
        return this.resolveUrls(updatedBlog);
    }

    async remove(id: string) {
        const existingBlog = await this.blogsRepository.findById(id);
        if (!existingBlog) {
            throw new NotFoundException("Blog not found");
        }
        await this.blogsRepository.delete(id);
        return { success: true };
    }

    private async validateRelations(
        categoryId?: string,
        providerId?: string | null,
        featuredImageId?: string | null,
    ) {
        if (categoryId) {
            const categoryExists = await this.prisma.category.findUnique({
                where: { id: categoryId },
            });
            if (!categoryExists) {
                throw new BadRequestException(`Category with ID ${categoryId} does not exist`);
            }
        }

        if (providerId) {
            const providerExists = await this.prisma.doctorProfile.findUnique({
                where: { id: providerId },
            });
            if (!providerExists) {
                throw new BadRequestException(`Provider with ID ${providerId} does not exist`);
            }
        }

        if (featuredImageId) {
            const attachmentExists = await this.prisma.attachment.findUnique({
                where: { id: featuredImageId },
            });
            if (!attachmentExists) {
                throw new BadRequestException(
                    `Featured image with ID ${featuredImageId} does not exist`,
                );
            }
        }
    }

    private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
        const baseSlug = slugify(title.trim());
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await this.blogsRepository.findBySlug(slug);
            if (!existing || existing.id === excludeId) {
                break;
            }
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        return slug;
    }

    private async resolveUrls(blog: any) {
        if (!blog) return blog;

        let featuredImage = blog.featuredImage;
        if (featuredImage) {
            featuredImage = {
                ...featuredImage,
                fileUrl: await this.storageService.getSignedUrl(featuredImage.fileUrl),
            };
        }

        let provider = blog.provider;
        if (provider && provider.avatar) {
            provider = {
                ...provider,
                avatar: {
                    ...provider.avatar,
                    fileUrl: await this.storageService.getSignedUrl(provider.avatar.fileUrl),
                },
            };
        }

        return {
            ...blog,
            featuredImage,
            provider,
        };
    }
}
