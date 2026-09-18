import { ValidationPipe } from "@nestjs/common";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../common/constants";
import { QueryEducationDto } from "./dto/education.dto";
import { EducationService, fileTypeOf } from "./education.service";

const USER = { id: 1n, providerId: 7n } as AuthenticatedUser;

const material = (overrides: Record<string, unknown> = {}) => ({
  id: 1n,
  uuid: "u1",
  title: "Managing blood pressure",
  description: "d",
  speciality: null,
  specialities: ["cardiology"],
  userTypes: ["patient"],
  url: "data:application/pdf;base64,AAAA",
  fileType: "PDF",
  isActive: true,
  isArchived: false,
  providerGroupId: 3n,
  createdAt: new Date(),
  updatedAt: new Date(),
  conditions: [{ condition_id: 2n, condition: { title: "Hypertension" } }],
  assignments: [{ patientId: 5n }],
  ...overrides,
});

const schedule = (overrides: Record<string, unknown> = {}) => ({
  id: 9n,
  send_at: new Date("2026-09-20T10:00:00Z"),
  status: "schedule",
  created_at: new Date(),
  send_by: { id: 7n, first_name: "Jason", last_name: "Bates" },
  scheduled_by: { id: 7n, first_name: "Jason", last_name: "Bates" },
  cancelled_at: null,
  cancelled_by: null,
  patients: [
    {
      patient: {
        id: 5n,
        firstName: "Isidro",
        lastName: "McGlynn",
        email: "i@example.com",
        phone: null,
      },
    },
  ],
  education: material(),
  ...overrides,
});

