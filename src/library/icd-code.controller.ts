import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import {
  CreateIcdCodeDto,
  QueryIcdCodesDto,
  UpdateIcdCodeDto,
  UploadIcdCodesDto,
} from "./dto/icd-code.dto";
import { IcdCodeService } from "./icd-code.service";

@ApiTags("ICD Codes")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("library/icd-codes")
export class IcdCodeController {
  constructor(private readonly icdCodeService: IcdCodeService) {}

  @Post()
  @ApiOperation({ summary: "Create an ICD code" })
  create(@Body() data: CreateIcdCodeDto) {
    return this.icdCodeService.create(data);
  }

  @Post("upload")
  @ApiOperation({ summary: "Bulk import ICD codes, skipping existing codes" })
  bulkUpload(@Body() data: UploadIcdCodesDto) {
    return this.icdCodeService.bulkUpload(data.codes);
  }

  @Get()
  @ApiOperation({ summary: "List ICD codes with pagination, search and sort" })
  findAll(@Query() query: QueryIcdCodesDto) {
    return this.icdCodeService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an ICD code by id" })
  findOne(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.icdCodeService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an ICD code by id" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateIcdCodeDto,
  ) {
    return this.icdCodeService.update(id, data);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an ICD code by id" })
  remove(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.icdCodeService.remove(id);
  }
}
