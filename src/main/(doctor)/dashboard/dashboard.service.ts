import { Injectable } from "@nestjs/common";
import { DoctorDashboardRepository } from "./dashboard.repository";

@Injectable()
export class DoctorDashboardService {
    constructor(private readonly dashboardRepository: DoctorDashboardRepository) {}

    async getStats(userId: string) {
        const counts = await this.dashboardRepository.getStats(userId);

        let activeConsultation = 0;
        let newConsultation = 0;
        let declined = 0;

        for (const count of counts) {
            switch (count.status) {
                case 'ACCEPTED':
                    activeConsultation += count._count.status;
                    break;
                case 'PENDING':
                case 'REFIL_REQUESTED':
                case 'REVIEWED':
                    newConsultation += count._count.status;
                    break;
                case 'REJECTED':
                    declined += count._count.status;
                    break;
            }
        }

        const totalConsulted = activeConsultation + newConsultation + declined;

        return {
            totalConsulted,
            activeConsultation,
            newConsultation,
            declined,
        };
    }
}
