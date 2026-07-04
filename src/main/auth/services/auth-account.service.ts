import { StorageService } from "@global/storage/storage.service";
import { SystemHealthService } from "@main/(compliance)/system-healthar/system-health.service";
import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { AuditLogService } from "../../(compliance)/audit-log/audit-log.service";
import { ConsentRepository } from "../../(compliance)/consent/consent.repository";
import { NotificationService } from "../../notification/notification.service";
import { AuthRepository } from "../auth.repository";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { AuthSessionService } from "./auth-session.service";
import { AuthSharedService } from "./auth-shared.service";

@Injectable()
export class AuthAccountService {
    private readonly logger = new Logger(AuthAccountService.name);

    constructor(
        private readonly authRepository: AuthRepository,
        private readonly authSharedService: AuthSharedService,
        private readonly systemHealthService: SystemHealthService,
        private readonly auditLogService: AuditLogService,
        private readonly storageService: StorageService,
        private readonly notificationService: NotificationService,
        private readonly authSessionService: AuthSessionService,
        private readonly consentRepository: ConsentRepository,
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

        // Auto-record DATA_PROCESSING consent on registration internally
        await this.consentRepository
            .create({
                userId: user.id,
                userName: email,
                email: email,
                type: "DATA_PROCESSING",
                status: "ACCEPTED",
                source: "WEB",
            })
            .catch((err) => {
                this.logger.error(`Failed to auto-create DATA_PROCESSING consent for user ${user.id}`, err);
            });

        // Audit log: new registration
        this.auditLogService
            .createLog({
                userId: user.id,
                userName: email,
                userRole: "Patient",
                activityType: "Login",
                event: "New user registered — OTP verification pending",
                status: "SUCCESS",
            })
            .catch(() => {});

        // Notify all admins about new registration
        this.notificationService
            .sendToAdmins({
                title: "New User Registered",
                message: `A new patient has registered with email: ${email}.]`,
                actionType: "USER_REGISTERED",
                referenceId: user.id,
            })
            .catch(() => {});

        return {
            success: true,
            message: "Registration successful. OTP verification required.",
            data: {
                userId: user.id,
                status: user.status,
            },
        };
    }

    async login(payload: LoginDto, context?: any) {
        try {
            const email = this.authSharedService.normalizeEmail(payload.email);
            const user = await this.authRepository.findUserByEmail(email);

            if (!user || !user.password) {
                // Audit log: failed login — unknown user
                this.auditLogService
                    .createLog({
                        userName: payload.email,
                        userRole: "Unknown",
                        activityType: "Login",
                        event: "Failed login attempt — account not found",
                        ipAddress: context?.ipAddress ?? undefined,
                        status: "FAILED",
                    })
                    .catch(() => {});
                throw new UnauthorizedException("Invalid credentials");
            }


            if (user.status !== "ACTIVE") {
                throw new BadRequestException("Account is not active");
            }

            if (!this.authSharedService.verifyPassword(payload.password, user.password)) {
                const userRole = user.userRoles?.[0]?.role?.name ?? "Patient";
                // Audit log: failed login — wrong password
                this.auditLogService
                    .createLog({
                        userId: user.id,
                        userName: user.email,
                        userRole,
                        activityType: "Login",
                        event: "Failed login attempt — invalid credentials",
                        ipAddress: context?.ipAddress ?? undefined,
                        status: "FAILED",
                    })
                    .catch(() => {});
                throw new UnauthorizedException("Invalid credentials");
            }


            await this.systemHealthService.recordLoginAttempt(true).catch(() => {});

            if (!user.mfaEnabled) {
                await this.authRepository.markLastLogin(user.id);
                const auth = await this.authSessionService.createAuthenticatedResponse(
                    user,
                    null,
                    context ?? {},
                );
                return {
                    success: true,
                    message: "Login successful",
                    data: {
                        accessToken: auth.accessToken,
                        tokenType: auth.tokenType,
                        user: auth.user,
                    },
                    refreshToken: auth.refreshToken,
                };
            }

            return {
                success: true,
                message:
                    "Credentials verified. Please select your verification method to verify OTP",
                data: {
                    userId: user.id,
                    email: user.email,
                    phone: user.phone,
                    status: "OTP_REQUIRED",
                },
            };
        } catch (error) {
            await this.systemHealthService.recordLoginAttempt(false).catch(() => {});
            throw error;
        }
    }

