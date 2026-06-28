import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PatientAssessmentQueryDto } from "./dto/assessment-query.dto";
import { AssignDoctorDto } from "./dto/assign-doctor.dto";
import { PatientParamDto } from "./dto/patient-param.dto";
import { PatientQueryDto } from "./dto/patient-query.dto";
import { UpdatePatientStatusDto } from "./dto/update-patient-status.dto";
import { PatientManageService } from "./patient-manage.service";

@ApiTags("(Admin) Patient Manage")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/patient-manage")
export class PatientManageController {
    constructor(private readonly patientManageService: PatientManageService) {}

    @Get("all-assessments")
    @ApiOperation({ summary: "Get all patient assessment submissions (excludes DRAFT)" })
    async findAllAssessments(@Query() query: PatientAssessmentQueryDto) {
        const result = await this.patientManageService.findAllAssessments(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Assessments fetched successfully",
            ...result,
        };
    }

    @Get("all-assessments/:id")
    @ApiOperation({ summary: "Get a single assessment submission by submissionId" })
    async findAssessmentById(@Param() params: PatientParamDto) {
        const data = await this.patientManageService.findAssessmentSubmissionById(params.id);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Assessment submission fetched successfully",
            data,
        };
    }

    @Get("all-categories")
    @ApiOperation({ summary: "Get all categories (id and name)" })
    async findAllCategories() {
        const result = await this.patientManageService.findAllCategories();
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Categories fetched successfully",
            ...result,
        };
    }

    @Get("all-doctors")
    @ApiOperation({ summary: "Get all doctors (id and name)" })
    async findAllDoctors() {
        const result = await this.patientManageService.findAllDoctors();
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Doctors fetched successfully",
            ...result,
        };
    }

    @Post("assign")
    @ApiOperation({ summary: "Assign a doctor to an assessment submission" })
    async assignDoctor(@Body() payload: AssignDoctorDto) {
        const data = await this.patientManageService.assignDoctor(
            payload.submissionId,
            payload.doctorId,
        );
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Doctor assigned successfully",
            data,
        };
    }

    @Get("all-patients")
    @ApiOperation({ summary: "Get all patients" })
    async findAllPatients(@Query() query: PatientQueryDto) {
        const result = await this.patientManageService.findAllPatients(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Patients fetched successfully",
            ...result,
        };
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a single patient by id" })
    async findPatientById(@Param() params: PatientParamDto) {
        const data = await this.patientManageService.findPatientById(params.id);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Patient fetched successfully",
            data,
        };
    }

    @Patch("status/:id")
    @ApiOperation({ summary: "Update patient status (Deleted = soft delete)" })
    async updateStatus(@Param() params: PatientParamDto, @Body() payload: UpdatePatientStatusDto) {
        const data = await this.patientManageService.updatePatientStatus(params.id, payload.status);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Patient status updated successfully",
            data,
        };
    }
}
