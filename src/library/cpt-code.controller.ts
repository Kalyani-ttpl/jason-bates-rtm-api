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
import { CptCodeService } from "./cpt-code.service";
import {
  CreateCptCodeDto,
  QueryCptCodesDto,
  QueryCptHcpcsDto,
  UpdateCptCodeDto,
} from "./dto/cpt-code.dto";

@ApiTags("CPT Codes")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("library/cpt-codes")
export class CptCodeController {
  constructor(private readonly cptCodeService: CptCodeService) {}

  @Post()
  @ApiOperation({ summary: "Create a CPT code" })
  create(@Body() data: CreateCptCodeDto) {
    return this.cptCodeService.create(data);
  }

  @Get("hcpcs/code")
  @ApiOperation({ summary: "Reference CPT/HCPCS code lookup" })
  findCptHcpcsCodes(@Query() query: QueryCptHcpcsDto) {
    return this.cptCodeService.findCptHcpcsCodes(query);
  }

  @Get()
  @ApiOperation({ summary: "List CPT codes with pagination, search and sort" })
  findAll(@Query() query: QueryCptCodesDto) {
    return this.cptCodeService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a CPT code by id" })
  findOne(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.cptCodeService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a CPT code by id" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateCptCodeDto,
  ) {
    return this.cptCodeService.update(id, data);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a CPT code by id" })
  remove(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.cptCodeService.remove(id);
  }
}
