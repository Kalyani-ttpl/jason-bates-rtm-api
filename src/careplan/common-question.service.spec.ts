import { CommonQuestionService } from "./common-question.service";

describe("CommonQuestionService", () => {
  const row = {
    id: 1n,
    title: "How would you rate your overall physical health",
    type: "general",
    question_type: "single_select",
    choices: ["Excellent", "Fair"],
  };

  let commonQuestion: any;
  let service: CommonQuestionService;

  beforeEach(() => {
    commonQuestion = { findMany: jest.fn().mockResolvedValue([row]) };
    service = new CommonQuestionService({ commonQuestion } as any);
  });

  const whereOf = () => commonQuestion.findMany.mock.calls[0][0].where;

  it("returns the stored questions", async () => {
    await expect(service.findAll({ type: "general" })).resolves.toEqual([row]);
  });

  it("returns an empty list when nothing is stored", async () => {
    commonQuestion.findMany.mockResolvedValue([]);

    await expect(service.findAll({})).resolves.toEqual([]);
  });

  it.each([
    ["general_questions", "general"],
    ["support", "supports"],
    ["support_questions", "supports"],
  ])("normalises the %s alias to %s", async (alias, stored) => {
    await service.findAll({ type: alias });

    expect(whereOf()).toEqual({ type: stored });
  });

  it.each(["allergies", "medications", "supports", "general"])(
    "passes the stored type %s through unchanged",
    async (type) => {
      await service.findAll({ type });

      expect(whereOf()).toEqual({ type });
    },
  );

  it("does not filter when no type is given", async () => {
    await service.findAll({});

    expect(whereOf()).toEqual({});
  });

  it("filters on an unknown type rather than ignoring it", async () => {
    await service.findAll({ type: "nonsense" });

    expect(whereOf()).toEqual({ type: "nonsense" });
  });
});
