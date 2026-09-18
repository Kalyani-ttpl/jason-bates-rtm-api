import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../common/constants";
import { MAX_TASKS_PER_REQUEST, TasksService } from "./tasks.service";

const USER = { id: 1n, providerId: 7n } as AuthenticatedUser;
const HOUR = 3600e3;

const taskRow = (overrides: Record<string, unknown> = {}) => ({
  id: 1n,
  uuid: "u1",
  title: "Call patient",
  action: "call",
  priority: "high",
  description: "note",
  patientNote: null,
  status: "To Do",
  isCompleted: false,
  dueDate: new Date(Date.now() + HOUR),
  completedAt: null,
  isBillable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  reminderSet: false,
  reminderSendToHost: false,
  reminderMediums: null,
  reminderBeforeNumber: null,
  reminderBeforeUnit: null,
  reminderAt: null,
  reminderSent: false,
  providerGroupId: 3n,
  assigneeId: 7n,
  patient: {
    id: 5n,
    firstName: "Isidro",
    lastName: "McGlynn",
    profilePicture: null,
    phone: null,
    secondaryPhone: null,
    homePhone: null,
    workPhone: null,
    email: null,
    lastCallAt: null,
    lastCallStatus: null,
    enrollments: [{ category: "rtm" }],
  },
  assignee: { id: 7n, first_name: "Jason", last_name: "Bates" },
  assignedBy: { id: 7n, first_name: "Jason", last_name: "Bates" },
  ...overrides,
});