describe("EducationService", () => {
  let prisma: any;
  let tx: any;
  let service: EducationService;

  beforeEach(() => {
    tx = {
      educationMaterial: {
        create: jest.fn().mockResolvedValue({ id: 1n }),
        findUniqueOrThrow: jest.fn().mockResolvedValue(material()),
      },
      educationMaterialCondition: {
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    prisma = {
      educationMaterial: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(material()),
        findMany: jest.fn().mockResolvedValue([material()]),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockResolvedValue(material()),
      },
      patientEducationMaterial: {
        findMany: jest.fn().mockResolvedValue([]),
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(0),
      },
      educationSchedule: {
        create: jest.fn((args: any) =>
          Promise.resolve(schedule({ send_at: args.data.send_at })),
        ),
        findUnique: jest.fn().mockResolvedValue({ status: "schedule" }),
        findMany: jest.fn().mockResolvedValue([schedule()]),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockResolvedValue({}),
      },
      patient: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 5n,
            firstName: "Isidro",
            lastName: "McGlynn",
            email: "i@example.com",
          },
        ]),
      },
      provider: { findUnique: jest.fn().mockResolvedValue({ id: 7n }) },
      providerGroup: { findUnique: jest.fn().mockResolvedValue({ id: 3n }) },
      condition: { findMany: jest.fn().mockResolvedValue([{ id: 2n }]) },
      $transaction: jest.fn((arg: any) =>
        typeof arg === "function" ? arg(tx) : Promise.all(arg),
      ),
    };
    service = new EducationService(prisma);
  });

  describe("fileTypeOf", () => {
    it("reads the type from a data URL", () => {
      expect(fileTypeOf("data:application/pdf;base64,AAAA")).toBe("PDF");
      expect(fileTypeOf("data:image/png;base64,AAAA")).toBe("PNG");
    });

    it("returns null for a plain key or nothing", () => {
      expect(fileTypeOf("media/education/a.pdf")).toBeNull();
      expect(fileTypeOf(undefined)).toBeNull();
    });
  });

  describe("create", () => {
    it("stores the file, its type and the caller, linking each condition", async () => {
      const result: any = await service.create(
        {
          title: "BP",
          file: "data:application/pdf;base64,AAAA",
          conditions: [2, 2],
          provider_group: "3",
        },
        USER,
      );

      expect(tx.educationMaterial.create.mock.calls[0][0].data).toMatchObject({
        url: "data:application/pdf;base64,AAAA",
        fileType: "PDF",
        addedById: 7n,
        providerGroupId: 3n,
        isArchived: false,
        isActive: false,
      });
      expect(
        tx.educationMaterialCondition.createMany.mock.calls[0][0].data,
      ).toEqual([{ education_material_id: 1n, condition_id: 2n }]);
      expect(result).toMatchObject({
        conditions: [2n],
        condition_title: ["Hypertension"],
      });
    });

    it("stores an empty url when no file is sent and returns file null", async () => {
      tx.educationMaterial.findUniqueOrThrow.mockResolvedValue(
        material({ url: "" }),
      );

      const result: any = await service.create({ title: "No file" }, USER);

      expect(tx.educationMaterial.create.mock.calls[0][0].data.url).toBe("");
      expect(result.file).toBeNull();
    });

    it("409s on a title that already exists, in any case", async () => {
      prisma.educationMaterial.findFirst.mockResolvedValue({ id: 2n });

      await expect(service.create({ title: "bp" }, USER)).rejects.toThrow(
        ConflictException,
      );
      expect(
        prisma.educationMaterial.findFirst.mock.calls[0][0].where.title,
      ).toEqual({
        equals: "bp",
        mode: "insensitive",
      });
    });

    it("names a missing condition", async () => {
      prisma.condition.findMany.mockResolvedValue([]);

      await expect(
        service.create({ title: "BP", conditions: [44] }, USER),
      ).rejects.toThrow("Condition not found: 44");
    });
  });

  describe("findAll", () => {
    const where = () =>
      prisma.educationMaterial.findMany.mock.calls[0][0].where;

    it("hides archived materials unless asked", async () => {
      await service.findAll({});
      expect(where().isArchived).toBe(false);

      await service.findAll({ is_archived: "true" });
      expect(
        prisma.educationMaterial.findMany.mock.calls[1][0].where.isArchived,
      ).toBe(true);
    });

    it("applies speciality and user_types together, not one overwriting the other", async () => {
      await service.findAll({
        speciality: "cardiology,renal",
        user_types: "patient",
      });

      expect(where().AND).toEqual([
        {
          OR: [
            { specialities: { array_contains: ["cardiology"] } },
            { specialities: { array_contains: ["renal"] } },
          ],
        },
        { OR: [{ userTypes: { array_contains: ["patient"] } }] },
      ]);
    });

    it("filters by condition ids and ignores anything non-numeric", async () => {
      await service.findAll({ condition: "2, x ,3" });

      expect(where().AND).toEqual([
        { conditions: { some: { condition_id: { in: [2n, 3n] } } } },
      ]);
    });

    it("narrows to one patient's assigned materials", async () => {
      await service.findAll({}, 5n);

      expect(where().assignments).toEqual({ some: { patientId: 5n } });
    });

    it("maps to Zenara's shape with id lists", async () => {
      const result: any = await service.findAll({});

      expect(result).toMatchObject({ count: 1, next: null, previous: null });
      expect(result.results[0]).toMatchObject({
        file: "data:application/pdf;base64,AAAA",
        file_type: "PDF",
        user_types: ["patient"],
        provider_group: 3n,
        patient: [5n],
        conditions: [2n],
      });
    });

    it("sorts by title only when asked", async () => {
      await service.findAll({});
      expect(
        prisma.educationMaterial.findMany.mock.calls[0][0].orderBy,
      ).toEqual({
        createdAt: "desc",
      });

      await service.findAll({ sort_by: "title" });
      expect(
        prisma.educationMaterial.findMany.mock.calls[1][0].orderBy,
      ).toEqual({
        title: "asc",
      });
    });
  });

  describe("assign", () => {
    it("copies the material onto each patient's row", async () => {
      await service.assign(
        1n,
        { patient: [5], note: "Read before visit" },
        USER,
      );

      expect(
        prisma.patientEducationMaterial.createMany.mock.calls[0][0].data,
      ).toEqual([
        {
          patientId: 5n,
          educationMaterialId: 1n,
          assignedById: 7n,
          name: "Managing blood pressure",
          type: "PDF",
          url: "data:application/pdf;base64,AAAA",
          description: "d",
          note: "Read before visit",
        },
      ]);
    });

    it("writes nothing when any patient already has it", async () => {
      prisma.patient.findMany.mockResolvedValue([{ id: 5n }, { id: 6n }]);
      prisma.patientEducationMaterial.findMany.mockResolvedValue([
        { patientId: 6n },
      ]);

      await expect(
        service.assign(1n, { patient: [5, 6] }, USER),
      ).rejects.toThrow("already assigned to patient 6");
      expect(prisma.patientEducationMaterial.createMany).not.toHaveBeenCalled();
    });

    it("404s for an unknown patient or material", async () => {
      prisma.patient.findMany.mockResolvedValue([]);
      await expect(service.assign(1n, { patient: [99] }, USER)).rejects.toThrow(
        "Patient not found: 99",
      );

      prisma.educationMaterial.findUnique.mockResolvedValue(null);
      await expect(service.assign(99n, { patient: [5] }, USER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findAssignedPatients", () => {
    it("lists patients for the material id, not a patient id", async () => {
      await service.findAssignedPatients(1n, {});

      expect(
        prisma.patientEducationMaterial.findMany.mock.calls[0][0].where,
      ).toEqual({
        educationMaterialId: 1n,
      });
    });
  });

  describe("schedule", () => {
    const body = { patients: [5], send_by: 7, send_at: "2026-09-20T10:00:00Z" };

    it("creates one pending schedule per patient", async () => {
      prisma.patient.findMany.mockResolvedValue([
        { id: 5n, firstName: "A", lastName: "B", email: "a@x.com" },
        { id: 6n, firstName: "C", lastName: "D", email: "c@x.com" },
      ]);

      const result: any = await service.schedule(
        1n,
        { ...body, patients: [5, 6] },
        USER,
      );

      expect(prisma.educationSchedule.create).toHaveBeenCalledTimes(2);
      expect(
        prisma.educationSchedule.create.mock.calls[0][0].data,
      ).toMatchObject({
        education_id: 1n,
        status: "schedule",
        send_by_id: 7n,
        scheduled_by_id: 7n,
        patients: { create: { patient_id: 5n } },
      });
      expect(result[0].patients[0]).toMatchObject({ first_name: "Isidro" });
      expect(result[0]).not.toHaveProperty("education");
    });

    it("refuses patients with no email, naming them", async () => {
      prisma.patient.findMany.mockResolvedValue([
        { id: 5n, firstName: "Isidro", lastName: "McGlynn", email: null },
      ]);

      await expect(service.schedule(1n, body, USER)).rejects.toThrow(
        "No email for: Isidro McGlynn",
      );
      expect(prisma.educationSchedule.create).not.toHaveBeenCalled();
    });

    it("404s for an unknown sender", async () => {
      prisma.provider.findUnique.mockResolvedValue(null);

      await expect(service.schedule(1n, body, USER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("schedules", () => {
    it("lists a material's schedules with the envelope Zenara returns", async () => {
      const result: any = await service.findSchedules({}, { educationId: 1n });

      expect(prisma.educationSchedule.findMany.mock.calls[0][0].where).toEqual({
        education_id: 1n,
      });
      expect(result.pagination).toEqual({
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      });
      expect(result.data[0].education).toMatchObject({
        title: "Managing blood pressure",
      });
    });

    it("lists a patient's schedules, sorted by title on request", async () => {
      await service.findSchedules(
        { sort_by: "title_desc", schedule_status: "cancel" },
        { patientId: 5n },
      );

      const args = prisma.educationSchedule.findMany.mock.calls[0][0];
      expect(args.where).toEqual({
        patients: { some: { patient_id: 5n } },
        status: "cancel",
      });
      expect(args.orderBy).toEqual([
        { education: { title: "desc" } },
        { send_at: "desc" },
      ]);
    });

    it("cancels a pending schedule and records who and when", async () => {
      await service.cancelSchedule(9n, USER);

      expect(
        prisma.educationSchedule.update.mock.calls[0][0].data,
      ).toMatchObject({
        status: "cancel",
        cancelled_by_id: 7n,
        cancelled_at: expect.any(Date),
      });
    });

    it("refuses to cancel or move a schedule that is no longer pending", async () => {
      prisma.educationSchedule.findUnique.mockResolvedValue({
        status: "cancel",
      });

      await expect(service.cancelSchedule(9n, USER)).rejects.toThrow(
        "already cancel",
      );
      await expect(
        service.updateSchedule(9n, { send_at: "2026-09-21T10:00:00Z" }, USER),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.educationSchedule.update).not.toHaveBeenCalled();
    });

    it("moves the send time", async () => {
      await service.updateSchedule(
        9n,
        { send_at: "2026-09-21T10:00:00Z" },
        USER,
      );

      expect(prisma.educationSchedule.update.mock.calls[0][0].data).toEqual({
        send_at: new Date("2026-09-21T10:00:00Z"),
        updated_by_id: 7n,
      });
    });
  });

  describe("archive", () => {
    it("records who archived and who unarchived", async () => {
      await service.setArchived(1n, true, USER);
      await service.setArchived(1n, false, USER);

      expect(prisma.educationMaterial.update.mock.calls[0][0].data).toEqual({
        isArchived: true,
        archivedById: 7n,
      });
      expect(prisma.educationMaterial.update.mock.calls[1][0].data).toEqual({
        isArchived: false,
        unarchivedById: 7n,
      });
    });
  });

  describe("query validation", () => {
    it("accepts every param Zenara's list sends", async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      const query = {
        group_id: "1",
        order_by: "asc",
        page_no: "1",
        page_size: "15",
        search: "",
        speciality: "",
        user_types: "",
        condition: "",
        is_archived: "false",
        assigned_by: "",
        responsible_person: "",
      };

      await expect(
        pipe.transform(query, { type: "query", metatype: QueryEducationDto }),
      ).resolves.toMatchObject({ group_id: "1" });
    });
  });
});
