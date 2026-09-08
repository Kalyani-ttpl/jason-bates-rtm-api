import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CptCodeService } from "./cpt-code.service";

describe("CptCodeService", () => {
  const row = {
    id: 1n,
    uuid: "cpt-uuid",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
    description: "Office or other outpatient visit",
    code: "99213",
    category: "Evaluation and Management",
    globalPeriod: null,
    status: "active",
    isFavorite: false,
  };

  let cptCode: any;
  let prisma: any;
  let service: CptCodeService;

  beforeEach(() => {
    cptCode = {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockResolvedValue(row),
      delete: jest.fn().mockResolvedValue(row),
    };
    prisma = { cptCode };
    service = new CptCodeService(prisma);
  });

  describe("create", () => {
    it("creates the code", async () => {
      await service.create({ description: "Visit", code: "99213" });

      expect(cptCode.create).toHaveBeenCalledWith({
        data: { description: "Visit", code: "99213" },
      });
    });

    it("persists the Figma fields", async () => {
      await service.create({
        code: "29881",
        description: "Knee arthroscopy w/ meniscectomy",
        category: "Surgical",
        global_period: 90,
        is_favorite: true,
      });

      expect(cptCode.create).toHaveBeenCalledWith({
        data: {
          code: "29881",
          description: "Knee arthroscopy w/ meniscectomy",
          category: "Surgical",
          globalPeriod: 90,
          isFavorite: true,
        },
      });
    });

    it("returns global period, status and favourite", async () => {
      const result = await service.create({
        description: "Visit",
        code: "99213",
      });

      expect(result).toMatchObject({
        global_period: null,
        status: "active",
        is_favorite: false,
      });
    });

    it("rejects a duplicate code", async () => {
      cptCode.findFirst.mockResolvedValue(row);

      await expect(
        service.create({ description: "Dup", code: "99213" }),
      ).rejects.toThrow(BadRequestException);
      expect(cptCode.create).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("defaults to page 1, size 15, newest first", async () => {
      await service.findAll({});

      expect(cptCode.findMany).toHaveBeenCalledWith({
        where: {},
        take: 15,
        skip: 0,
        orderBy: { createdAt: "desc" },
      });
    });

    it("searches code, description and category", async () => {
      await service.findAll({ search: "992" });

      const where = cptCode.findMany.mock.calls[0][0].where;
      expect(where.OR).toHaveLength(3);
      expect(where.OR).toContainEqual({
        description: { contains: "992", mode: "insensitive" },
      });
      expect(where.OR).toContainEqual({
        category: { contains: "992", mode: "insensitive" },
      });
    });

    it("filters by category, status and favourite", async () => {
      await service.findAll({
        category: "Surgical",
        status: "active",
        is_favorite: "true",
      });

      expect(cptCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: "Surgical", status: "active", isFavorite: true },
        }),
      );
    });

    it("sorts starred codes first", async () => {
      await service.findAll({ sort_by: "is_favorite", order_by: "desc" });

      expect(cptCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { isFavorite: "desc" } }),
      );
    });

    it("applies pagination and sorting", async () => {
      await service.findAll({
        page_no: "2",
        page_size: "20",
        sort_by: "category",
        order_by: "asc",
      });

      expect(cptCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 20,
          orderBy: { category: "asc" },
        }),
      );
    });

    it("returns the dropdown label", async () => {
      cptCode.count.mockResolvedValue(1);
      cptCode.findMany.mockResolvedValue([row]);

      const result = await service.findAll({});

      expect(result.results[0].label).toBe(
        "99213 - Office or other outpatient visit",
      );
    });
  });

  describe("findOne", () => {
    it("returns the code", async () => {
      cptCode.findUnique.mockResolvedValue(row);

      await expect(service.findOne(1n)).resolves.toMatchObject({
        code: "99213",
      });
    });

    it("404s when missing", async () => {
      cptCode.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1n)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("updates an existing code", async () => {
      cptCode.findUnique.mockResolvedValue(row);

      await service.update(1n, { category: "Surgery" });

      expect(cptCode.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: { category: "Surgery" },
      });
    });

    it("404s when missing", async () => {
      cptCode.findUnique.mockResolvedValue(null);

      await expect(service.update(1n, { category: "Surgery" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("rejects a code used by another record", async () => {
      cptCode.findUnique.mockResolvedValue(row);
      cptCode.findFirst.mockResolvedValue({ ...row, id: 2n });

      await expect(service.update(1n, { code: "99213" })).rejects.toThrow(
        BadRequestException,
      );
      expect(cptCode.update).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("deletes an existing code", async () => {
      cptCode.findUnique.mockResolvedValue(row);

      await expect(service.remove(1n)).resolves.toMatchObject({
        id: 1n,
      });
      expect(cptCode.delete).toHaveBeenCalledWith({ where: { id: 1n } });
    });

    it("404s when missing", async () => {
      cptCode.findUnique.mockResolvedValue(null);

      await expect(service.remove(1n)).rejects.toThrow(NotFoundException);
      expect(cptCode.delete).not.toHaveBeenCalled();
    });
  });
});
