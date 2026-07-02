import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { StorageService } from "@global/storage/storage.service";
import { AssessmentSubmissionService } from "@main/(patient)/assessment-submission/assessment-submission.service";
import { PatientAssessmentQueryDto } from "./dto/assessment-query.dto";
import { PatientQueryDto } from "./dto/patient-query.dto";
import { PatientManageRepository } from "./patient-manage.repository";
import { UserStatus } from "@prisma/client";
import { NotificationService } from "../../notification/notification.service";
import { PrismaService } from "@global/prisma/prisma.service";
import { MessageService } from "@main/message/message.service";

@Injectable()
export class PatientManageService {
    constructor(
        private readonly repo: PatientManageRepository,
        private readonly storageService: StorageService,
        private readonly assessmentSubmissionService: AssessmentSubmissionService,
        private readonly notificationService: NotificationService,
        private readonly prisma: PrismaService,
        private readonly messageService: MessageService,
    ) {}

    async findAssessmentSubmissionById(submissionId: string) {
        const result = await this.assessmentSubmissionService.getMyAssessmentBlueprint(submissionId);
        return {
            ...result,
            payment: result.paymentSummary?.total ?? 0,
        };
    }

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
                    payment: submission.orders?.reduce((sum, order) => sum + Number(order.total), 0) ?? 0,
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

        // Auto-create conversation
        if (submission.assessment?.categoryId) {
            await this.messageService.autoCreateConversation(
                submission.userId,
                doctor.userId,
                submission.assessment.categoryId,
            );
        }

        // Fetch patient name
        const patient = await this.prisma.user.findUnique({
            where: { id: submission.userId },
            select: { name: true, patientProfile: { select: { name: true } } },
        });
        const patientName = patient?.patientProfile?.name ?? patient?.name ?? "A patient";

        // Notify Doctor
        await this.notificationService.send({
            userId: doctor.userId,
            title: "New Assessment Assigned",
            message: `An admin has assigned an assessment for ${patientName} to you.`,
            actionType: "ASSESSMENT_ASSIGNED",
            referenceId: submissionId,
        });

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
                payment: user.payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) ?? 0,
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
            payment: user.payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) ?? 0,
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
