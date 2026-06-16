import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from "@nestjs/common";
import {
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
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

@ApiTags("(Admin) Doctors")
@Controller("admin/doctors")
export class ManageDoctorController {
    constructor(private readonly manageDoctorService: ManageDoctorService) {}

    @Post()
    @ApiOperation({ summary: "Create a doctor" })
    @ApiCreatedResponse({ type: DoctorResponseDto })
    async create(@Body() payload: CreateDoctorDto) {
        const data = await this.manageDoctorService.create(payload);
        return { success: true, statusCode: HttpStatus.CREATED, message: "Doctor created successfully", data };
    }

    @Get()
    @ApiOperation({ summary: "Get doctors" })
    @ApiOkResponse({ type: DoctorListResponseDto })
    async findAll(@Query() query: DoctorQueryDto) {
        const result = await this.manageDoctorService.findAll(query);
        return { success: true, statusCode: HttpStatus.OK, message: "Doctors fetched successfully", ...result };
    }

    @Get("titles")
    @ApiOperation({ summary: "Get doctor titles" })
    @ApiOkResponse({ type: DoctorTitleListResponseDto })
    async findTitles() {
        const result = await this.manageDoctorService.findTitles();
        return { success: true, statusCode: HttpStatus.OK, message: "Doctor titles fetched successfully", ...result };
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a doctor by id" })
    @ApiOkResponse({ type: DoctorResponseDto })
    async findOne(@Param() params: DoctorParamDto) {
        const data = await this.manageDoctorService.findOne(params.id);
        return { success: true, statusCode: HttpStatus.OK, message: "Doctor fetched successfully", data };
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a doctor" })
    @ApiOkResponse({ type: DoctorResponseDto })
    async update(@Param() params: DoctorParamDto, @Body() payload: UpdateDoctorDto) {
        const data = await this.manageDoctorService.update(params.id, payload);
        return { success: true, statusCode: HttpStatus.OK, message: "Doctor updated successfully", data };
    }

    @Patch(":id/status")
    @ApiOperation({ summary: "Update a doctor status" })
    @ApiOkResponse({ type: DoctorResponseDto })
    async updateStatus(@Param() params: DoctorParamDto, @Body() payload: UpdateDoctorStatusDto) {
        const data = await this.manageDoctorService.updateStatus(params.id, payload.status);
        return { success: true, statusCode: HttpStatus.OK, message: "Doctor status updated successfully", data };
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a doctor" })
    @ApiNoContentResponse({ description: "Doctor deleted successfully" })
    async remove(@Param() params: DoctorParamDto) {
        await this.manageDoctorService.remove(params.id);
    }
}
