import { NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../common/constants";
import { TemplateService } from "./template.service";

describe("TemplateService", () => {
  const row = {
    id: 1n,
    title: "Reminder",
    template_body: "Old body",
    template_type: "sms",
  };
  const user = { providerId: 20n } as AuthenticatedUser;

  let template: any;
  let revision: any;
  let tx: any;
  let prisma: any;
  let service: TemplateService;

  beforeEach(() => {
    template = {
      findUnique: jest.fn().mockResolvedValue(row),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(row),
      update: jest
        .fn()
        .mockResolvedValue({ ...row, template_body: "New body" }),
      delete: jest.fn().mockResolvedValue(row),
    };
    revision = { create: jest.fn().mockResolvedValue({}) };
    tx = {
      bulk_communication_template: template,
      bulk_communication_template_revision: revision,
    };
    prisma = { ...tx, $transaction: jest.fn((cb: any) => cb(tx)) };
    service = new TemplateService(prisma);
  });

  it("stamps the creator", async () => {
    await service.create(
      { title: "Reminder", template_body: "Hi", template_type: "sms" },
      user,
    );

    expect(template.create).toHaveBeenCalledWith({
      data: {
        title: "Reminder",
        template_body: "Hi",
        template_type: "sms",
        provider_group_id: null,
        created_by_id: 20n,
      },
    });
  });

  it("records a revision of the before and after content on update", async () => {
    await service.update(1n, { template_body: "New body" }, user);

    expect(revision.create).toHaveBeenCalledWith({
      data: {
        template_id: 1n,
        old_title: "Reminder",
        new_title: "Reminder",
        old_content: "Old body",
        new_content: "New body",
        revision_by_id: 20n,
      },
    });
  });

  it("404s updating a missing template", async () => {
    template.findUnique.mockResolvedValue(null);

    await expect(service.update(1n, { title: "x" }, user)).rejects.toThrow(
      NotFoundException,
    );
    expect(revision.create).not.toHaveBeenCalled();
  });

  it("narrows the sms listing to sms templates", async () => {
    await service.findSmsTemplates({});

    expect(template.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { template_type: "sms" } }),
    );
  });

  it("personalises the patient portal templates when a name is known", () => {
    const templates = service.patientPortalTemplates("John Doe");

    expect(templates.reschedule.message).toContain("I'm John Doe");
    expect(templates.cancel.label).toBe("Cancel Appointment");
  });

  it("falls back to a generic greeting without a name", () => {
    expect(service.patientPortalTemplates().reschedule.message).toMatch(/^Hi,/);
  });
});
