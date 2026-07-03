import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { StorageService } from 'src/global/storage/storage.service';

@Injectable()
export class PublicProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        images: true,
        category: {
          include: {
            assessments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Promise.all(
      products.map(async (product) => {
        let image = product.images[0] || null;
        if (image && image.fileUrl) {
          image = {
            ...image,
            fileUrl: await this.storageService.getSignedUrl(image.fileUrl),
          };
        }
        return {
          id: product.id,
          title: product.name,
          slug: product.slug,
          description: product.description,
          image,
          category: product.category
            ? {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
              }
            : null,
          assessments:
            product.category?.assessments?.map((a) => ({
              id: a.id,
              title: a.title,
            })) || [],
        };
      }),
    );
  }

  async findOne(identifier: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ]
      },
      include: {
        images: true,
        variants: true,
        category: {
          include: {
            assessments: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let image = product.images[0] || null;
    if (image && image.fileUrl) {
      image = {
        ...image,
        fileUrl: await this.storageService.getSignedUrl(image.fileUrl),
      };
    }

    return {
      id: product.id,
      title: product.name,
      slug: product.slug,
      description: product.description,
      image,
      variants: product.variants,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      assessments:
        product.category?.assessments?.map((a) => ({
          id: a.id,
          title: a.title,
        })) || [],
    };
  }
}
