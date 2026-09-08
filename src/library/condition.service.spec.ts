import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConditionService } from "./condition.service";

describe("ConditionService", () => {
  const row = {
    id: 1n,
    uuid: "cond-uuid",
    title: "Acid Reflux (GERD)",
  };
  const question = {
    id: 5n,
    condition_id: 1n,
    title: "How often?",
    question_type: "single_choice",
    choices: "Daily,Weekly",
    additional_note: null,
  };

  let condition: any;
  let conditionQuestion: any;
  let icdCode: any;
  let tx: any;
  let prisma: any;
  let service: ConditionService;

  beforeEach(() => {
    condition = {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(row),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockResolvedValue(row),
      delete: jest.fn().mockResolvedValue(row),
    };
    conditionQuestion = {
      findFirst: jest.fn().mockResolvedValue(question),
      findMany: jest.fn().mockResolvedValue([question]),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue(question),
      delete: jest.fn().mockResolvedValue(question),
    };
    icdCode = {
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    };
    tx = {
      condition,
      condition_question: conditionQuestion,
      icd_code: icdCode,
    };
    prisma = { ...tx, $transaction: jest.fn((cb: any) => cb(tx)) };
    service = new ConditionService(prisma);
  });

  describe("create", () => {
    it("links ICD codes", async () => {
      await service.create({ title: "GERD", icd_codes: ["7", "8"] });

      expect(condition.create).toHaveBeenCalledWith({
        data: { title: "GERD" },
      });
      expect(icdCode.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [7n, 8n] } },
        data: { condition_id: 1n },
      });
    });

    it("does not touch ICD codes when none are supplied", async () => {
      await service.create({ title: "GERD" });

      expect(icdCode.updateMany).not.toHaveBeenCalled();
    });

    it("rejects a duplicate title", async () => {
      condition.findFirst.mockResolvedValue(row);

      await expect(service.create({ title: "GERD" })).rejects.toThrow(
        BadRequestException,
      );
      expect(condition.create).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("filters by program flag", async () => {
      await service.findAll({ program: "rpm" });

      expect(condition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { for_rpm: true } }),
      );
    });

    it("searches title and description", async () => {
      await service.findAll({ search: "reflux" });

      const where = condition.findMany.mock.calls[0][0].where;
      expect(where.OR).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("re-links ICD codes by clearing then setting", async () => {
      await service.update(1n, { icd_codes: ["9"] });

      expect(icdCode.updateMany).toHaveBeenNthCalledWith(1, {
        where: { condition_id: 1n },
        data: { condition_id: null },
      });
      expect(icdCode.updateMany).toHaveBeenNthCalledWith(2, {
        where: { id: { in: [9n] } },
        data: { condition_id: 1n },
      });
    });

    it("404s when missing", async () => {
      condition.findUnique.mockResolvedValue(null);

      await expect(service.update(1n, { title: "x" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("unlinks ICD codes before deleting", async () => {
      await service.remove(1n);

      expect(icdCode.updateMany).toHaveBeenCalledWith({
        where: { condition_id: 1n },
        data: { condition_id: null },
      });
      expect(condition.delete).toHaveBeenCalledWith({ where: { id: 1n } });
    });
  });

  describe("questions", () => {
    it("creates questions against the condition", async () => {
      await service.createQuestions(1n, {
        questions: [{ title: "How often?", question_type: "single_choice" }],
      });

      expect(conditionQuestion.createMany).toHaveBeenCalledWith({
        data: [
          {
            title: "How often?",
            question_type: "single_choice",
            condition_id: 1n,
          },
        ],
      });
    });

    it("404s creating questions for a missing condition", async () => {
      condition.findUnique.mockResolvedValue(null);

      await expect(
        service.createQuestions(1n, { questions: [] }),
      ).rejects.toThrow(NotFoundException);
    });

    it("scopes question updates to the condition", async () => {
      await service.updateQuestion(1n, 5n, { title: "Changed" });

      expect(conditionQuestion.findFirst).toHaveBeenCalledWith({
        where: { id: 5n, condition_id: 1n },
      });
      expect(conditionQuestion.update).toHaveBeenCalled();
    });

    it("404s when the question belongs to another condition", async () => {
      conditionQuestion.findFirst.mockResolvedValue(null);

      await expect(service.removeQuestion(1n, 5n)).rejects.toThrow(
        NotFoundException,
      );
      expect(conditionQuestion.delete).not.toHaveBeenCalled();
    });
  });

  describe("copyQuestions", () => {
    it("copies questions from the source condition", async () => {
      await service.copyQuestions(1n, { source_condition_id: "2" });

      expect(conditionQuestion.createMany).toHaveBeenCalledWith({
        data: [
          {
            condition_id: 1n,
            title: "How often?",
            question_type: "single_choice",
            choices: "Daily,Weekly",
            additional_note: null,
          },
        ],
      });
    });

    it("rejects copying onto itself", async () => {
      await expect(
        service.copyQuestions(1n, { source_condition_id: "1" }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
