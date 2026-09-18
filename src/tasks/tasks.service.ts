import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BaseService } from "../common/base.service";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import {
  AssignTaskDto,
  BatchTaskDto,
  CreateMultipleTaskDto,
  CreateTaskDto,
  QueryTasksDto,
  ResolveTaskDto,
  UpdateTaskDto,
} from "./dto/task.dto";
import { recurringDates } from "./recurrence";

export const TO_DO = "To Do";
export const DONE = "Done";

/** One request may fan out to patients × occurrences; keep that bounded. */
export const MAX_TASKS_PER_REQUEST = 1000;

const NOT_FOUND = "Task not found";

const TASK_INCLUDE = {
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePicture: true,
      phone: true,
      secondaryPhone: true,
      homePhone: true,
      workPhone: true,
      email: true,
      lastCallAt: true,
      lastCallStatus: true,
      enrollments: {
        where: { deleted: false, unenrolled: false },
        select: { category: true },
      },
    },
  },
  assignee: { select: { id: true, first_name: true, last_name: true } },
  assignedBy: { select: { id: true, first_name: true, last_name: true } },
} satisfies Prisma.TaskInclude;

type TaskRow = Prisma.TaskGetPayload<{ include: typeof TASK_INCLUDE }>;

const SORT: Record<
  string,
  (order: "asc" | "desc") => Prisma.TaskOrderByWithRelationInput[]
> = {
  due_on: (o) => [{ dueDate: o }],
  status: (o) => [{ dueDate: o }],
  created_at: (o) => [{ createdAt: o }],
  updated_at: (o) => [{ updatedAt: o }],
  title: (o) => [{ title: o }],
  priority: (o) => [{ priority: o }],
  patient_name: (o) => [
    { patient: { firstName: o } },
    { patient: { lastName: o } },
  ],
  assignee_name: (o) => [
    { assignee: { first_name: o } },
    { assignee: { last_name: o } },
  ],
  assign_by_name: (o) => [
    { assignedBy: { first_name: o } },
    { assignedBy: { last_name: o } },
  ],
};

