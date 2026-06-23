import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PublicDoctorService } from "./public-doctor.service";

@ApiTags("(Public) Doctors")
@Controller("public/doctors")
export class PublicDoctorController {
    constructor(private readonly publicDoctorService: PublicDoctorService) {}

    @Get()
    @ApiOperation({ summary: "Get all active doctors for the public website" })
    @ApiOkResponse({ description: "List of active doctors" })
    async getActiveDoctors() {
        const data = await this.publicDoctorService.getActiveDoctors();
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Active doctors fetched successfully",
            data,
        };
    }

    @Get("list")
    @ApiOperation({ summary: "Get all active doctors with just name and id" })
    @ApiOkResponse({ description: "Simple list of active doctors" })
    async getActiveDoctorsList() {
        const data = await this.publicDoctorService.getActiveDoctorsList();
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Active doctors list fetched successfully",
            data,
        };
    }
}
