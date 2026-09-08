import { NotFoundException } from "@nestjs/common";
import { CareplanService } from "./careplan.service";

describe("CareplanService", () => {
  const row = { id: 1n, title: "Diabetes Plan" };

  let careplan: any;
  let prisma: any;
  let service: CareplanService;

  beforeEach(() => {
    careplan = {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(row),
    };
    prisma = { carePlan: careplan };
    service = new CareplanService(prisma);
  });

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
      ).resolves.toEqual({
        message: "Care Plan already exist with same name",
        isExist: true,
      });
    });

    it("matches on the whole title, case-insensitively", async () => {
      await service.checkCarePlan({ title: "Diabetes Plan" });

      expect(careplan.findFirst).toHaveBeenCalledWith({
        where: { title: { equals: "Diabetes Plan", mode: "insensitive" } },
      });
    });

    it("ignores the program field, as Zenara does", async () => {
      await service.checkCarePlan({ title: "rew", program: "ccm" });

      expect(careplan.findFirst.mock.calls[0][0].where).not.toHaveProperty(
        "programs",
      );
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

    it("flags a title taken by a different care plan when editing", async () => {
      careplan.findFirst.mockResolvedValue({ ...row, id: 2n });

      await expect(
        service.checkCarePlan({ title: "Diabetes Plan", id: "1" }),
      ).resolves.toMatchObject({ isExist: true });
    });

    it("404s when the care plan being edited does not exist", async () => {
      careplan.findUnique.mockResolvedValue(null);

      await expect(
        service.checkCarePlan({ title: "Any", id: "99" }),
      ).rejects.toThrow(NotFoundException);
      expect(careplan.findFirst).not.toHaveBeenCalled();
    });
  });
});
