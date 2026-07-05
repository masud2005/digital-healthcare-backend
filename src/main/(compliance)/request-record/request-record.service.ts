import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateRequestRecordDto } from "./dto/create-request-record.dto";
import { RequestRecordQueryDto } from "./dto/request-record-query.dto";
import { UpdateRequestRecordDto } from "./dto/update-request-record.dto";
import { RequestRecordRepository } from "./request-record.repository";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class RequestRecordService {
    private readonly logger = new Logger(RequestRecordService.name);

    constructor(private readonly requestRecordRepository: RequestRecordRepository) {}

    async create(payload: CreateRequestRecordDto) {
        const data = this.normalizeCreatePayload(payload);
        return this.requestRecordRepository.create(data);
    }

    async getOverview() {
        const counts = await this.requestRecordRepository.getOverview();
        return { counts };
    }

    async findAll(query: RequestRecordQueryDto) {
        const page = query.page ?? DEFAULT_PAGE;
        const limit = query.limit ?? DEFAULT_LIMIT;

        const { data, total } = await this.requestRecordRepository.findAll({
            page,
            limit,
            search: query.search?.trim(),
            requestType: query.requestType,
            status: query.status,
            from: this.parseQueryDate(query.from, "from"),
            to: this.parseQueryDate(query.to, "to"),
        });

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const record = await this.requestRecordRepository.findById(id);
        if (!record) {
            throw new NotFoundException("Request record not found");
        }
        return record;
    }

    async update(id: string, payload: UpdateRequestRecordDto) {
        await this.findOne(id);
        const data = this.normalizeUpdatePayload(payload);

        return this.requestRecordRepository.update(id, data);
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.requestRecordRepository.delete(id);
    }

    private normalizeCreatePayload(payload: CreateRequestRecordDto) {
        const dobDate = new Date(payload.dob);
        if (Number.isNaN(dobDate.getTime())) {
            throw new BadRequestException("Invalid date of birth format");
        }

        return {
            firstName: payload.firstName.trim(),
            lastName: payload.lastName.trim(),
            email: payload.email.trim().toLowerCase(),
            dob: dobDate,
            requestType: payload.requestType,
            additionalNotes: payload.additionalNotes?.trim() || null,
            consent: payload.consent,
            status: payload.status ?? "PENDING",
        };
    }

    private normalizeUpdatePayload(payload: UpdateRequestRecordDto) {
        const data: ReturnType<typeof this.normalizeCreatePayload> = {} as any;

        if (payload.firstName !== undefined) data.firstName = payload.firstName.trim();
        if (payload.lastName !== undefined) data.lastName = payload.lastName.trim();
        if (payload.email !== undefined) data.email = payload.email.trim().toLowerCase();
        if (payload.dob !== undefined) {
            const dobDate = new Date(payload.dob);
            if (Number.isNaN(dobDate.getTime())) {
                throw new BadRequestException("Invalid date of birth format");
            }
            data.dob = dobDate;
        }
        if (payload.requestType !== undefined) data.requestType = payload.requestType;
        if (payload.additionalNotes !== undefined)
            data.additionalNotes = payload.additionalNotes?.trim() || null;
        if (payload.consent !== undefined) data.consent = payload.consent;
        if (payload.status !== undefined) data.status = payload.status;

        return data;
    }

    private parseQueryDate(value: string | undefined, fieldName: string) {
        if (!value) {
            return undefined;
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${fieldName} must be a valid date`);
        }

        return date;
    }
}
