import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../common/constants";
import { AllergiesService } from "./allergies.service";
import { ConditionsService } from "./conditions.service";
import { LabResultsService } from "./lab-results.service";
import { MedicationsService } from "./medications.service";
import { SymptomsService } from "./symptoms.service";

const USER = { id: 1n, providerId: 7n } as AuthenticatedUser;

const table = (rows: any[] = []) => ({
  findFirst: jest.fn().mockResolvedValue({ id: 1n }),
  findMany: jest.fn().mockResolvedValue(rows),
  count: jest.fn().mockResolvedValue(rows.length),
  create: jest.fn().mockResolvedValue({ id: 99n }),
  createMany: jest.fn().mockResolvedValue({ count: 0 }),
  update: jest.fn().mockResolvedValue({ id: 1n }),
  deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
});

describe("patient charting", () => {
  let prisma: any;
  let tx: any;

  beforeEach(() => {
    tx = {
      // The grid save looks the referenced rows up first, so they must exist.
      patientCondition: table([{ id: 1n }]),
      labResult: table(),
      labResultFile: table(),
    };
    prisma = {
      patient: { findUnique: jest.fn().mockResolvedValue({ id: 1n }) },
      condition: { findMany: jest.fn().mockResolvedValue([{ id: 5n }]) },
      patientCondition: tx.patientCondition,
      symptom: table(),
      patientAllergy: table(),
      patientMedication: table(),
      labResult: tx.labResult,
      labResultFile: tx.labResultFile,
      $transaction: jest.fn((cb: any) => cb(tx)),
    };
  });

  describe("shared behaviour", () => {
    it.each([
      ["conditions", (p: any) => new ConditionsService(p)],
      ["symptoms", (p: any) => new SymptomsService(p)],
      ["allergies", (p: any) => new AllergiesService(p)],
      ["medications", (p: any) => new MedicationsService(p)],
      ["lab results", (p: any) => new LabResultsService(p)],
    ])("404s on %s for an unknown patient", async (_name, build) => {
      prisma.patient.findUnique.mockResolvedValue(null);

      await expect(build(prisma).findAll(99n, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it.each([
      ["conditions", (p: any) => new ConditionsService(p), "patientCondition"],
      ["symptoms", (p: any) => new SymptomsService(p), "symptom"],
      ["lab results", (p: any) => new LabResultsService(p), "labResult"],
    ])("hides soft-deleted %s by default", async (_n, build, model) => {
      await build(prisma).findAll(1n, {});

      expect(prisma[model].findMany.mock.calls[0][0].where).toMatchObject({
        is_deleted: false,
      });
    });

    it("caps the page size at 100", async () => {
      await new SymptomsService(prisma).findAll(1n, { page_size: "5000" });

      expect(prisma.symptom.findMany.mock.calls[0][0].take).toBe(100);
    });

    it("falls back to created_at for an unknown sort_by", async () => {
      await new SymptomsService(prisma).findAll(1n, { sort_by: "nonsense" });

      expect(prisma.symptom.findMany.mock.calls[0][0].orderBy).toEqual({
        created_at: "desc",
      });
    });

    it("returns the repository pagination envelope", async () => {
      const result: any = await new SymptomsService(prisma).findAll(1n, {});

      expect(result).toMatchObject({ count: 0, next: null, previous: null });
    });
  });

  describe("conditions", () => {
    let service: ConditionsService;
    beforeEach(() => (service = new ConditionsService(prisma)));

    it("adds, updates and soft-deletes in one call", async () => {
      const result: any = await service.handle(
        1n,
        [
          { action: "add", condition: 5, status: "active" },
          { action: "update", id: 1, notes: "changed" },
          { action: "delete", id: 1 },
        ] as any,
        USER,
      );

      expect(result).toMatchObject({ added: 1, updated: 1, deleted: 1 });
      expect(tx.patientCondition.create).toHaveBeenCalledTimes(1);
      expect(tx.patientCondition.update).toHaveBeenCalledTimes(2);
    });

    it("soft-deletes rather than removing the row", async () => {
      await service.handle(1n, [{ action: "delete", id: 1 }] as any, USER);

      expect(tx.patientCondition.update.mock.calls[0][0].data).toMatchObject({
        is_deleted: true,
      });
    });

    it("rejects an update with no id", async () => {
      await expect(
        service.handle(1n, [{ action: "update" }] as any, USER),
      ).rejects.toThrow(BadRequestException);
      expect(tx.patientCondition.update).not.toHaveBeenCalled();
    });

    it("404s when a row belongs to another patient", async () => {
      prisma.patientCondition.findMany.mockResolvedValue([]);

      await expect(
        service.handle(1n, [{ action: "update", id: 4 }] as any, USER),
      ).rejects.toThrow(NotFoundException);
    });

    it("names an unknown library condition instead of failing on a key", async () => {
      prisma.condition.findMany.mockResolvedValue([]);

      await expect(
        service.handle(1n, [{ action: "add", condition: 44 }] as any, USER),
      ).rejects.toThrow("Condition not found: 44");
    });

    it("stamps the acting provider", async () => {
      await service.handle(1n, [{ action: "add", condition: 5 }] as any, USER);

      expect(tx.patientCondition.create.mock.calls[0][0].data).toMatchObject({
        updated_by_id: 7n,
        patient_id: 1n,
      });
    });
  });

  describe("symptoms", () => {
    let service: SymptomsService;
    beforeEach(() => (service = new SymptomsService(prisma)));

    it("creates without an id", async () => {
      await service.save(1n, { description: "Dizziness" }, USER);

      expect(prisma.symptom.create).toHaveBeenCalled();
      expect(prisma.symptom.update).not.toHaveBeenCalled();
    });

    it("updates when an id is supplied", async () => {
      await service.save(1n, { id: 3, description: "Dizziness" }, USER);

      expect(prisma.symptom.update).toHaveBeenCalled();
      expect(prisma.symptom.create).not.toHaveBeenCalled();
    });

    it("404s when updating a symptom of another patient", async () => {
      prisma.symptom.findFirst.mockResolvedValue(null);

      await expect(
        service.save(1n, { id: 3, description: "x" }, USER),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("allergies", () => {
    let service: AllergiesService;
    beforeEach(() => (service = new AllergiesService(prisma)));

    it("maps snake_case onto the camelCase columns", async () => {
      await service.save(
        1n,
        { name: "Penicillin", onset_date: "2020-05-01", is_source_ehr: true },
        USER,
      );

      expect(prisma.patientAllergy.create.mock.calls[0][0].data).toMatchObject({
        name: "Penicillin",
        onsetDate: new Date("2020-05-01"),
        isSourceEhr: true,
        patientId: 1n,
      });
    });

    it("maps the row back to snake_case on read", async () => {
      prisma.patientAllergy.findMany.mockResolvedValue([
        { id: 1n, name: "Penicillin", onsetDate: null, isSourceEhr: false },
      ]);

      const result: any = await service.findAll(1n, {});

      expect(result.results[0]).toMatchObject({
        name: "Penicillin",
        onset_date: null,
        is_source_ehr: false,
      });
      expect(result.results[0]).not.toHaveProperty("onsetDate");
    });

    it("soft-deletes and deactivates", async () => {
      await service.remove(1n, 3n, USER);

      expect(prisma.patientAllergy.update.mock.calls[0][0].data).toMatchObject({
        isDeleted: true,
        isActive: false,
      });
    });
  });

  describe("medications", () => {
    let service: MedicationsService;
    beforeEach(() => (service = new MedicationsService(prisma)));

    it("maps medicine onto name and when onto takenWhen", async () => {
      await service.save(
        1n,
        { medicine: "Metformin", when: "after_meal", start_at: "2026-01-15" },
        USER,
      );

      expect(
        prisma.patientMedication.create.mock.calls[0][0].data,
      ).toMatchObject({
        name: "Metformin",
        takenWhen: "after_meal",
        startDate: new Date("2026-01-15"),
      });
    });

    it("excludes ended medications from the current list", async () => {
      await service.findAll(1n, {});

      expect(
        prisma.patientMedication.findMany.mock.calls[0][0].where,
      ).toHaveProperty("NOT");
    });

    it("selects only ended medications for the past list", async () => {
      await service.findAll(1n, {}, true);

      const where = prisma.patientMedication.findMany.mock.calls[0][0].where;
      expect(where).not.toHaveProperty("NOT");
      expect(where.OR).toHaveLength(2);
    });

    it("renames name back to medicine on read", async () => {
      prisma.patientMedication.findMany.mockResolvedValue([
        { id: 1n, name: "Metformin", takenWhen: "after_meal" },
      ]);

      const result: any = await service.findAll(1n, {});

      expect(result.results[0]).toMatchObject({
        medicine: "Metformin",
        when: "after_meal",
      });
    });
  });

  describe("lab results", () => {
    let service: LabResultsService;
    beforeEach(() => (service = new LabResultsService(prisma)));

    it("defaults recorded_at to now when omitted", async () => {
      await service.save(1n, { lab_result_for: "HbA1c", value: "7.2%" }, USER);

      expect(
        tx.labResult.create.mock.calls[0][0].data.recorded_at,
      ).toBeInstanceOf(Date);
    });

    it("replaces the extra report files wholesale", async () => {
      await service.save(
        1n,
        {
          lab_result_for: "HbA1c",
          value: "7.2%",
          additional_files: ["a.pdf", "b.pdf"],
        },
        USER,
      );

      expect(tx.labResultFile.deleteMany).toHaveBeenCalled();
      expect(tx.labResultFile.createMany.mock.calls[0][0].data).toHaveLength(2);
    });

    it("leaves the files alone when the field is omitted", async () => {
      await service.save(1n, { lab_result_for: "HbA1c", value: "7.2%" }, USER);

      expect(tx.labResultFile.deleteMany).not.toHaveBeenCalled();
    });

    it("clears the files when an empty list is supplied", async () => {
      await service.save(
        1n,
        { lab_result_for: "HbA1c", value: "7.2%", additional_files: [] },
        USER,
      );

      expect(tx.labResultFile.deleteMany).toHaveBeenCalled();
      expect(tx.labResultFile.createMany).not.toHaveBeenCalled();
    });

    it("searches test name, value and note", async () => {
      await service.findAll(1n, { search: "hba" });

      expect(prisma.labResult.findMany.mock.calls[0][0].where.OR).toHaveLength(
        3,
      );
    });
  });
});
