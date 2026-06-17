import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { PatientAssessmentQueryDto } from "./dto/assessment-query.dto";
import { PatientQueryDto } from "./dto/patient-query.dto";
import { PatientManageRepository } from "./patient-manage.repository";
import { UserStatus } from "@prisma/client";

@Injectable()
export class PatientManageService {
    constructor(
        private readonly repo: PatientManageRepository,
        private readonly storageService: StorageService,
    ) {}

    async findAllAssessments(query: PatientAssessmentQueryDto) {
        const { data, total, page, limit } = await this.repo.findAllAssessments(query);

        const items = await Promise.all(
            data.map(async (submission) => {
                const totalSubmissions = await this.repo.countSubmissionsByUserId(
                    submission.userId,
                );
                const patientType = totalSubmissions <= 1 ? "New Patient" : "Repeat Patient";
                const provider = submission.reviewedBy
                    ? await this.repo.findDoctorByUserId(submission.reviewedBy)
                    : null;

                return {
                    submissionId: submission.id,
                    submissionCode: submission.submissionCode,
                    patientName: submission.user.patientProfile?.name ?? null,
                    patientImage: submission.user.patientProfile?.avatar?.fileUrl
                        ? await this.storageService.resolveKey(
                              submission.user.patientProfile.avatar.fileUrl,
                          )
                        : null,
                    patientId: submission.user.id,
                    provider: provider?.name ?? null,
                    patientType,
                    categoryName: submission.assessment.category.name,
                    status: submission.status,
                    date: submission.createdAt,
                };
            }),
        );

        return {
            data: items,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async findAllCategories() {
        const data = await this.repo.findAllCategories();
        return { data };
    }

    async findAllDoctors() {
        const data = await this.repo.findAllDoctors();
        return { data };
    }

    async assignDoctor(submissionId: string, doctorId: string) {
        const submission = await this.repo.findSubmissionById(submissionId);
        if (!submission) throw new NotFoundException("Submission not found");

        const doctor = await this.repo.findDoctorById(doctorId);
        if (!doctor) throw new NotFoundException("Doctor not found");

        await this.repo.assignDoctor(submissionId, doctor.userId);
        return { submissionId, doctorId };
    }

    async findAllPatients(query: PatientQueryDto) {
        const { data, total, page, limit } = await this.repo.findAllPatients(query);

        const items = await Promise.all(
            data.map(async (user) => ({
                id: user.id,
                name: user.patientProfile?.name ?? null,
                image: user.patientProfile?.avatar?.fileUrl
                    ? await this.storageService.resolveKey(user.patientProfile.avatar.fileUrl)
                    : null,
                email: user.email,
                contactNumber: user.phone ?? null,
                activeConsultation: user.assessmentSubmissions.length,
                status: user.status,
                joiningDate: user.createdAt,
            })),
        );

        return {
            data: items,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async findPatientById(id: string) {
        const user = await this.repo.findPatientById(id);
        if (!user) throw new NotFoundException("Patient not found");

        return {
            id: user.id,
            name: user.patientProfile?.name ?? null,
            image: user.patientProfile?.avatar?.fileUrl
                ? await this.storageService.resolveKey(user.patientProfile.avatar.fileUrl)
                : null,
            email: user.email,
            contactNumber: user.phone ?? null,
            activeConsultation: user.assessmentSubmissions.length,
            status: user.status,
            joiningDate: user.createdAt,
        };
    }

    async updatePatientStatus(id: string, status: UserStatus) {
        const user = await this.repo.findPatientById(id);
        if (!user) throw new NotFoundException("Patient not found");

        if (user.status === UserStatus.DELETED) {
            throw new BadRequestException("Patient is already deleted");
        }

        return this.repo.updatePatientStatus(id, status);
    }
}
