import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { SystemHealthService } from "../../(compliance)/system-health/system-health.service";
import { AuthRepository } from "../auth.repository";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { AuthSharedService } from "./auth-shared.service";

@Injectable()
export class AuthAccountService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly authSharedService: AuthSharedService,
        private readonly systemHealthService: SystemHealthService,
    ) {}

    async register(payload: RegisterDto) {
        const email = this.authSharedService.normalizeEmail(payload.email);
        const phone = this.authSharedService.normalizePhone(payload.phone);
        const password = payload.password.trim();
        const confirmPassword = payload.confirmPassword.trim();

        if (password !== confirmPassword) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        const existingByEmail = await this.authRepository.findUserByEmail(email);
        if (existingByEmail?.status === "ACTIVE") {
            throw new ConflictException("Account already exists with this email");
        }

        const existingByPhone = await this.authRepository.findUserByPhone(phone);
        if (existingByPhone && existingByPhone.id !== existingByEmail?.id) {
            throw new ConflictException("Account already exists with this phone");
        }

        const user = await this.authRepository.createOrUpdatePendingUser({
            userId: existingByEmail?.id,
            email,
            phone,
            password: this.authSharedService.hashPassword(password),
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return {
            success: true,
            message: "Registration successful. OTP verification required.",
            data: {
                userId: user.id,
                status: user.status,
            },
        };
    }

    async login(payload: LoginDto) {
        try {
            const email = this.authSharedService.normalizeEmail(payload.email);
            const user = await this.authRepository.findUserByEmail(email);

            if (!user || !user.password) {
                throw new UnauthorizedException("Invalid credentials");
            }

            if (user.status !== "ACTIVE") {
                throw new BadRequestException("Account is not active");
            }

            if (!this.authSharedService.verifyPassword(payload.password, user.password)) {
                throw new UnauthorizedException("Invalid credentials");
            }

            await this.systemHealthService.recordLoginAttempt(true).catch(() => {});

            return {
                success: true,
                message: "Credentials verified. OTP verification required.",
                data: {
                    userId: user.id,
                    status: "OTP_REQUIRED",
                },
            };
        } catch (error) {
            await this.systemHealthService.recordLoginAttempt(false).catch(() => {});
            throw error;
        }
    }

    async getProfile(userId: string) {
        const user = await this.authRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return {
            success: true,
            message: "Profile fetched successfully",
            data: this.authSharedService.mapUser(user),
        };
    }
}
