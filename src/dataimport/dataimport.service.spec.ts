import { DataimportService } from "./dataimport.service";
import {
  ALLERGY_QUESTIONS,
  GENERAL_QUESTIONS,
  MEDICATION_QUESTIONS,
  SUPPORT_QUESTIONS,
} from "./data/common-questions";

const TOTAL =
  ALLERGY_QUESTIONS.length +
  MEDICATION_QUESTIONS.length +
  SUPPORT_QUESTIONS.length +
  GENERAL_QUESTIONS.length;

describe("DataimportService", () => {
  let commonQuestion: any;
  let service: DataimportService;

  beforeEach(() => {
    commonQuestion = {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    };
    service = new DataimportService({ commonQuestion } as any);
  });

  describe("createCommonCareplanQuestions", () => {
    it("inserts every question when the table is empty", async () => {
      await service.createCommonCareplanQuestions();

      expect(commonQuestion.create).toHaveBeenCalledTimes(TOTAL);
    });

    it("stores the choices and question type of each question", async () => {
      await service.createCommonCareplanQuestions();

      expect(commonQuestion.create).toHaveBeenCalledWith({
        data: {
          type: "allergies",
          title: ALLERGY_QUESTIONS[0].title,
          choices: ALLERGY_QUESTIONS[0].options,
          question_type: ALLERGY_QUESTIONS[0].question_type,
        },
      });
    });

    it("writes only the four stored types", async () => {
      await service.createCommonCareplanQuestions();

      const types = commonQuestion.create.mock.calls.map(
        (call: any[]) => call[0].data.type,
      );
      expect(new Set(types)).toEqual(
        new Set(["allergies", "medications", "supports", "general"]),
      );
    });

    it("skips questions that are already stored, so it can be re-run", async () => {
      commonQuestion.findFirst.mockResolvedValue({ id: 1n });

      await service.createCommonCareplanQuestions();

      expect(commonQuestion.create).not.toHaveBeenCalled();
    });

    it("looks a question up by title and type", async () => {
      await service.createCommonCareplanQuestions();

      expect(commonQuestion.findFirst).toHaveBeenCalledWith({
        where: { title: ALLERGY_QUESTIONS[0].title, type: "allergies" },
      });
    });
  });

  describe("importAllData", () => {
    it("reports the questions import as succeeded", async () => {
      await expect(service.importAllData()).resolves.toEqual({
        succeeded: ["createCommonCareplanQuestions"],
        failed: [],
      });
    });

    it("records a failing step instead of throwing", async () => {
      commonQuestion.create.mockRejectedValue(new Error("db down"));

      const results = await service.importAllData();

      expect(results.succeeded).toEqual([]);
      expect(results.failed).toHaveLength(1);
      expect(results.failed[0].operation).toBe("createCommonCareplanQuestions");
    });
  });
});
