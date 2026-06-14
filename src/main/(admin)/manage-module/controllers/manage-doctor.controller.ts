import { AttachmentService } from "@global/attachment/attachment.service";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
    ApiConsumes,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import "multer";
import { CreateDoctorDto } from "../dto/create-doctor.dto";
import { DoctorParamDto } from "../dto/doctor-param.dto";
import { DoctorQueryDto } from "../dto/doctor-query.dto";
import {
    DoctorListResponseDto,
    DoctorResponseDto,
    DoctorTitleListResponseDto,
} from "../dto/doctor-response.dto";
import { UpdateDoctorStatusDto } from "../dto/update-doctor-status.dto";
import { UpdateDoctorDto } from "../dto/update-doctor.dto";
import { ManageDoctorService } from "../services/manage-doctor.service";

@ApiTags("Admin Doctors")
@Controller("admin/doctors")
export class ManageDoctorController {
    constructor(
        private readonly manageDoctorService: ManageDoctorService,
        private readonly attachmentService: AttachmentService,
    ) {}

    @Post()
    @ApiOperation({ summary: "Create a doctor" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("thumbnail"))
    @ApiCreatedResponse({ type: DoctorResponseDto })
    async create(@Body() payload: CreateDoctorDto, @UploadedFile() file?: Express.Multer.File) {
        let avatarId: string | undefined = undefined;
        if (file) {
            const res = await this.attachmentService.upload([file], { context: "DOCTOR_AVATAR" });
            avatarId = Array.isArray(res.data) ? res.data[0].id : (res.data as any).id;
        }

        return this.manageDoctorService.create({
            ...payload,
            avatarId,
        });
    }

    @Get()
    @ApiOperation({ summary: "Get doctors" })
    @ApiOkResponse({ type: DoctorListResponseDto })
    findAll(@Query() query: DoctorQueryDto) {
        return this.manageDoctorService.findAll(query);
    }

    @Get("titles")
    @ApiOperation({ summary: "Get doctor titles" })
    @ApiOkResponse({ type: DoctorTitleListResponseDto })
    findTitles() {
        return this.manageDoctorService.findTitles();
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a doctor by id" })
    @ApiOkResponse({ type: DoctorResponseDto })
    findOne(@Param() params: DoctorParamDto) {
        return this.manageDoctorService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a doctor" })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("thumbnail"))
    @ApiOkResponse({ type: DoctorResponseDto })
    async update(
        @Param() params: DoctorParamDto,
        @Body() payload: UpdateDoctorDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let avatarId: string | undefined = undefined;
        if (file) {
            const res = await this.attachmentService.upload([file], { context: "DOCTOR_AVATAR" });
            avatarId = Array.isArray(res.data) ? res.data[0].id : (res.data as any).id;
        }

        return this.manageDoctorService.update(params.id, {
            ...payload,
            avatarId,
        });
    }

    @Patch(":id/status")
    @ApiOperation({ summary: "Update a doctor status" })
    @ApiOkResponse({ type: DoctorResponseDto })
    updateStatus(@Param() params: DoctorParamDto, @Body() payload: UpdateDoctorStatusDto) {
        return this.manageDoctorService.updateStatus(params.id, payload.status);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a doctor" })
    @ApiNoContentResponse({ description: "Doctor deleted successfully" })
    async remove(@Param() params: DoctorParamDto) {
        await this.manageDoctorService.remove(params.id);
    }
}
