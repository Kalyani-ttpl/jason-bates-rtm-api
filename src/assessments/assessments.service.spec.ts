import { ConflictException, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../common/constants";
import { AssessmentsService } from "./assessments.service";

const USER = { id: 1n, providerId: 7n } as AuthenticatedUser;

const row = {
  id: 1n,
  title: "Depression screening",
  description: "d",
  category: "formative",
  frequencey: null,
  flag: null,
  tags: null,
  font_icons: null,
  is_nas_assessment: false,
  provider_group_id: 1n,
  creator: { id: 7n, first_name: "Jason", last_name: "Bates" },
  conditions: [{ condition: { id: 3n, title: "Diabetes" } }],
};

describe("AssessmentsService", () => {
  let assessment: any;
  let question: any;
  let choice: any;
  let condition: any;
  let tx: any;
  let prisma: any;
  let service: AssessmentsService;

  beforeEach(() => {
    let nextId = 100n;
    assessment = {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(row),
      findMany: jest.fn().mockResolvedValue([row]),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue({ id: 10n }),
      update: jest.fn().mockResolvedValue({ id: 1n }),
    };
    question = {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(() => Promise.resolve({ id: nextId++ })),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };
    choice = {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(() => Promise.resolve({ id: nextId++ })),
    };
    condition = { findMany: jest.fn().mockResolvedValue([{ id: 3n }]) };

    tx = {
      assessment,
      assessmentQuestion: question,
      assessmentQuestionChoice: choice,
      assessmentCondition: {
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    prisma = {
      ...tx,
      condition,
      $transaction: jest.fn((cb: any) => cb(tx)),
    };
    service = new AssessmentsService(prisma);
  });

  describe("findAll", () => {
    it("returns the repository pagination envelope", async () => {
      const result: any = await service.findAll({});

      expect(result).toMatchObject({ count: 1, next: null, previous: null });
      expect(result.results[0].conditions).toEqual([
        { id: 3n, title: "Diabetes", value: 3n, label: "Diabetes" },
      ]);
    });

    it("hides archived assessments", async () => {
      await service.findAll({});

      expect(assessment.findMany.mock.calls[0][0].where).toMatchObject({
        is_archieved: false,
      });
    });

    it("respects the requested order, unlike Zenara which inverts it", async () => {
      await service.findAll({ order_by: "asc" });

      expect(assessment.findMany.mock.calls[0][0].orderBy).toEqual({
        created_at: "asc",
      });
    });

    it("defaults the page size to 15 and caps it at 100", async () => {
      await service.findAll({});
      expect(assessment.findMany.mock.calls[0][0].take).toBe(15);

      await service.findAll({ page_size: "5000" });
      expect(assessment.findMany.mock.calls[1][0].take).toBe(100);
    });

    it("splits a two-part creator name", async () => {
      await service.findAll({ creator_name: "Jason Bates" });

      expect(assessment.findMany.mock.calls[0][0].where.creator).toEqual({
        first_name: { contains: "Jason", mode: "insensitive" },
        last_name: { contains: "Bates", mode: "insensitive" },
      });
    });

    it("filters by condition title and provider group", async () => {
      await service.findAll({ condition: "Diab", group_id: "1" });

      const where = assessment.findMany.mock.calls[0][0].where;
      expect(where.provider_group_id).toBe(1n);
      expect(where.conditions.some.condition.title).toEqual({
        contains: "Diab",
        mode: "insensitive",
      });
    });
  });

  describe("create", () => {
    it("creates the assessment and returns its id", async () => {
      await expect(service.create({ title: "New" }, USER)).resolves.toEqual({
        detail: "Assessment created successfully",
        assessment_id: 10n,
      });
    });

    it("409s on a duplicate title", async () => {
      assessment.findFirst.mockResolvedValue({ id: 2n });

      await expect(service.create({ title: "New" }, USER)).rejects.toThrow(
        ConflictException,
      );
      expect(assessment.create).not.toHaveBeenCalled();
    });

    it("names a missing condition instead of failing on a foreign key", async () => {
      condition.findMany.mockResolvedValue([]);

      await expect(
        service.create({ title: "New", conditions: [3, 9] }, USER),
      ).rejects.toThrow("Condition not found: 3, 9");
    });

    it("links the conditions", async () => {
      await service.create({ title: "New", conditions: [3] }, USER);

      expect(tx.assessmentCondition.createMany.mock.calls[0][0].data).toEqual([
        { assessment_id: 10n, condition_id: 3n },
      ]);
    });

    it("stores a flat question with no choices", async () => {
      await service.create(
        {
          title: "New",
          assessment_questions: [
            { title: "Q1", type: "free_text", choices: [] },
          ],
        },
        USER,
      );

      expect(question.create).toHaveBeenCalledTimes(1);
      expect(question.create.mock.calls[0][0].data).toMatchObject({
        title: "Q1",
        choice_id: null,
        assessment_id: 10n,
        creator_id: 7n,
      });
      expect(choice.create).not.toHaveBeenCalled();
    });

    it("stores each choice against its question", async () => {
      await service.create(
        {
          title: "New",
          assessment_questions: [
            {
              title: "Q1",
              type: "single_select",
              choices: [
                { title: "a", nas_class: "c1" },
                { title: "b", is_free_text: true },
              ],
            },
          ],
        },
        USER,
      );

      expect(choice.create).toHaveBeenCalledTimes(2);
      expect(choice.create.mock.calls[0][0].data).toMatchObject({
        title: "a",
        nas_class: "c1",
        question_id: 100n,
        is_free_text: false,
      });
      expect(choice.create.mock.calls[1][0].data).toMatchObject({
        is_free_text: true,
      });
    });

    it("hangs a nested question off its parent choice", async () => {
      await service.create(
        {
          title: "New",
          assessment_questions: [
            {
              title: "Q1",
              type: "single_select",
              choices: [
                {
                  title: "yes",
                  questions: [{ title: "Q1a", type: "free_text" }],
                },
              ],
            },
          ],
        },
        USER,
      );

      // Q1 -> id 100, its choice -> 101, so the nested question points at 101.
      expect(question.create.mock.calls[1][0].data).toMatchObject({
        title: "Q1a",
        choice_id: 101n,
        assessment_id: 10n,
      });
    });

    it("keeps nesting beyond the depth a fixed include could reach", async () => {
      const deep = (depth: number): any =>
        depth === 0
          ? { title: `Q${depth}`, type: "free_text" }
          : {
              title: `Q${depth}`,
              type: "single_select",
              choices: [{ title: "next", questions: [deep(depth - 1)] }],
            };

      await service.create(
        { title: "New", assessment_questions: [deep(8)] },
        USER,
      );

      expect(question.create).toHaveBeenCalledTimes(9);
    });

    it("ignores the form's __pseudoId", async () => {
      await service.create(
        {
          title: "New",
          assessment_questions: [
            {
              title: "Q1",
              type: "single_select",
              __pseudoId: 0.165,
              choices: [{ title: "a", __pseudoId: 0.99 }],
            },
          ],
        },
        USER,
      );

      expect(question.create.mock.calls[0][0].data).not.toHaveProperty(
        "__pseudoId",
      );
      expect(choice.create.mock.calls[0][0].data).not.toHaveProperty(
        "__pseudoId",
      );
    });
  });

  describe("question tree", () => {
    it("rebuilds the nesting from two flat queries", async () => {
      question.findMany.mockResolvedValue([
        {
          id: 1n,
          uuid: "q1",
          title: "Q1",
          description: null,
          type: "single_select",
          choice_id: null,
        },
        {
          id: 2n,
          uuid: "q2",
          title: "Q1a",
          description: null,
          type: "free_text",
          choice_id: 10n,
        },
      ]);
      choice.findMany.mockResolvedValue([
        {
          id: 10n,
          uuid: "c1",
          title: "yes",
          nas_class: null,
          is_free_text: false,
          question_id: 1n,
        },
      ]);

      const tree: any = await service.findQuestions(1n);

      expect(tree).toHaveLength(1);
      expect(tree[0].title).toBe("Q1");
      expect(tree[0].choices[0].title).toBe("yes");
      expect(tree[0].choices[0].questions[0].title).toBe("Q1a");
      expect(question.findMany).toHaveBeenCalledTimes(1);
      expect(choice.findMany).toHaveBeenCalledTimes(1);
    });

    it("returns an empty tree without querying choices", async () => {
      await expect(service.findQuestions(1n)).resolves.toEqual([]);
      expect(choice.findMany).not.toHaveBeenCalled();
    });

    it("404s for an unknown assessment", async () => {
      assessment.findUnique.mockResolvedValue(null);

      await expect(service.findQuestions(99n)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("only writes the fields supplied", async () => {
      await service.update(1n, { category: "summative" } as any, USER);

      expect(assessment.update.mock.calls[0][0].data).toEqual({
        category: "summative",
      });
    });

    it("replaces the question tree by deleting the roots", async () => {
      await service.update(
        1n,
        { assessment_questions: [{ title: "Q", type: "free_text" }] } as any,
        USER,
      );

      expect(question.deleteMany).toHaveBeenCalledWith({
        where: { assessment_id: 1n, choice_id: null },
      });
      expect(question.create).toHaveBeenCalled();
    });

    it("leaves questions and conditions alone when omitted", async () => {
      await service.update(1n, { title: "Renamed" }, USER);

      expect(question.deleteMany).not.toHaveBeenCalled();
      expect(tx.assessmentCondition.deleteMany).not.toHaveBeenCalled();
    });

    it("lets an assessment keep its own title", async () => {
      await service.update(1n, { title: "Depression screening" }, USER);

      expect(assessment.findFirst).not.toHaveBeenCalled();
    });

    it("404s for an unknown assessment", async () => {
      assessment.findUnique.mockResolvedValue(null);

      await expect(service.update(99n, {} as any, USER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("archives rather than deleting, so responses survive", async () => {
      await expect(service.remove(1n)).resolves.toEqual({
        detail: "Assessment deleted successfully",
      });
      expect(assessment.update.mock.calls[0][0].data).toEqual({
        is_archieved: true,
        is_active: false,
      });
    });

    it("404s for an unknown assessment", async () => {
      assessment.findUnique.mockResolvedValue(null);

      await expect(service.remove(99n)).rejects.toThrow(NotFoundException);
    });
  });

  describe("copy", () => {
    beforeEach(() => {
      assessment.findUnique.mockResolvedValue({
        ...row,
        conditions: [{ condition_id: 3n }],
      });
      question.findMany.mockResolvedValue([
        {
          id: 1n,
          uuid: "q1",
          title: "Q1",
          description: null,
          type: "free_text",
          choice_id: null,
        },
      ]);
    });

    it("keeps the title when it is free", async () => {
      await expect(
        service.copy(1n, { title: "Fresh" }, USER),
      ).resolves.toMatchObject({ detail: "Assessment copied as Fresh" });
    });

    it("prefixes with (Copy) when the title is taken", async () => {
      assessment.findFirst
        .mockResolvedValueOnce({ id: 2n })
        .mockResolvedValueOnce(null);

      await expect(
        service.copy(1n, { title: "Taken" }, USER),
      ).resolves.toMatchObject({ detail: "Assessment copied as (Copy) Taken" });
    });

    it("numbers the copy when (Copy) is taken too", async () => {
      assessment.findFirst
        .mockResolvedValueOnce({ id: 2n })
        .mockResolvedValueOnce({ id: 3n })
        .mockResolvedValueOnce(null);

      await expect(
        service.copy(1n, { title: "Taken" }, USER),
      ).resolves.toMatchObject({
        detail: "Assessment copied as (Copy) Taken - 1",
      });
    });

    it("copies the conditions and the questions", async () => {
      await service.copy(1n, { title: "Fresh" }, USER);

      expect(tx.assessmentCondition.createMany.mock.calls[0][0].data).toEqual([
        { assessment_id: 10n, condition_id: 3n },
      ]);
      expect(question.create.mock.calls[0][0].data).toMatchObject({
        title: "Q1",
        assessment_id: 10n,
      });
    });

    it("credits the copy to the acting provider", async () => {
      await service.copy(1n, { title: "Fresh" }, USER);

      expect(assessment.create.mock.calls[0][0].data).toMatchObject({
        creator_id: 7n,
      });
    });

    it("404s for an unknown source", async () => {
      assessment.findUnique.mockResolvedValue(null);

      await expect(service.copy(99n, { title: "Fresh" }, USER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
