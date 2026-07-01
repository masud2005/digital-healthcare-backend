import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { SystemHealthService } from "./system-health.service";

@Injectable()
export class SystemHealthInterceptor implements NestInterceptor {
    constructor(private readonly systemHealthService: SystemHealthService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const http = context.switchToHttp();
        const request = http.getRequest();
        if (!request) {
            return next.handle();
        }

        const url = request.url;
        // Skip health/system-health checks to avoid self-loop pollution
        if (url.includes("/compliance/system-health") || url.includes("/health")) {
            return next.handle();
        }

        const startTime = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const duration = Date.now() - startTime;
                    this.systemHealthService.recordHttpRequest(duration, false).catch(() => {});
                    this.systemHealthService.recordServerStatus(true, duration).catch(() => {});
                },
                error: (err) => {
                    const duration = Date.now() - startTime;
                    const isClientError = err?.status >= 400 && err?.status < 500;
                    const isSystemError = !isClientError;

                    // System errors (5xx/unexpected) are marked as OUTAGE for server status and http_requests.
                    // Client errors (4xx) are marked as DEGRADED.
                    this.systemHealthService
                        .recordHttpRequest(duration, isSystemError)
                        .catch(() => {});
                    this.systemHealthService
                        .recordServerStatus(!isSystemError, duration)
                        .catch(() => {});
                },
            }),
        );
    }
}
