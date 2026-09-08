import { BadRequestException, NotFoundException } from "@nestjs/common";
import { IcdCodeService } from "./icd-code.service";

describe("IcdCodeService", () => {
  const row = {
    id: 1n,
    uuid: "icd-uuid",
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-01-02"),
    description: "Typhoid fever",
    code: "A01.0",
    status: "active",
    is_unspecified: false,
    is_hipaa_covered: null,
    order_number: null,
  };

  let icdCode: any;
  let prisma: any;
  let service: IcdCodeService;

  beforeEach(() => {
    icdCode = {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockResolvedValue(row),
      delete: jest.fn().mockResolvedValue(row),
    };
    prisma = { icd_code: icdCode };
    service = new IcdCodeService(prisma);
  });

  describe("create", () => {
    it("creates the code", async () => {
      await service.create({ description: "Typhoid fever", code: "A01.0" });

      expect(icdCode.create).toHaveBeenCalledWith({
        data: { description: "Typhoid fever", code: "A01.0" },
      });
    });

    it("returns a value/label pair for dropdowns", async () => {
      const result = await service.create({
        description: "Typhoid fever",
        code: "A01.0",
      });

      expect(result).toMatchObject({
        id: 1n,
        value: 1n,
        label: "A01.0 - Typhoid fever",
      });
    });

    it("returns the status and unspecified flag", async () => {
      const result = await service.create({
        code: "M54.50",
        is_unspecified: true,
      });

      expect(result).toMatchObject({ status: "active", is_unspecified: false });
      expect(icdCode.create).toHaveBeenCalledWith({
        data: { code: "M54.50", is_unspecified: true },
      });
    });

    it("omits the separator in label when there is no description", async () => {
      icdCode.create.mockResolvedValue({ ...row, description: null });

      const result = await service.create({ code: "M54.50" });

      expect(result.label).toBe("A01.0");
    });

    it("rejects a duplicate code", async () => {
      icdCode.findFirst.mockResolvedValue(row);

      await expect(
        service.create({ description: "Dup", code: "A01.0" }),
      ).rejects.toThrow(BadRequestException);
      expect(icdCode.create).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("defaults to page 1, size 15, newest first", async () => {
      await service.findAll({});

      expect(icdCode.findMany).toHaveBeenCalledWith({
        where: {},
        take: 15,
        skip: 0,
        orderBy: { created_at: "desc" },
      });
    });

    it("searches code and description case-insensitively", async () => {
      await service.findAll({ search: "A01" });

      expect(icdCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { code: { contains: "A01", mode: "insensitive" } },
              { description: { contains: "A01", mode: "insensitive" } },
            ],
          },
        }),
      );
    });

    it("applies pagination and sorting", async () => {
      await service.findAll({
        page_no: "3",
        page_size: "10",
        sort_by: "description",
        order_by: "asc",
      });

      expect(icdCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
          orderBy: { description: "asc" },
        }),
      );
    });

    it("filters by status", async () => {
      await service.findAll({ status: "inactive" });

      expect(icdCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: "inactive" } }),
      );
    });

    it("filters on the unspecified flag", async () => {
      await service.findAll({ is_unspecified: "true" });

      expect(icdCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { is_unspecified: true } }),
      );
    });

    it("combines filters with search", async () => {
      await service.findAll({
        status: "active",
        search: "M17",
        is_unspecified: "false",
      });

      const where = icdCode.findMany.mock.calls[0][0].where;
      expect(where.status).toBe("active");
      expect(where.is_unspecified).toBe(false);
      expect(where.OR).toHaveLength(2);
    });

    it("caps page size at 100", async () => {
      await service.findAll({ page_size: "5000" });

      expect(icdCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it("reports next and previous pages", async () => {
      icdCode.count.mockResolvedValue(40);
      icdCode.findMany.mockResolvedValue([row]);

      const result = await service.findAll({ page_no: "2" });

      expect(result).toMatchObject({ count: 40, next: 3, previous: 1 });
      expect(result.results[0].label).toBe("A01.0 - Typhoid fever");
    });

    it("has no next page on the last page", async () => {
      icdCode.count.mockResolvedValue(10);

      const result = await service.findAll({});

      expect(result).toMatchObject({ next: null, previous: null });
    });
  });

  describe("findOne", () => {
    it("returns the code", async () => {
      icdCode.findUnique.mockResolvedValue(row);

      await expect(service.findOne(1n)).resolves.toMatchObject({
        code: "A01.0",
      });
    });

    it("404s when missing", async () => {
      icdCode.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1n)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("updates an existing code", async () => {
      icdCode.findUnique.mockResolvedValue(row);

      await service.update(1n, { description: "Renamed" });

      expect(icdCode.update).toHaveBeenCalledWith({
        where: { id: 1n },
        data: { description: "Renamed" },
      });
    });

    it("404s when missing", async () => {
      icdCode.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1n, { description: "Renamed" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("rejects a code used by another record", async () => {
      icdCode.findUnique.mockResolvedValue(row);
      icdCode.findFirst.mockResolvedValue({ ...row, id: 2n });

      await expect(service.update(1n, { code: "A01.0" })).rejects.toThrow(
        BadRequestException,
      );
      expect(icdCode.update).not.toHaveBeenCalled();
    });

    it("allows keeping its own code", async () => {
      icdCode.findUnique.mockResolvedValue(row);
      icdCode.findFirst.mockResolvedValue(null);

      await service.update(1n, { code: "A01.0" });

      expect(icdCode.findFirst).toHaveBeenCalledWith({
        where: { code: "A01.0", NOT: { id: 1n } },
      });
      expect(icdCode.update).toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("deletes an existing code", async () => {
      icdCode.findUnique.mockResolvedValue(row);

      await expect(service.remove(1n)).resolves.toMatchObject({
        id: 1n,
      });
      expect(icdCode.delete).toHaveBeenCalledWith({ where: { id: 1n } });
    });

    it("404s when missing", async () => {
      icdCode.findUnique.mockResolvedValue(null);

      await expect(service.remove(1n)).rejects.toThrow(NotFoundException);
      expect(icdCode.delete).not.toHaveBeenCalled();
    });
  });
});