    async getProfile(userId: string) {
        const user = await this.authRepository.findProfileByUserId(userId);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const roles = user.userRoles.map((userRole) => userRole.role.name);
        const role = roles[0]?.toUpperCase() ?? "PATIENT";
        const hasPatientOrDoctor = roles.some(
            (r) => r.toUpperCase() === "PATIENT" || r.toUpperCase() === "DOCTOR",
        );

        let permissions: string[] | undefined = undefined;
        if (!hasPatientOrDoctor) {
            let perms = user.userPermissions?.map((up) => up.permission.key) || [];

            if (roles.includes("ADMIN")) {
                const rolePermissions = user.userRoles.flatMap(
                    (userRole) => userRole.role.permissions?.map((rp) => rp.permission.key) || [],
                );
                perms = Array.from(new Set([...perms, ...rolePermissions]));
            }
            permissions = perms;
        }

        let profile: any = null;
        if (role === "DOCTOR" && user.doctorProfile) {
            const p = user.doctorProfile;
            profile = {
                name: p.name,
                avatar: p.avatar?.fileUrl
                    ? await this.storageService.resolveKey(p.avatar.fileUrl)
                    : null,
                title: p.title,
                featured: p.featured,
                specialty: p.specialty,
                bio: p.bio,
                officeLocation: p.officeLocation,
            };
        } else if (role === "ADMIN" && user.adminProfile) {
            const p = user.adminProfile;
            profile = {
                name: p.name,
                avatar: p.avatar?.fileUrl
                    ? await this.storageService.resolveKey(p.avatar.fileUrl)
                    : null,
                title: p.title,
                specialty: p.specialty,
                bio: p.bio,
                officeLocation: p.officeLocation,
            };
        } else if (user.patientProfile) {
            const p = user.patientProfile;
            profile = {
                name: p.name,
                avatar: p.avatar?.fileUrl
                    ? await this.storageService.resolveKey(p.avatar.fileUrl)
                    : null,
                bio: p.bio,
                address: p.address,
                city: p.city,
                state: p.state,
                zipCode: p.zipCode,
            };
        }

        return {
            success: true,
            statusCode: 200,
            message: "Profile fetched successfully",
            data: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                status: user.status,
                role,
                emailVerifiedAt: user.emailVerifiedAt,
                phoneVerifiedAt: user.phoneVerifiedAt,
                mfaEnabled: user.mfaEnabled,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                permissions,
                profile,
            },
        };
    }

    async updateProfile(userId: string, payload: UpdateProfileDto) {
        const user = await this.authRepository.findProfileByUserId(userId);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const role = user.userRoles?.[0]?.role?.name?.toUpperCase() ?? "PATIENT";

        const {
            avatarId,
            name,
            bio,
            title,
            specialty,
            officeLocation,
            address,
            city,
            state,
            zipCode,
            phone,
        } = payload;

        let profile: any;

        if (phone !== undefined) {
            const normalizedPhone = this.authSharedService.normalizePhone(phone);
            if (normalizedPhone !== user.phone) {
                const existingByPhone = await this.authRepository.findUserByPhone(normalizedPhone);
                if (existingByPhone && existingByPhone.id !== userId) {
                    throw new ConflictException("Account already exists with this phone number");
                }
                await this.authRepository.updateUserContact(userId, { phone: normalizedPhone });
                user.phone = normalizedPhone;
            }
        }

        if (role === "DOCTOR") {
            profile = await this.authRepository.upsertDoctorProfile(userId, {
                ...(name !== undefined && { name }),
                ...(bio !== undefined && { bio }),
                ...(title !== undefined && { title }),
                ...(specialty !== undefined && { specialty }),
                ...(officeLocation !== undefined && { officeLocation }),
                ...(avatarId !== undefined && { avatarId }),
            });
        } else if (role === "ADMIN") {
            profile = await this.authRepository.upsertAdminProfile(userId, {
                ...(name !== undefined && { name }),
                ...(bio !== undefined && { bio }),
                ...(title !== undefined && { title }),
                ...(specialty !== undefined && { specialty }),
                ...(officeLocation !== undefined && { officeLocation }),
                ...(avatarId !== undefined && { avatarId }),
            });
        } else {
            profile = await this.authRepository.upsertPatientProfile(userId, {
                ...(name !== undefined && { name }),
                ...(bio !== undefined && { bio }),
                ...(address !== undefined && { address }),
                ...(city !== undefined && { city }),
                ...(state !== undefined && { state }),
                ...(zipCode !== undefined && { zipCode }),
                ...(avatarId !== undefined && { avatarId }),
            });
        }

        const avatarUrl = profile.avatar?.fileUrl
            ? await this.storageService.resolveKey(profile.avatar.fileUrl)
            : null;

        return {
            success: true,
            statusCode: 200,
            message: "Profile updated successfully",
            data: {
                ...profile,
                phone: user.phone,
                avatar: avatarUrl,
            },
        };
    }

    async toggleMfa(userId: string) {
        const user = await this.authRepository.findUserById(userId);

        if (!user) throw new NotFoundException("User not found");

        const updated = await this.authRepository.toggleMfa(userId, !user.mfaEnabled);

        return {
            success: true,
            statusCode: 200,
            message: `MFA ${updated.mfaEnabled ? "enabled" : "disabled"} successfully`,
            data: { mfaEnabled: updated.mfaEnabled },
        };
    }

    async getPreference(userId: string) {
        const pref = await this.authRepository.findPreference(userId);

        return {
            success: true,
            statusCode: 200,
            message: "Communication preferences fetched successfully",
            data: pref ?? {
                emailNotifications: true,
                smsNotifications: true,
                pushNotifications: true,
            },
        };
    }

    async updatePreference(
        userId: string,
        dto: {
            emailNotifications?: boolean;
            smsNotifications?: boolean;
            pushNotifications?: boolean;
        },
    ) {
        const data = await this.authRepository.upsertPreference(userId, dto);

        return {
            success: true,
            statusCode: 200,
            message: "Communication preferences updated successfully",
            data,
        };
    }

    async getDeviceSessions(userId: string, currentSessionId: string) {
        const activeSessions = await this.authRepository.findActiveSessionsByUserId(userId);

        const devicesMap = new Map<string, any>();

        for (const session of activeSessions) {
            const isCurrentSession = session.id === currentSessionId;
            // Determine device name based on platform or name
            let deviceName = session.device?.name || "Unknown device";
            if (session.device?.platform) {
                deviceName = `${session.device.platform} device`;
            }

            if (!devicesMap.has(deviceName)) {
                devicesMap.set(deviceName, {
                    deviceName,
                    isActiveNow: false,
                    sessionCount: 0,
                    sessions: [],
                });
            }

            const deviceGroup = devicesMap.get(deviceName);
            deviceGroup.sessionCount++;

            if (isCurrentSession) {
                deviceGroup.isActiveNow = true;
            }

            const sessionDueInMs = session.expiresAt.getTime() - Date.now();
            const totalSeconds = Math.max(0, Math.floor(sessionDueInMs / 1000));
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            let sessionDue = "";
            if (hours > 0) sessionDue += `${hours}h `;
            if (minutes > 0 || hours > 0) sessionDue += `${minutes}m `;
            sessionDue += `${seconds}s`;

            deviceGroup.sessions.push({
                sessionId: session.id,
                isCurrentSession,
                lastLogin: session.lastUsedAt || session.createdAt,
                ipAddress: session.ipAddress || "Unknown",
                sessionDue: sessionDue.trim(),
            });
        }

        // Sort so the active device is first
        const devices = Array.from(devicesMap.values()).sort((a, b) => {
            if (a.isActiveNow) return -1;
            if (b.isActiveNow) return 1;
            return 0;
        });

        return {
            success: true,
            statusCode: 200,
            message: "Active sessions retrieved successfully",
            data: devices,
        };
    }
}
