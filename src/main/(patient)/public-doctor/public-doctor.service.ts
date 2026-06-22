import { Injectable } from "@nestjs/common";
import { PrismaService } from "@global/prisma/prisma.service";
import { StorageService } from "@global/storage/storage.service";

@Injectable()
export class PublicDoctorService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) {}

    async getActiveDoctors() {
        const doctors = await this.prisma.doctorProfile.findMany({
            where: {
                deletedAt: null,
                user: {
                    deletedAt: null,
                    status: "ACTIVE",
                    userRoles: {
                        some: {
                            role: { name: "DOCTOR" },
                        },
                    },
                },
            },
            include: {
                avatar: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return Promise.all(
            doctors.map(async (doctor) => ({
                id: doctor.id,
                fullName: doctor.name,
                title: doctor.title,
                shortBio: doctor.bio,
                officeLocation: doctor.officeLocation,
                featured: doctor.featured,
                thumbnail: doctor.avatar?.fileUrl
                    ? await this.storageService.getSignedUrl(doctor.avatar.fileUrl)
                    : null,
            })),
        );
    }
}
