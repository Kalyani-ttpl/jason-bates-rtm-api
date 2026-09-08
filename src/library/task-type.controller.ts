import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/constants";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import {
  CreateTaskTypeDto,
  QueryTaskTypesDto,
  UpdateTaskTypeDto,
} from "./dto/task-type.dto";
import { TaskTypeService } from "./task-type.service";

@ApiTags("Activity Types")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("library/task-types")
export class TaskTypeController {
  constructor(private readonly taskTypeService: TaskTypeService) {}

  @Post()
  @ApiOperation({ summary: "Create an activity type" })
  create(
    @Body() data: CreateTaskTypeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.taskTypeService.create(data, user);
  }

  @Get()
  @ApiOperation({ summary: "List activity types" })
  findAll(@Query() query: QueryTaskTypesDto) {
    return this.taskTypeService.findAll(query);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an activity type by id" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateTaskTypeDto,
  ) {
    return this.taskTypeService.update(id, data);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an activity type by id" })
  remove(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.taskTypeService.remove(id);
  }
}
