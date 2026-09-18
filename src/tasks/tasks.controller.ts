import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/constants";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import {
  AssignTaskDto,
  BatchTaskDto,
  CreateMultipleTaskDto,
  CreateTaskDto,
  QueryTasksDto,
  ResolveTaskDto,
  UpdateTaskDto,
} from "./dto/task.dto";
import { TasksService } from "./tasks.service";

/** Paths follow Zenara, including `recuring-task`, so the frontend is unchanged. */
@ApiTags("Tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post("tasks")
  @ApiOperation({ summary: "Create a task" })
  create(@Body() data: CreateTaskDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tasks.create(data, user);
  }

  @Post("tasks/batch_task_creation")
  @ApiOperation({ summary: "Create the same task for several patients" })
  createForPatients(
    @Body() data: CreateMultipleTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasks.createForPatients(data, user);
  }

  @Post("tasks/recuring-task")
  @ApiOperation({ summary: "Create a recurring task" })
  createRecurring(
    @Body() data: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasks.createRecurring(data, user);
  }

  @Get("tasks")
  @ApiOperation({ summary: "List tasks" })
  findAll(
    @Query() query: QueryTasksDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasks.findAll(query, user);
  }

  @Get("patients/:id/tasks")
  @ApiOperation({ summary: "List a patient's tasks" })
  findForPatient(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Query() query: QueryTasksDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasks.findAll(query, user, id);
  }

  @Post("tasks/batch_resolve_task")
  @ApiOperation({ summary: "Resolve several tasks" })
  batchResolve(
    @Body() data: BatchTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasks.batch("resolve", data, user);
  }

  @Post("tasks/batch_reassign_task")
  @ApiOperation({ summary: "Reassign several tasks" })
  batchReassign(
    @Body() data: BatchTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasks.batch("reassign", data, user);
  }

  @Post("tasks/:id/resolve")
  @ApiOperation({ summary: "Resolve a task" })
  resolve(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: ResolveTaskDto,
  ) {
    return this.tasks.resolve(id, data);
  }

  @Post("tasks/:id/assign")
  @ApiOperation({ summary: "Reassign a task" })
  reassign(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: AssignTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasks.reassign(id, data, user);
  }

  @Post("tasks/:id/update_task")
  @ApiOperation({ summary: "Update a task" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateTaskDto,
  ) {
    return this.tasks.update(id, data);
  }
}
