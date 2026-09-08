import { NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../common/constants";
import { ConsentService } from "./consent.service";

describe("ConsentService", () => {
  const row = {
    id: 1n,
    uuid: "consent-uuid",
    title: "CCM Enrollment Consent",
    program: "CCM",
    file: "<p>Consent body</p>",
    created_at: new Date("2026-01-01"),
    created_by: { id: 20n, first_name: "Jason", last_name: "Bates" },
    is_deleted: false,
  };
  const user = { providerId: 20n } as AuthenticatedUser;

  let consent: any;
  let prisma: any;
  let service: ConsentService;

  beforeEach(() => {
    consent = {
      findFirst: jest.fn().mockResolvedValue(row),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockResolvedValue(row),
    };
    prisma = { consent };
    service = new ConsentService(prisma);
  });

  it("stamps the creator", async () => {
    await service.create({ title: "New consent" }, user);

    expect(consent.create).toHaveBeenCalledWith({
      data: { title: "New consent", created_by_id: 20n },
    });
  });

  it("excludes soft-deleted consents from the listing", async () => {
    await service.findAll({});

    expect(consent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { is_deleted: false } }),
    );
  });

  it("filters by program", async () => {
    await service.findAll({ program: "CCM" });

    expect(consent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { is_deleted: false, program: "CCM" } }),
    );
  });

  it("soft deletes rather than removing the row", async () => {
    await service.remove(1n, user);

    expect(consent.update).toHaveBeenCalledWith({
      where: { id: 1n },
      data: {
        is_deleted: true,
        deleted_at: expect.any(Date),
        deleted_by_id: 20n,
      },
    });
  });

  it("404s deleting a missing consent", async () => {
    consent.findFirst.mockResolvedValue(null);

    await expect(service.remove(1n, user)).rejects.toThrow(NotFoundException);
    expect(consent.update).not.toHaveBeenCalled();
  });

  it("returns the body as content for preview", async () => {
    const result = await service.preview(1n);

    expect(result).toMatchObject({
      title: "CCM Enrollment Consent",
      content: "<p>Consent body</p>",
    });
  });

  it("copies the body under a new title", async () => {
    await service.copy(1n, { title: "Copy of consent" }, user);

    expect(consent.create).toHaveBeenCalledWith({
      data: {
        title: "Copy of consent",
        program: "CCM",
        file: "<p>Consent body</p>",
        created_by_id: 20n,
      },
    });
  });

  it("exposes the static boilerplate templates", () => {
    const templates = service.additionalConsentTemplates();

    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty("body");
  });
});
