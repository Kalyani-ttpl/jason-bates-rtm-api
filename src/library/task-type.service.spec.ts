import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AuthenticatedUser } from "../common/constants";
import { TaskTypeService } from "./task-type.service";

describe("TaskTypeService", () => {
  const row = { id: 1n, title: "Follow-up Appointment" };
  const user = { providerId: 20n } as AuthenticatedUser;

  let taskType: any;
  let prisma: any;
  let service: TaskTypeService;

  beforeEach(() => {
    taskType = {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(row),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockResolvedValue(row),
      delete: jest.fn().mockResolvedValue(row),
    };
    prisma = { taskType };
    service = new TaskTypeService(prisma);
  });

  it("stamps the creator, converting the provider group id", async () => {
    await service.create(
      { title: "Follow-up", is_billable: true, provider_group_id: "4" },
      user,
    );

    expect(taskType.create).toHaveBeenCalledWith({
      data: {
        title: "Follow-up",
        is_billable: true,
        provider_group_id: 4n,
        created_by_id: 20n,
      },
    });
  });

  it("stores a null provider group when none is given", async () => {
    await service.create({ title: "Follow-up" }, user);

    expect(taskType.create.mock.calls[0][0].data.provider_group_id).toBeNull();
  });

  it("rejects a duplicate title within the same provider group", async () => {
    taskType.findFirst.mockResolvedValue(row);

    await expect(service.create({ title: "Follow-up" }, user)).rejects.toThrow(
      BadRequestException,
    );
    expect(taskType.create).not.toHaveBeenCalled();
  });

  it("filters by archive status", async () => {
    await service.findAll({ is_archived: "true" });

    expect(taskType.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { is_archived: true } }),
    );
  });

  it("archives via update", async () => {
    await service.update(1n, { is_archived: true });

    expect(taskType.update).toHaveBeenCalledWith({
      where: { id: 1n },
      data: { is_archived: true },
    });
  });

  it("404s updating a missing activity type", async () => {
    taskType.findUnique.mockResolvedValue(null);

    await expect(service.update(1n, { title: "x" })).rejects.toThrow(
      NotFoundException,
    );
  });

  it("404s deleting a missing activity type", async () => {
    taskType.findUnique.mockResolvedValue(null);

    await expect(service.remove(1n)).rejects.toThrow(NotFoundException);
    expect(taskType.delete).not.toHaveBeenCalled();
  });
});
