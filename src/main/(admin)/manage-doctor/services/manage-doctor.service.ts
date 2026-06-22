import type { UserStatus } from "@constant/enums";
import { AttachmentService } from "@global/attachment/attachment.service";
import { StorageService } from "@global/storage/storage.service";
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { pbkdf2Sync, randomBytes } from "crypto";
import { CreateDoctorDto } from "../dto/create-doctor.dto";
import { DoctorQueryDto } from "../dto/doctor-query.dto";
import { UpdateDoctorDto } from "../dto/update-doctor.dto";
import { ManageDoctorRepository } from "../manage-doctor.repository";
import { DoctorMailService } from "./doctor-mail.service";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const PASSWORD_ITERATIONS = 120000;

@Injectable()
export class ManageDoctorService {
    constructor(
        private readonly manageDoctorRepository: ManageDoctorRepository,
        private readonly storageService: StorageService,
        private readonly attachmentService: AttachmentService,
        private readonly doctorMailService: DoctorMailService,
    ) {}

    async create(payload: CreateDoctorDto) {
        this.doctorMailService.assertReady();
        const data = this.normalizeCreatePayload(payload);
        await this.ensureEmailIsAvailable(data.email);

        try {
            const doctor = await this.manageDoctorRepository.create({
                ...data,
                password: this.hashPassword(data.password),
            });

            if (!doctor) {
                throw new NotFoundException("Doctor profile not found");
            }

            await this.doctorMailService.sendCredentials({
                name: data.name,
                email: data.email,
                password: data.password,
            });

            return this.mapDoctor(doctor, 0);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async findAll(query: DoctorQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;
        const search = query.search?.trim();
        const title = query.title?.trim();
        const { data, total } = await this.manageDoctorRepository.findAll({
            page,
            limit,
            search,
            status: query.status,
            title,
        });
        const consultationCounts = await this.manageDoctorRepository.countActiveConsultations(
            data.map((doctor) => doctor.userId),
        );

        return {
            data: await Promise.all(
                data.map((doctor) =>
                    this.mapDoctor(doctor, consultationCounts.get(doctor.userId) ?? 0),
                ),
            ),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findTitles() {
        const titles = await this.manageDoctorRepository.findTitles();
        return { data: titles };
    }

    async findOne(id: string) {
        const doctor = await this.manageDoctorRepository.findById(id);

        if (!doctor) {
            throw new NotFoundException("Doctor not found");
        }

        const consultationCounts = await this.manageDoctorRepository.countActiveConsultations([
            doctor.userId,
        ]);
        return this.mapDoctor(doctor, consultationCounts.get(doctor.userId) ?? 0);
    }

    async update(id: string, payload: UpdateDoctorDto) {
        const doctor = await this.findExistingDoctor(id);
        const data = this.normalizeUpdatePayload(payload);

        if (data.email) {
            await this.ensureEmailIsAvailable(data.email, doctor.userId);
        }

        if (data.password) {
            this.doctorMailService.assertReady();
        }

        if (data.avatarId && doctor.avatarId) {
            await this.attachmentService.remove(doctor.avatarId).catch(() => {});
        }

        try {
            const updated = await this.manageDoctorRepository.update(id, {
                ...data,
                password: data.password ? this.hashPassword(data.password) : undefined,
            });

            if (!updated) {
                throw new NotFoundException("Doctor not found");
            }

            if (data.password) {
                await this.doctorMailService.sendCredentials({
                    name: updated.name,
                    email: updated.user.email,
                    password: data.password,
                });
            }

            const consultationCounts = await this.manageDoctorRepository.countActiveConsultations([
                updated.userId,
            ]);
            return this.mapDoctor(updated, consultationCounts.get(updated.userId) ?? 0);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async updateStatus(id: string, status: UserStatus) {
        await this.findExistingDoctor(id);

        try {
            const doctor = await this.manageDoctorRepository.updateStatus(id, status);

            if (!doctor) {
                throw new NotFoundException("Doctor not found");
            }

            const consultationCounts = await this.manageDoctorRepository.countActiveConsultations([
                doctor.userId,
            ]);
            return this.mapDoctor(doctor, consultationCounts.get(doctor.userId) ?? 0);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    async remove(id: string) {
        const doctor = await this.findExistingDoctor(id);

        if (doctor.avatarId) {
            await this.attachmentService.remove(doctor.avatarId).catch(() => {});
        }

        try {
            await this.manageDoctorRepository.delete(id);
        } catch (error) {
            this.throwKnownPrismaError(error);
            throw error;
        }
    }

    private normalizeCreatePayload(payload: CreateDoctorDto) {
        return {
            email: this.normalizeEmail(payload.email),
            password: payload.password.trim(),
            status: payload.status ?? "ACTIVE",
            avatarId: payload.avatarId ?? null,
            featured: payload.featured ?? false,
            name: this.normalizeRequiredString(payload.fullName, "Full name is required"),
            title: this.parseString(payload.roleTitle),
            bio: this.parseString(payload.shortBio),
            officeLocation: this.parseString(payload.officeLocation),
        };
    }

    private normalizeUpdatePayload(payload: UpdateDoctorDto) {
        const data: {
            email?: string;
            password?: string;
            status?: UserStatus;
            avatarId?: string | null;
            featured?: boolean;
            name?: string;
            title?: string | null;
            bio?: string | null;
            officeLocation?: string | null;
        } = {};

        if (payload.email !== undefined) {
            data.email = this.normalizeEmail(payload.email);
        }

        if (payload.password !== undefined) {
            data.password = payload.password.trim();
        }

        if (payload.status !== undefined) {
            data.status = payload.status;
        }

        if (payload.avatarId !== undefined) {
            data.avatarId = payload.avatarId;
        }

        if (payload.featured !== undefined) {
            data.featured = payload.featured;
        }

        if (payload.fullName !== undefined) {
            data.name = this.normalizeRequiredString(payload.fullName, "Full name is required");
        }

        if (payload.roleTitle !== undefined) {
            data.title = this.parseString(payload.roleTitle);
        }

        if (payload.shortBio !== undefined) {
            data.bio = this.parseString(payload.shortBio);
        }

        if (payload.officeLocation !== undefined) {
            data.officeLocation = this.parseString(payload.officeLocation);
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException("At least one doctor field is required");
        }

        return data;
    }

    private async findExistingDoctor(id: string) {
        const doctor = await this.manageDoctorRepository.findById(id);

        if (!doctor) {
            throw new NotFoundException("Doctor not found");
        }

        return doctor;
    }

    private async ensureEmailIsAvailable(email: string, excludeUserId?: string) {
        const user = await this.manageDoctorRepository.findUserByEmail(email);

        if (user && user.id !== excludeUserId) {
            throw new ConflictException("Doctor email already exists");
        }
    }

    private normalizeEmail(email: string) {
        return email.trim().toLowerCase();
    }

    private normalizeRequiredString(value: string, message: string) {
        const trimmed = value.trim();

        if (!trimmed) {
            throw new BadRequestException(message);
        }

        return trimmed;
    }

    private parseString(value: string | null | undefined) {
        if (value === null) {
            return null;
        }

        if (value === undefined) {
            return undefined;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private hashPassword(password: string) {
        const salt = randomBytes(16).toString("hex");
        const derived = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, "sha256").toString(
            "hex",
        );
        return `${salt}:${derived}`;
    }

    private async mapDoctor(
        doctor: NonNullable<Awaited<ReturnType<ManageDoctorRepository["findById"]>>>,
        activeConsultation: number,
    ) {
        return {
            id: doctor.id,
            userId: doctor.userId,
            fullName: doctor.name,
            thumbnail: doctor.avatar?.fileUrl
                ? await this.storageService.getSignedUrl(doctor.avatar.fileUrl)
                : null,
            featured: doctor.featured,
            roleTitle: doctor.title,
            shortBio: doctor.bio,
            email: doctor.user.email,
            officeLocation: doctor.officeLocation,
            status: doctor.user.status,
            activeConsultation,
            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt,
        };
    }

    private throwKnownPrismaError(error: unknown) {
        const prismaError = error as { code?: string };

        if (prismaError.code === "P2002") {
            throw new ConflictException("Doctor email already exists");
        }

        if (prismaError.code === "P2003") {
            throw new BadRequestException("Invalid doctor relation");
        }
    }
}
