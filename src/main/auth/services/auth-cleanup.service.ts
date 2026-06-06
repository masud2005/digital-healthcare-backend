import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { AuthRepository } from "../auth.repository";

@Injectable()
export class AuthCleanupService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AuthCleanupService.name);
    private intervalHandle?: NodeJS.Timeout;

    constructor(private readonly authRepository: AuthRepository) {}

    async runCleanup() {
        try {
            const retentionDays = Number(process.env.OTP_RETENTION_DAYS ?? 7);
            const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

            const deleted = await this.authRepository.deleteOldOtpChallenges(cutoff);
            this.logger.debug(
                `Pruned ${deleted.count} old OTP challenges older than ${cutoff.toISOString()}`,
            );
        } catch (err) {
            this.logger.error("Failed to prune OTP challenges", err as any);
        }
    }

    onModuleInit() {
        // Run once immediately after boot, then once a day
        void this.runCleanup();
        const oneDayMs = 24 * 60 * 60 * 1000;
        this.intervalHandle = setInterval(() => void this.runCleanup(), oneDayMs);
        this.logger.debug("AuthCleanupService scheduled daily cleanup");
    }

    onModuleDestroy() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = undefined;
        }
    }
}
