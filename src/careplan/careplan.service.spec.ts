import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { AuthenticatedUser } from "../common/constants";
import { CareplanService } from "./careplan.service";

const USER = { id: 1n, providerId: 7n } as AuthenticatedUser;

describe("CareplanService", () => {
  const row = { id: 1n, title: "Diabetes Plan" };

  const listRow = {
    id: 1n,
    title: "Diabetes Plan",
    provider_group_id: 3n,
    copied_from_id: null,
    creator: { id: 7n, first_name: "Jason", last_name: "Bates" },
    conditions: [{ condition: { id: 5n, title: "Diabetes" } }],
    icd_codes: [
      { icdcode: { id: 9n, code: "E11", description: "Type 2 diabetes" } },
    ],
  };

  let careplan: any;
  let question: any;
  let condition: any;
  let icdCode: any;
  let task: any;
  let tx: any;
  let prisma: any;
  let service: CareplanService;

  beforeEach(() => {
    careplan = {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(row),
      findMany: jest.fn().mockResolvedValue([listRow]),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue({ id: 10n }),
      update: jest.fn().mockResolvedValue(row),
      delete: jest.fn().mockResolvedValue(row),
    };
    question = {
      findUnique: jest.fn().mockResolvedValue({ id: 2n }),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 2n }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({ id: 2n }),
      delete: jest.fn().mockResolvedValue({ id: 2n }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };
    condition = {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };
    icdCode = {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };
    task = {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };

    tx = {
      carePlan: careplan,
      carePlanQuestion: question,
      carePlanCondition: condition,
      carePlanIcdCode: icdCode,
      carePlanTask: task,
    };
    prisma = {
      ...tx,
      condition: { findMany: jest.fn().mockResolvedValue([{ id: 5n }]) },
      icdCode: { findMany: jest.fn().mockResolvedValue([{ id: 9n }]) },
      providerGroup: { findUnique: jest.fn().mockResolvedValue({ id: 1n }) },
      bulkCommunicationTemplate: {
        findMany: jest.fn().mockResolvedValue([{ id: 8n }]),
      },
      $transaction: jest.fn((cb: any) => cb(tx)),
    };
    service = new CareplanService(prisma);
  });

  const questionRows = () => question.createMany.mock.calls[0][0].data;

  describe("checkCarePlan", () => {
    it("reports an unused title as available", async () => {
      await expect(
        service.checkCarePlan({ title: "New Plan" }),
      ).resolves.toEqual({
        message: "Care Plan with this name does not exist",
        isExist: false,
      });
    });

    it("reports a taken title as existing", async () => {
      careplan.findFirst.mockResolvedValue(row);

      await expect(
        service.checkCarePlan({ title: "Diabetes Plan" }),
      ).resolves.toMatchObject({ isExist: true });
    });

    it("matches on the whole title, case-insensitively", async () => {
      await service.checkCarePlan({ title: "Diabetes Plan" });

      expect(careplan.findFirst).toHaveBeenCalledWith({
        where: { title: { equals: "Diabetes Plan", mode: "insensitive" } },
      });
    });

    it("lets a care plan keep its own title when editing", async () => {
      await service.checkCarePlan({ title: "Diabetes Plan", id: "1" });

      expect(careplan.findFirst).toHaveBeenCalledWith({
        where: {
          title: { equals: "Diabetes Plan", mode: "insensitive" },
          NOT: { id: 1n },
        },
      });
    });

    it("404s when the care plan being edited does not exist", async () => {
      careplan.findUnique.mockResolvedValue(null);

      await expect(
        service.checkCarePlan({ title: "Any", id: "99" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("creates the care plan and returns its id", async () => {
      await expect(
        service.create({ title: "New Plan" }, USER),
      ).resolves.toEqual({
        details: "Care plan created successfully",
        careplan_id: 10n,
      });
      expect(careplan.create).toHaveBeenCalled();
    });

    it("records the calling provider as creator", async () => {
      await service.create({ title: "New Plan" }, USER);

      expect(careplan.create.mock.calls[0][0].data).toMatchObject({
        creator_id: 7n,
        is_active: true,
      });
    });

    it("409s on a duplicate title, using the same rule as check-careplan", async () => {
      careplan.findFirst.mockResolvedValue(row);

      await expect(
        service.create({ title: "Diabetes Plan" }, USER),
      ).rejects.toThrow(ConflictException);
      expect(careplan.create).not.toHaveBeenCalled();
    });

    it("stores each section's questions under the section name", async () => {
      await service.create(
        {
          title: "New Plan",
          sections: [
            {
              section_name: "goals",
              questions: [
                { title: "Q1", question_type: "free_text" },
                { title: "Q2", question_type: "free_text", type: "barriers" },
              ],
            },
          ],
        },
        USER,
      );

      expect(question.createMany.mock.calls[0][0].data).toEqual([
        expect.objectContaining({ title: "Q1", type: "goals" }),
        expect.objectContaining({ title: "Q2", type: "barriers" }),
      ]);
    });

    it("links conditions and icd codes by id", async () => {
      await service.create(
        { title: "New Plan", conditions: [5], icd_codes: ["9"] },
        USER,
      );

      expect(condition.createMany.mock.calls[0][0].data).toEqual([
        { careplan_id: 10n, condition_id: 5n },
      ]);
      expect(icdCode.createMany.mock.calls[0][0].data).toEqual([
        { careplan_id: 10n, icdcode_id: 9n },
      ]);
    });

    it("does not clear relations on create", async () => {
      await service.create({ title: "New Plan", conditions: [5] }, USER);

      expect(condition.deleteMany).not.toHaveBeenCalled();
    });

    it("ignores the echo-back fields the care plan form sends", async () => {
      await service.create(
        {
          title: "New Plan",
          carePlanConditionLabel: "Acid Reflux (GERD)",
          sections: [
            {
              section_name: "general_questions",
              questions: [
                {
                  id: 14,
                  careplan: 0,
                  title: "How would you rate your overall physical health",
                  question_type: "single_select",
                  choices: ["Excellent"],
                },
              ],
            },
          ],
        },
        USER,
      );

      expect(careplan.create.mock.calls[0][0].data).not.toHaveProperty(
        "carePlanConditionLabel",
      );
      const question = questionRows()[0];
      expect(question).not.toHaveProperty("id");
      expect(question).not.toHaveProperty("careplan");
      expect(question).toMatchObject({ type: "general_questions" });
    });

    it("names the missing condition instead of failing on a foreign key", async () => {
      prisma.condition.findMany.mockResolvedValue([]);

      await expect(
        service.create({ title: "New Plan", conditions: [2] }, USER),
      ).rejects.toThrow("Condition not found: 2");
      expect(careplan.create).not.toHaveBeenCalled();
    });

    it("names the missing icd code", async () => {
      prisma.icdCode.findMany.mockResolvedValue([{ id: 9n }]);

      await expect(
        service.create({ title: "New Plan", icd_codes: ["9", "44"] }, USER),
      ).rejects.toThrow("ICD code not found: 44");
    });

    it("404s for a provider group that does not exist", async () => {
      prisma.providerGroup.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ title: "New Plan", provider_group: "7" }, USER),
      ).rejects.toThrow(NotFoundException);
    });

    it("400s on a non-numeric id rather than throwing a SyntaxError", async () => {
      await expect(
        service.create({ title: "New Plan", icd_codes: ["abc"] }, USER),
      ).rejects.toThrow(BadRequestException);
    });

    it("accepts relations that all exist", async () => {
      await expect(
        service.create(
          {
            title: "New Plan",
            conditions: [5],
            icd_codes: ["9"],
            provider_group: "1",
          },
          USER,
        ),
      ).resolves.toMatchObject({ careplan_id: 10n });
    });

    it("skips sections that carry no questions", async () => {
      await service.create(
        {
          title: "New Plan",
          sections: [
            { section_name: "goals", questions: [] },
            {
              section_name: "barriers",
              questions: [{ title: "Q", question_type: "free_text" }],
            },
          ],
        },
        USER,
      );

      expect(questionRows()).toEqual([
        expect.objectContaining({ title: "Q", type: "barriers" }),
      ]);
    });
  });

  describe("findAll", () => {
    it("returns the repository pagination envelope", async () => {
      const result: any = await service.findAll({});

      expect(result).toMatchObject({ count: 1, next: null, previous: null });
      expect(result.results).toHaveLength(1);
    });

    it("flattens conditions into pickable options", async () => {
      const result: any = await service.findAll({});

      expect(result.results[0].conditions).toEqual([
        { id: 5n, title: "Diabetes", value: 5n, label: "Diabetes" },
      ]);
    });

    it("renders icd codes as display strings plus their ids", async () => {
      const result: any = await service.findAll({});

      expect(result.results[0].icd_codes).toEqual(["E11: Type 2 diabetes"]);
      expect(result.results[0].icd_code_ids).toEqual([9n]);
    });

    it("searches on title, case-insensitively", async () => {
      await service.findAll({ search: "diab" });

      expect(careplan.findMany.mock.calls[0][0].where).toMatchObject({
        title: { contains: "diab", mode: "insensitive" },
      });
    });

    it("filters by program inside the programs json", async () => {
      await service.findAll({ program: "CCM" });

      expect(careplan.findMany.mock.calls[0][0].where).toMatchObject({
        programs: { array_contains: ["ccm"] },
      });
    });

    it("splits a two-part creator name across first and last name", async () => {
      await service.findAll({ creator_name: "Jason Bates" });

      expect(careplan.findMany.mock.calls[0][0].where.creator).toEqual({
        first_name: { contains: "Jason", mode: "insensitive" },
        last_name: { contains: "Bates", mode: "insensitive" },
      });
    });

    it("matches a single-word creator name against either name", async () => {
      await service.findAll({ creator_name: "Bates" });

      expect(careplan.findMany.mock.calls[0][0].where.creator.OR).toHaveLength(
        2,
      );
    });

    it("caps the page size at 100", async () => {
      await service.findAll({ page_size: "5000" });

      expect(careplan.findMany.mock.calls[0][0].take).toBe(100);
    });

    it("falls back to id for an unknown sort_by", async () => {
      await service.findAll({ sort_by: "; drop table" });

      expect(careplan.findMany.mock.calls[0][0].orderBy).toEqual({
        id: "desc",
      });
    });
  });

  describe("findOne", () => {
    beforeEach(() => {
      careplan.findUnique.mockResolvedValue({
        ...listRow,
        tasks: [{ id: 4n, title: "Call" }],
        questions: [
          { type: "goals" },
          { type: "goals" },
          { type: "barriers" },
          { type: null },
        ],
      });
    });

    it("derives section_order from the questions, de-duplicated and in order", async () => {
      const result: any = await service.findOne(1n);

      expect(result.section_order).toEqual(["goals", "barriers"]);
    });

    it("uses the detail icd code format", async () => {
      const result: any = await service.findOne(1n);

      expect(result.icd_codes).toEqual(["9: E11 - Type 2 diabetes"]);
    });

    it("omits careplan_task when there are none", async () => {
      careplan.findUnique.mockResolvedValue({
        ...listRow,
        tasks: [],
        questions: [],
      });

      const result: any = await service.findOne(1n);

      expect(result.careplan_task).toBeUndefined();
    });

    it("404s for an unknown care plan", async () => {
      careplan.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99n)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("only writes the fields supplied", async () => {
      await service.update(1n, { title: "Renamed" });

      expect(careplan.update.mock.calls[0][0].data).toEqual({
        title: "Renamed",
      });
    });

    it("replaces sections wholesale rather than appending", async () => {
      await service.update(1n, {
        sections: [
          {
            section_name: "goals",
            questions: [{ title: "Q", question_type: "free_text" }],
          },
        ],
      } as any);

      expect(question.deleteMany).toHaveBeenCalledWith({
        where: { careplan_id: 1n },
      });
      expect(question.createMany).toHaveBeenCalled();
    });

    it("leaves relations untouched when they are omitted", async () => {
      await service.update(1n, { title: "Renamed" });

      expect(question.deleteMany).not.toHaveBeenCalled();
      expect(condition.deleteMany).not.toHaveBeenCalled();
    });

    it("lets a care plan keep its own title", async () => {
      await service.update(1n, { title: "Diabetes Plan" });

      expect(careplan.findFirst).not.toHaveBeenCalled();
    });

    it("409s when another care plan already has the new title", async () => {
      careplan.findFirst.mockResolvedValue({ id: 2n, title: "Taken" });

      await expect(
        service.update(1n, { title: "Taken" } as any),
      ).rejects.toThrow(ConflictException);
    });

    it("404s for an unknown care plan", async () => {
      careplan.findUnique.mockResolvedValue(null);

      await expect(service.update(99n, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("deletes the care plan", async () => {
      await expect(service.remove(1n)).resolves.toEqual({
        details: "Care plan deleted successfully",
      });
      expect(careplan.delete).toHaveBeenCalledWith({ where: { id: 1n } });
    });

    it("404s for an unknown care plan", async () => {
      careplan.findUnique.mockResolvedValue(null);

      await expect(service.remove(99n)).rejects.toThrow(NotFoundException);
    });
  });

  describe("copy", () => {
    beforeEach(() => {
      careplan.findUnique.mockResolvedValue({
        ...row,
        description: "d",
        support: true,
        allergies: false,
        medications: false,
        is_active: true,
        programs: ["ccm"],
        provider_group_id: 3n,
        conditions: [{ condition_id: 5n }],
        icd_codes: [{ icdcode_id: 9n }],
        questions: [
          {
            title: "Q1",
            description: null,
            type: "goals",
            question_type: "free_text",
            choices: ["a"],
            condition_id: null,
          },
        ],
      });
    });

    it("titles the copy with the source id appended", async () => {
      await expect(service.copy(1n, { title: "Copy" }, USER)).resolves.toEqual({
        details: "Care plan copied as Copy - 1",
        careplan_id: 10n,
      });
    });

    it("marks the copy and links it back to its source", async () => {
      await service.copy(1n, { title: "Copy" }, USER);

      expect(careplan.create.mock.calls[0][0].data).toMatchObject({
        copied: true,
        copied_from_id: 1n,
      });
    });

    it("copies the questions onto the new care plan", async () => {
      await service.copy(1n, { title: "Copy" }, USER);

      expect(question.createMany.mock.calls[0][0].data).toEqual([
        expect.objectContaining({ title: "Q1", careplan_id: 10n }),
      ]);
    });

    it("copies conditions and icd codes", async () => {
      await service.copy(1n, { title: "Copy" }, USER);

      expect(condition.createMany.mock.calls[0][0].data).toEqual([
        { careplan_id: 10n, condition_id: 5n },
      ]);
      expect(icdCode.createMany.mock.calls[0][0].data).toEqual([
        { careplan_id: 10n, icdcode_id: 9n },
      ]);
    });

    it("copies a care plan that has no conditions", async () => {
      careplan.findUnique.mockResolvedValue({
        ...row,
        programs: null,
        conditions: [],
        icd_codes: [],
        questions: [],
      });

      await expect(
        service.copy(1n, { title: "Copy" }, USER),
      ).resolves.toMatchObject({ careplan_id: 10n });
      expect(condition.createMany).not.toHaveBeenCalled();
    });

    it("404s for an unknown source care plan", async () => {
      careplan.findUnique.mockResolvedValue(null);

      await expect(service.copy(99n, { title: "Copy" }, USER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findQuestions", () => {
    const whereOf = () => question.findMany.mock.calls[0][0].where;

    it("scopes to the care plan", async () => {
      await service.findQuestions(1n, {});

      expect(whereOf()).toEqual({ careplan_id: 1n });
    });

    it("matches every spelling of the general section", async () => {
      await service.findQuestions(1n, { type: "general_questions" });

      expect(whereOf().type).toEqual({
        in: ["general_questions", "general"],
      });
    });

    it("matches every spelling of the support section", async () => {
      await service.findQuestions(1n, { type: "support" });

      expect(whereOf().type).toEqual({
        in: ["support", "supports", "support_questions"],
      });
    });

    it("matches an ungrouped section type exactly", async () => {
      await service.findQuestions(1n, { type: "goals" });

      expect(whereOf().type).toBe("goals");
    });

    it("404s for an unknown care plan", async () => {
      careplan.findUnique.mockResolvedValue(null);

      await expect(service.findQuestions(99n, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("question write operations", () => {
    it("attaches a new question to the care plan in the path", async () => {
      await service.createQuestion(1n, {
        title: "Q",
        question_type: "free_text",
      });

      expect(question.create.mock.calls[0][0].data).toMatchObject({
        careplan_id: 1n,
      });
    });

    it("lets the body override the care plan in the path", async () => {
      await service.createQuestion(1n, { title: "Q", careplan: "4" });

      expect(question.create.mock.calls[0][0].data).toMatchObject({
        careplan_id: 4n,
      });
    });

    it("404s when creating against an unknown care plan", async () => {
      careplan.findUnique.mockResolvedValue(null);

      await expect(service.createQuestion(99n, { title: "Q" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("only writes the question fields supplied", async () => {
      await service.updateQuestion(2n, { title: "Renamed" });

      expect(question.update.mock.calls[0][0].data).toEqual({
        title: "Renamed",
      });
    });

    it("404s when updating an unknown question", async () => {
      question.findUnique.mockResolvedValue(null);

      await expect(service.updateQuestion(99n, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("deletes a question", async () => {
      await expect(service.removeQuestion(2n)).resolves.toEqual({
        details: "Care plan question deleted successfully",
      });
    });

    it("404s when deleting an unknown question", async () => {
      question.findUnique.mockResolvedValue(null);

      await expect(service.removeQuestion(99n)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