describe("TasksService", () => {
  let task: any;
  let prisma: any;
  let service: TasksService;

  beforeEach(() => {
    task = {
      create: jest.fn((args: any) => Promise.resolve(taskRow(args.data))),
      findMany: jest.fn().mockResolvedValue([taskRow()]),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockResolvedValue(taskRow()),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    };
    prisma = {
      task,
      patient: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 5n, providerGroupId: 3n }]),
      },
      provider: { findUnique: jest.fn().mockResolvedValue({ id: 7n }) },
      providerGroup: { findUnique: jest.fn().mockResolvedValue({ id: 3n }) },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    service = new TasksService(prisma);
  });

  const created = () =>
    task.create.mock.calls.map((call: any[]) => call[0].data);

  describe("create", () => {
    it("creates one open task credited to the caller", async () => {
      await service.create({ title: "Call", patient: 5, assignee: 7 }, USER);

      expect(created()).toHaveLength(1);
      expect(created()[0]).toMatchObject({
        status: "To Do",
        isCompleted: false,
        patientId: 5n,
        assigneeId: 7n,
        assignedById: 7n,
      });
    });

    it("falls back to the patient's provider group", async () => {
      await service.create({ title: "Call", patient: 5 }, USER);

      expect(created()[0].providerGroupId).toBe(3n);
    });

    it("prefers an explicit provider group", async () => {
      prisma.providerGroup.findUnique.mockResolvedValue({ id: 9n });

      await service.create(
        { title: "Call", patient: 5, provider_group: 9 },
        USER,
      );

      expect(created()[0].providerGroupId).toBe(9n);
    });

    it("creates a provider task with no patient or group", async () => {
      await service.create({ title: "Admin" }, USER);

      expect(created()[0]).toMatchObject({
        patientId: null,
        providerGroupId: null,
      });
      expect(prisma.patient.findMany).not.toHaveBeenCalled();
    });

    it("works out when to send the reminder", async () => {
      await service.create(
        {
          title: "Call",
          due_on: "2026-09-20T10:00:00.000Z",
          reminder_set: true,
          reminder_before_number: 30,
          reminder_before_unit: "minutes",
        },
        USER,
      );

      expect(created()[0].reminderAt).toEqual(
        new Date("2026-09-20T09:30:00.000Z"),
      );
    });

    it("sets no reminder time when reminders are off", async () => {
      await service.create(
        {
          title: "Call",
          due_on: "2026-09-20T10:00:00.000Z",
          reminder_before_number: 30,
          reminder_before_unit: "minutes",
        },
        USER,
      );

      expect(created()[0].reminderAt).toBeNull();
    });

    it("404s for an unknown patient", async () => {
      prisma.patient.findMany.mockResolvedValue([]);

      await expect(
        service.create({ title: "Call", patient: 99 }, USER),
      ).rejects.toThrow("Patient not found: 99");
      expect(task.create).not.toHaveBeenCalled();
    });

    it("404s for an unknown assignee", async () => {
      prisma.provider.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ title: "Call", assignee: 99 }, USER),
      ).rejects.toThrow(NotFoundException);
    });

    it("ignores recurring_data, as Zenara's plain create does", async () => {
      await service.create(
        {
          title: "Call",
          due_on: "2026-09-20T10:00:00.000Z",
          recurring_data: { recurringFrequency: "daily", endAfter: 5 },
        },
        USER,
      );

      expect(created()).toHaveLength(1);
    });
  });

  describe("createForPatients", () => {
    beforeEach(() => {
      prisma.patient.findMany.mockResolvedValue([
        { id: 5n, providerGroupId: 3n },
        { id: 6n, providerGroupId: 4n },
      ]);
    });

    it("creates one task per patient in a single transaction", async () => {
      const result: any = await service.createForPatients(
        { title: "Call", patient: [5, 6] },
        USER,
      );

      expect(result).toHaveLength(2);
      expect(created().map((row: any) => row.patientId)).toEqual([5n, 6n]);
      expect(created().map((row: any) => row.providerGroupId)).toEqual([
        3n,
        4n,
      ]);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it("de-duplicates repeated patient ids", async () => {
      await service.createForPatients(
        { title: "Call", patient: [5, 5, 6] },
        USER,
      );

      expect(created()).toHaveLength(2);
    });

    it("multiplies patients by recurring dates", async () => {
      await service.createForPatients(
        {
          title: "Call",
          patient: [5, 6],
          due_on: "2026-09-20T10:00:00.000Z",
          recurring_data: { recurringFrequency: "daily", endAfter: 3 },
        },
        USER,
      );

      expect(created()).toHaveLength(6);
    });

    it("refuses a request that would exceed the task limit", async () => {
      const patient = Array.from({ length: 100 }, (_, i) => i + 1);
      prisma.patient.findMany.mockResolvedValue(
        patient.map((id) => ({ id: BigInt(id), providerGroupId: null })),
      );

      await expect(
        service.createForPatients(
          {
            title: "Call",
            patient,
            due_on: "2026-09-20T10:00:00.000Z",
            recurring_data: { recurringFrequency: "daily", endAfter: 11 },
          },
          USER,
        ),
      ).rejects.toThrow(`limit is ${MAX_TASKS_PER_REQUEST}`);
      expect(task.create).not.toHaveBeenCalled();
    });
  });

  describe("createRecurring", () => {
    it("creates one task per occurrence", async () => {
      const result: any = await service.createRecurring(
        {
          title: "Weekly check-in",
          patient: 5,
          due_on: "2026-09-20T10:00:00.000Z",
          recurring_data: { recurringFrequency: "weekly", endAfter: 4 },
        },
        USER,
      );

      expect(created()).toHaveLength(4);
      expect(result).toMatchObject({
        detail: "4 tasks created successfully",
        enrolled_programs: [{ category: "rtm" }],
        patient: { id: 5n },
      });
    });

    it("400s without recurring data", async () => {
      await expect(
        service.createRecurring(
          { title: "Call", due_on: "2026-09-20T10:00:00.000Z" },
          USER,
        ),
      ).rejects.toThrow("Please provide recurring data");
    });

    it("400s without a start date", async () => {
      await expect(
        service.createRecurring(
          {
            title: "Call",
            recurring_data: { recurringFrequency: "daily", endAfter: 2 },
          },
          USER,
        ),
      ).rejects.toThrow("due_on is required");
    });

    it("turns an oversized schedule into a 400", async () => {
      await expect(
        service.createRecurring(
          {
            title: "Call",
            due_on: "2026-09-20T10:00:00.000Z",
            recurring_data: {
              recurringFrequency: "daily",
              endType: "on_date",
              endDate: "2099-01-01",
            },
          },
          USER,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("400s when the schedule produces nothing", async () => {
      await expect(
        service.createRecurring(
          {
            title: "Call",
            due_on: "2026-09-20T10:00:00.000Z",
            recurring_data: {
              recurringFrequency: "daily",
              endType: "on_date",
              endDate: "2026-09-01",
            },
          },
          USER,
        ),
      ).rejects.toThrow("The schedule produces no tasks");
    });
  });

  describe("findAll", () => {
    const where = () => task.findMany.mock.calls[0][0].where;

    it("shows open tasks by default", async () => {
      await service.findAll({}, USER);

      expect(where()).toMatchObject({ isCompleted: false });
    });

    it("shows everything when tasks=all", async () => {
      await service.findAll({ tasks: "all" }, USER);

      expect(where()).not.toHaveProperty("isCompleted");
    });

    it("narrows to the caller's own tasks", async () => {
      await service.findAll({ my_tasks: true }, USER);

      expect(where().assigneeId).toBe(7n);
    });

    it("matches nothing for my_tasks when the caller is not a provider", async () => {
      await service.findAll({ my_tasks: true }, {
        id: 1n,
        providerId: null,
      } as AuthenticatedUser);

      expect(where().assigneeId).toBe(0n);
    });

    it("scopes patient tasks to the group through the patient", async () => {
      await service.findAll({ patient_task: true, group_id: "3" }, USER);

      expect(where()).toMatchObject({
        patientId: { not: null },
        patient: { providerGroupId: 3n },
      });
    });

    it("scopes provider tasks to the group on the task", async () => {
      await service.findAll({ provider_task: true, group_id: "3" }, USER);

      expect(where()).toMatchObject({ patientId: null, providerGroupId: 3n });
    });

    it("lists one patient's tasks, 404ing for an unknown patient", async () => {
      await service.findAll({}, USER, 5n);
      expect(where().patientId).toBe(5n);

      prisma.patient.findMany.mockResolvedValue([]);
      await expect(service.findAll({}, USER, 99n)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("sorts by due date ascending by default and by name on request", async () => {
      await service.findAll({}, USER);
      expect(task.findMany.mock.calls[0][0].orderBy).toEqual([
        { dueDate: "asc" },
      ]);

      await service.findAll(
        { sort_by: "patient_name", order_by: "desc" },
        USER,
      );
      expect(task.findMany.mock.calls[1][0].orderBy).toEqual([
        { patient: { firstName: "desc" } },
        { patient: { lastName: "desc" } },
      ]);
    });

    it("falls back to due date for an unknown sort_by", async () => {
      await service.findAll({ sort_by: "nonsense" }, USER);

      expect(task.findMany.mock.calls[0][0].orderBy).toEqual([
        { dueDate: "asc" },
      ]);
    });
  });

  describe("response", () => {
    const first = async () =>
      ((await service.findAll({}, USER)) as any).results[0];

    it("marks an open task past its due date as Overdue and red", async () => {
      task.findMany.mockResolvedValue([
        taskRow({ dueDate: new Date(Date.now() - HOUR) }),
      ]);

      expect(await first()).toMatchObject({ status: "Overdue", flag: "red" });
    });

    it("shows an open task not yet due as To Do and grey", async () => {
      expect(await first()).toMatchObject({ status: "To Do", flag: "grey" });
    });

    it("flags a task finished on time green", async () => {
      const due = new Date("2026-09-20T10:00:00Z");
      task.findMany.mockResolvedValue([
        taskRow({
          isCompleted: true,
          dueDate: due,
          completedAt: new Date("2026-09-19T10:00:00Z"),
        }),
      ]);

      expect(await first()).toMatchObject({ status: "Done", flag: "green" });
    });

    it("flags a task finished late yellow", async () => {
      const due = new Date("2026-09-20T10:00:00Z");
      task.findMany.mockResolvedValue([
        taskRow({
          isCompleted: true,
          dueDate: due,
          completedAt: new Date("2026-09-21T10:00:00Z"),
        }),
      ]);

      expect(await first()).toMatchObject({ status: "Done", flag: "yellow" });
    });

    it("maps to Zenara's snake_case shape with names and programs", async () => {
      task.findMany.mockResolvedValue([taskRow({ priority: "very_high" })]);

      expect(await first()).toMatchObject({
        priority: "Very High",
        note: "note",
        patient: { id: 5n, name: "Isidro McGlynn" },
        assignee: { id: 7n, name: "Jason Bates" },
        patient_name: "Isidro McGlynn",
        assign_by_name: "Jason Bates",
        enrolled_programs: [{ category: "rtm" }],
      });
    });
  });

  describe("resolve, reassign and update", () => {
    it("resolves with the given completion time", async () => {
      await service.resolve(1n, {
        completed_on: "2026-09-19T10:00:00.000Z",
        note: "done",
      });

      expect(task.update.mock.calls[0][0].data).toEqual({
        status: "Done",
        isCompleted: true,
        completedAt: new Date("2026-09-19T10:00:00.000Z"),
        description: "done",
      });
    });

    it("404s when resolving an unknown task", async () => {
      task.findMany.mockResolvedValue([]);

      await expect(service.resolve(99n, {})).rejects.toThrow(
        "Task not found: 99",
      );
    });

    it("reassigns and reopens without wiping the due date or note", async () => {
      await service.reassign(1n, { assignee: 8 }, USER);

      const data = task.update.mock.calls[0][0].data;
      expect(data).toMatchObject({
        assigneeId: 8n,
        assignedById: 7n,
        status: "To Do",
        isCompleted: false,
        completedAt: null,
      });
      expect(data).not.toHaveProperty("dueDate");
      expect(data).not.toHaveProperty("description");
    });

    it("only writes the fields supplied on update", async () => {
      await service.update(1n, { title: "Renamed" });

      expect(task.update.mock.calls[0][0].data).toEqual({ title: "Renamed" });
    });

    it("treats status completed as resolving", async () => {
      await service.update(1n, { status: "completed" });

      expect(task.update.mock.calls[0][0].data).toMatchObject({
        status: "Done",
        isCompleted: true,
      });
    });

    it("rejects an unknown status", async () => {
      await expect(service.update(1n, { status: "archived" })).rejects.toThrow(
        "Unsupported status: archived",
      );
    });
  });

  describe("batch", () => {
    beforeEach(() => {
      task.findMany.mockResolvedValue([{ id: 1n }, { id: 2n }]);
    });

    it("resolves every task in one update", async () => {
      const result = await service.batch("resolve", { task_ids: [1, 2] }, USER);

      expect(task.updateMany).toHaveBeenCalledTimes(1);
      expect(task.updateMany.mock.calls[0][0].where).toEqual({
        id: { in: [1n, 2n] },
      });
      expect(result).toEqual({
        detail: "Tasks resolved successfully",
        enrolled: true,
      });
    });

    it("writes nothing when any task is missing", async () => {
      task.findMany.mockResolvedValue([{ id: 1n }]);

      await expect(
        service.batch("resolve", { task_ids: [1, 2] }, USER),
      ).rejects.toThrow("Task not found: 2");
      expect(task.updateMany).not.toHaveBeenCalled();
    });

    it("requires an assignee to reassign, checked once", async () => {
      await expect(
        service.batch("reassign", { task_ids: [1, 2] }, USER),
      ).rejects.toThrow("assignee is required");

      await service.batch("reassign", { task_ids: [1, 2], assignee: 8 }, USER);
      expect(prisma.provider.findUnique).toHaveBeenCalledTimes(1);
      expect(task.updateMany.mock.calls[0][0].data).toMatchObject({
        assigneeId: 8n,
      });
    });

    it("reports enrolled false when no task's patient is enrolled", async () => {
      task.count.mockResolvedValue(0);

      const result = await service.batch("resolve", { task_ids: [1, 2] }, USER);

      expect(result).toMatchObject({
        enrolled: false,
        detail: "Tasks resolved successfully",
      });
    });
  });
});