@Injectable()
export class TasksService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(TasksService.name);
  }

  /** One task, optionally linked to a patient. */
  async create(data: CreateTaskDto, user: AuthenticatedUser) {
    try {
      const patientId = data.patient ? BigInt(data.patient) : null;
      const [task] = await this.writeTasks(
        data,
        [patientId],
        [this.dueOn(data)],
        user,
      );
      return this.toResponse(task);
    } catch (error) {
      this.handleError(error, "Failed to create task");
    }
  }

  /** The same task for every listed patient, repeated when `recurring_data` is set. */
  async createForPatients(
    data: CreateMultipleTaskDto,
    user: AuthenticatedUser,
  ) {
    try {
      const patientIds = [...new Set(data.patient)].map((id) => BigInt(id));
      const tasks = await this.writeTasks(
        data,
        patientIds,
        this.occurrences(data),
        user,
      );
      return tasks.map((task) => this.toResponse(task));
    } catch (error) {
      this.handleError(error, "Failed to create tasks");
    }
  }

  /** A task repeated on the schedule in `recurring_data`. */
  async createRecurring(data: CreateTaskDto, user: AuthenticatedUser) {
    try {
      if (!data.recurring_data)
        this.throwBadRequestError("Please provide recurring data");

      const patientId = data.patient ? BigInt(data.patient) : null;
      const tasks = await this.writeTasks(
        data,
        [patientId],
        this.occurrences(data),
        user,
      );

      return {
        detail: `${tasks.length} tasks created successfully`,
        enrolled_programs: tasks[0]?.patient?.enrollments ?? [],
        patient: patientId ? { id: patientId } : {},
      };
    } catch (error) {
      this.handleError(error, "Failed to create recurring tasks");
    }
  }

  /** Task list, or one patient's tasks when `patientId` is given. */
  async findAll(
    query: QueryTasksDto,
    user: AuthenticatedUser,
    patientId?: bigint,
  ) {
    try {
      if (patientId) await this.assertPatientsExist([patientId]);

      const pageNo = Math.max(Number(query.page_no) || 1, 1);
      const pageSize = Math.min(
        Math.max(Number(query.page_size) || 20, 1),
        100,
      );
      const order = query.order_by ?? "asc";
      const orderBy = (SORT[query.sort_by ?? "due_on"] ?? SORT.due_on)(order);
      const groupId = query.group_id ? BigInt(query.group_id) : undefined;

      const where: Prisma.TaskWhereInput = {
        ...(patientId && { patientId }),
        ...((query.tasks ?? "to do") === "to do" && { isCompleted: false }),
        // Provider ids start at 1, so a caller with no provider matches nothing.
        ...(query.my_tasks && { assigneeId: user.providerId ?? 0n }),
        ...(query.patient_task && {
          patientId: patientId ?? { not: null },
          ...(groupId && { patient: { providerGroupId: groupId } }),
        }),
        ...(!query.patient_task &&
          query.provider_task && {
            patientId: null,
            ...(groupId && { providerGroupId: groupId }),
          }),
        ...(query.search && { OR: this.searchFilter(query.search) }),
      };

      const [rows, count] = await Promise.all([
        this.prisma.task.findMany({
          where,
          include: TASK_INCLUDE,
          orderBy,
          skip: (pageNo - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.task.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows.map((row) => this.toResponse(row)),
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch tasks");
    }
  }

  async resolve(id: bigint, data: ResolveTaskDto) {
    try {
      await this.assertTasksExist([id]);

      const task = await this.prisma.task.update({
        where: { id },
        data: {
          ...this.resolvedFields(data.completed_on),
          ...(data.note !== undefined && { description: data.note }),
        },
        include: TASK_INCLUDE,
      });
      return this.toResponse(task);
    } catch (error) {
      this.handleError(error, "Failed to resolve task");
    }
  }

  /** Hands the task to someone else and reopens it; unsent fields are kept. */
  async reassign(id: bigint, data: AssignTaskDto, user: AuthenticatedUser) {
    try {
      await this.assertTasksExist([id]);
      await this.assertProviderExists(data.assignee);

      const task = await this.prisma.task.update({
        where: { id },
        data: this.reassignedFields(data, user),
        include: TASK_INCLUDE,
      });

      return {
        assignee: task.assigneeId,
        note: task.description,
        due_on: task.dueDate,
        enrolled_programs: task.patient?.enrollments ?? [],
      };
    } catch (error) {
      this.handleError(error, "Failed to reassign task");
    }
  }

  async update(id: bigint, data: UpdateTaskDto) {
    try {
      await this.assertTasksExist([id]);

      await this.prisma.task.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.priority !== undefined && { priority: data.priority }),
          ...(data.action !== undefined && { action: data.action }),
          ...(data.due_on !== undefined && { dueDate: new Date(data.due_on) }),
          ...(data.note !== undefined && { description: data.note }),
          ...(data.patient_note !== undefined && {
            patientNote: data.patient_note,
          }),
          ...(data.status !== undefined && this.statusFields(data.status)),
        },
      });
      return { detail: "Task updated successfully" };
    } catch (error) {
      this.handleError(error, "Failed to update task");
    }
  }

  /** Resolves or reassigns every listed task, all or nothing. */
  async batch(
    action: "resolve" | "reassign",
    data: BatchTaskDto,
    user: AuthenticatedUser,
  ) {
    try {
      const ids = [...new Set(data.task_ids)].map((id) => BigInt(id));
      await this.assertTasksExist(ids);

      let fields: Prisma.TaskUncheckedUpdateManyInput;
      if (action === "resolve") {
        fields = {
          ...this.resolvedFields(data.completed_on),
          ...(data.note !== undefined && { description: data.note }),
        };
      } else {
        if (!data.assignee)
          this.throwBadRequestError("assignee is required to reassign");
        await this.assertProviderExists(data.assignee!);
        fields = this.reassignedFields(
          { ...data, assignee: data.assignee! },
          user,
        );
      }

      await this.prisma.task.updateMany({
        where: { id: { in: ids } },
        data: fields,
      });

      const enrolled = await this.prisma.task.count({
        where: {
          id: { in: ids },
          patient: {
            enrollments: { some: { deleted: false, unenrolled: false } },
          },
        },
      });

      return {
        detail: `Tasks ${action === "resolve" ? "resolved" : "reassigned"} successfully`,
        enrolled: enrolled > 0,
      };
    } catch (error) {
      this.handleError(error, "Failed to update tasks");
    }
  }

  /**
   * The single write path for every create endpoint: one task per patient per
   * due date, checked up front and inserted in one transaction.
   */
  private async writeTasks(
    data: CreateTaskDto | CreateMultipleTaskDto,
    patientIds: (bigint | null)[],
    dueDates: (Date | null)[],
    user: AuthenticatedUser,
  ): Promise<TaskRow[]> {
    const total = patientIds.length * dueDates.length;
    if (total > MAX_TASKS_PER_REQUEST) {
      this.throwBadRequestError(
        `This would create ${total} tasks; the limit is ${MAX_TASKS_PER_REQUEST} per request`,
      );
    }

    const linked = patientIds.filter((id): id is bigint => id !== null);
    const patientGroups = await this.assertPatientsExist(linked);
    if (data.assignee) await this.assertProviderExists(data.assignee);
    if (data.provider_group) {
      const group = await this.prisma.providerGroup.findUnique({
        where: { id: BigInt(data.provider_group) },
        select: { id: true },
      });
      this.throwNotFoundError(
        group,
        `Provider group ${data.provider_group} not found`,
      );
    }

    const rows = patientIds.flatMap((patientId) =>
      dueDates.map((dueDate) => ({
        title: data.title,
        priority: data.priority,
        action: data.action,
        description: data.note,
        status: TO_DO,
        isCompleted: false,
        dueDate,
        patientId,
        assigneeId: data.assignee ? BigInt(data.assignee) : null,
        assignedById: user.providerId,
        providerGroupId: data.provider_group
          ? BigInt(data.provider_group)
          : patientId
            ? (patientGroups.get(patientId) ?? null)
            : null,
        reminderSet: data.reminder_set ?? false,
        reminderSendToHost: data.reminder_send_to_host ?? false,
        reminderMediums: data.reminder_mediums ?? Prisma.DbNull,
        reminderBeforeNumber: data.reminder_before_number,
        reminderBeforeUnit: data.reminder_before_unit,
        reminderAt: this.reminderAt(dueDate, data),
      })),
    );

    return this.prisma.$transaction(
      rows.map((row) =>
        this.prisma.task.create({ data: row, include: TASK_INCLUDE }),
      ),
    );
  }

  private dueOn(data: { due_on?: string }) {
    return data.due_on ? new Date(data.due_on) : null;
  }

  /** Every due date the request asks for: the schedule, or just `due_on`. */
  private occurrences(
    data: CreateTaskDto | CreateMultipleTaskDto,
  ): (Date | null)[] {
    if (!data.recurring_data) return [this.dueOn(data)];
    if (!data.due_on)
      this.throwBadRequestError("due_on is required for recurring tasks");

    let dates: Date[];
    try {
      dates = recurringDates(data.due_on!, data.recurring_data);
    } catch (error) {
      if (error instanceof RangeError) this.throwBadRequestError(error.message);
      throw error;
    }
    if (!dates.length)
      this.throwBadRequestError("The schedule produces no tasks");
    return dates;
  }

  /** When to send the reminder: `reminder_before_*` ahead of the due date. */
  private reminderAt(
    dueDate: Date | null,
    data: {
      reminder_set?: boolean;
      reminder_before_number?: number;
      reminder_before_unit?: string;
    },
  ): Date | null {
    const unitMs: Record<string, number> = {
      minutes: 60e3,
      hours: 3600e3,
      days: 86400e3,
    };
    const ms = unitMs[data.reminder_before_unit ?? ""];
    if (
      !data.reminder_set ||
      !dueDate ||
      data.reminder_before_number == null ||
      !ms
    ) {
      return null;
    }
    return new Date(dueDate.getTime() - data.reminder_before_number * ms);
  }

  private resolvedFields(completedOn?: string) {
    return {
      status: DONE,
      isCompleted: true,
      completedAt: completedOn ? new Date(completedOn) : new Date(),
    };
  }

  private reassignedFields(
    data: { assignee: number; note?: string; due_on?: string },
    user: AuthenticatedUser,
  ) {
    return {
      assigneeId: BigInt(data.assignee),
      assignedById: user.providerId,
      status: TO_DO,
      isCompleted: false,
      completedAt: null,
      ...(data.note !== undefined && { description: data.note }),
      ...(data.due_on !== undefined && { dueDate: new Date(data.due_on) }),
    };
  }

  /** Zenara's form sends `completed`; the stored values are `To Do` and `Done`. */
  private statusFields(status: string) {
    const normalized = status.trim().toLowerCase();
    if (normalized === "completed" || normalized === "done")
      return this.resolvedFields();
    if (normalized === "to do" || normalized === "to_do") {
      return { status: TO_DO, isCompleted: false, completedAt: null };
    }
    this.throwBadRequestError(`Unsupported status: ${status}`);
    return {};
  }

  private searchFilter(search: string): Prisma.TaskWhereInput[] {
    const contains = { contains: search, mode: "insensitive" as const };
    return [
      { title: contains },
      { priority: contains },
      { status: contains },
      { assignee: { OR: [{ first_name: contains }, { last_name: contains }] } },
      { patient: { OR: [{ firstName: contains }, { lastName: contains }] } },
    ];
  }

  /** Checks every patient exists and returns each one's provider group. */
  private async assertPatientsExist(ids: bigint[]) {
    const groups = new Map<bigint, bigint | null>();
    if (!ids.length) return groups;

    const found = await this.prisma.patient.findMany({
      where: { id: { in: ids } },
      select: { id: true, providerGroupId: true },
    });
    found.forEach((row) => groups.set(row.id, row.providerGroupId));

    const missing = ids.filter((id) => !groups.has(id));
    if (missing.length)
      this.throwNotFoundError(null, `Patient not found: ${missing.join(", ")}`);
    return groups;
  }

  private async assertTasksExist(ids: bigint[]) {
    const found = await this.prisma.task.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const missing = ids.filter((id) => !found.some((row) => row.id === id));
    if (missing.length)
      this.throwNotFoundError(null, `${NOT_FOUND}: ${missing.join(", ")}`);
  }

  private async assertProviderExists(id: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: BigInt(id) },
      select: { id: true },
    });
    this.throwNotFoundError(provider, `Assignee ${id} not found`);
  }

  /**
   * `Overdue` and the flag colour are worked out on read, not stored. Zenara
   * compares against lowercase `done`, which never matches, so its finished
   * tasks always show grey.
   */
  private toResponse(task: TaskRow) {
    const done = task.isCompleted;
    const overdue = !done && task.dueDate !== null && task.dueDate < new Date();
    const lateFinish =
      done &&
      task.dueDate !== null &&
      task.completedAt !== null &&
      task.completedAt > task.dueDate;

    const name = (
      person: { first_name: string | null; last_name: string | null } | null,
    ) =>
      person
        ? `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim()
        : null;
    const patientName = task.patient
      ? `${task.patient.firstName} ${task.patient.lastName}`.trim()
      : null;

    return {
      id: task.id,
      uuid: task.uuid,
      title: task.title,
      action: task.action,
      priority: titleCase(task.priority),
      status: overdue ? "Overdue" : done ? DONE : TO_DO,
      flag: overdue ? "red" : !done ? "grey" : lateFinish ? "yellow" : "green",
      due_on: task.dueDate,
      completed_on: task.completedAt,
      note: task.description,
      patient_note: task.patientNote,
      is_billable: task.isBillable,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      reminder_set: task.reminderSet,
      reminder_send_to_host: task.reminderSendToHost,
      reminder_mediums: task.reminderMediums,
      reminder_before_number: task.reminderBeforeNumber,
      reminder_before_unit: task.reminderBeforeUnit,
      reminder_at: task.reminderAt,
      reminder_sent: task.reminderSent,
      provider_group: task.providerGroupId,
      patient: task.patient
        ? {
            id: task.patient.id,
            name: patientName,
            picture: task.patient.profilePicture,
            phone: task.patient.phone ?? "",
            email: task.patient.email,
            last_call_at: task.patient.lastCallAt,
            last_call_status: task.patient.lastCallStatus,
            secondary_phone: task.patient.secondaryPhone,
            home_phone: task.patient.homePhone,
            work_phone: task.patient.workPhone,
          }
        : null,
      assignee: task.assignee
        ? { id: task.assignee.id, name: name(task.assignee) }
        : null,
      assigned_by: task.assignedBy
        ? { id: task.assignedBy.id, name: name(task.assignedBy) }
        : null,
      patient_name: patientName,
      assignee_name: name(task.assignee),
      assign_by_name: name(task.assignedBy),
      enrolled_programs: task.patient?.enrollments ?? [],
    };
  }
}

/** `high` / `HIGH` / `very_high` → `High` / `Very High`, as Zenara returns them. */
function titleCase(value: string | null) {
  if (!value) return value;
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
