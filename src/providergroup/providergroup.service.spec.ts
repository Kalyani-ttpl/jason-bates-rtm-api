import { ConflictException, NotFoundException } from "@nestjs/common";
import { CreateGroupDto } from "./dto/providergroup.dto";
import { ProvidergroupService } from "./providergroup.service";

describe("ProvidergroupService", () => {
  const created = {
    id: 1n,
    group_name: "Jason RTM Group",
    physical_address_id: 10n,
    billing_address_id: 11n,
  };

  const physical = { address_line_1: "1200 Market St", city: "Philadelphia" };

  // A stored row as findMany/findUnique return it, with both addresses joined.
  const row = {
    id: 1n,
    uuid: "group-uuid",
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-01-02"),
    group_name: "Jason RTM Group",
    email: null,
    speciality: null,
    caller_id: null,
    caller_id_verified: null,
    disable_patient_emails: null,
    physical_address: {
      id: 10n,
      uuid: "addr-uuid",
      line1: "1200 Market St",
      line2: null,
      city: "Philadelphia",
      state: "PA",
      postalCode: "19107",
      country: "US",
    },
    billing_address: null,
  };

  let providerGroup: any;
  let address: any;
  let tx: any;
  let prisma: any;
  let service: ProvidergroupService;

  const payload = (
    overrides: Partial<CreateGroupDto> = {},
  ): CreateGroupDto => ({
    group_name: "Jason RTM Group",
    physical_address: physical,
    ...overrides,
  });

  beforeEach(() => {
    providerGroup = {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(row),
      findMany: jest.fn().mockResolvedValue([row]),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue(created),
      update: jest.fn().mockResolvedValue(row),
    };
    address = {
      create: jest
        .fn()
        .mockResolvedValueOnce({ id: 10n })
        .mockResolvedValueOnce({ id: 11n }),
    };
    tx = { providerGroup, address };
    prisma = { ...tx, $transaction: jest.fn((cb: any) => cb(tx)) };
    service = new ProvidergroupService(prisma);
  });

  it("creates the group and returns Zenara's response envelope", async () => {
    const result = await service.createProviderGroup(payload());

    expect(result).toEqual({
      message: "Provider group created successfully",
      data: created,
      success: true,
    });
  });

  it("maps the address payload onto the addresses columns", async () => {
    await service.createProviderGroup(
      payload({
        physical_address: {
          address_line_1: "1200 Market St",
          address_line_2: "Suite 400",
          city: "Philadelphia",
          state: "PA",
          zip: "19107",
          country: "US",
        },
      }),
    );

    expect(address.create).toHaveBeenCalledWith({
      data: {
        type: "physical",
        line1: "1200 Market St",
        line2: "Suite 400",
        city: "Philadelphia",
        state: "PA",
        postalCode: "19107",
        country: "US",
      },
      select: { id: true },
    });
  });

  it("links both addresses when a billing address is supplied", async () => {
    await service.createProviderGroup(
      payload({ billing_address: { address_line_1: "PO Box 12" } }),
    );

    expect(address.create).toHaveBeenCalledTimes(2);
    expect(providerGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          physical_address_id: 10n,
          billing_address_id: 11n,
        }),
      }),
    );
  });

  it("leaves the billing address null when it is omitted", async () => {
    await service.createProviderGroup(payload());

    expect(address.create).toHaveBeenCalledTimes(1);
    expect(providerGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          physical_address_id: 10n,
          billing_address_id: undefined,
        }),
      }),
    );
  });

  it("rejects a duplicate name case-insensitively", async () => {
    providerGroup.findFirst.mockResolvedValue(created);

    await expect(service.createProviderGroup(payload())).rejects.toThrow(
      ConflictException,
    );

    expect(providerGroup.findFirst).toHaveBeenCalledWith({
      where: {
        group_name: { contains: "Jason RTM Group", mode: "insensitive" },
      },
    });
    expect(providerGroup.create).not.toHaveBeenCalled();
  });

  it("does not create addresses when the name is taken", async () => {
    providerGroup.findFirst.mockResolvedValue(created);

    await expect(service.createProviderGroup(payload())).rejects.toThrow(
      ConflictException,
    );

    expect(address.create).not.toHaveBeenCalled();
  });

  it("persists the group fields alongside the address ids", async () => {
    await service.createProviderGroup(
      payload({
        email: "group@jason-rtm.com",
        phone: "+12155551234",
        speciality: ["cardiology"],
        timezone: "America/New_York",
        status: "active",
      }),
    );

    expect(providerGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          group_name: "Jason RTM Group",
          email: "group@jason-rtm.com",
          phone: "+12155551234",
          speciality: ["cardiology"],
          timezone: "America/New_York",
          status: "active",
        }),
      }),
    );
  });

  describe("getProviderGroup", () => {
    it("defaults to page 1, size 10, newest first", async () => {
      await service.getProviderGroup({});

      expect(providerGroup.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { created_at: "desc" },
        include: { physical_address: true, billing_address: true },
      });
    });

    it("searches the group name case-insensitively", async () => {
      await service.getProviderGroup({ search: "jason" });

      expect(providerGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { group_name: { contains: "jason", mode: "insensitive" } },
        }),
      );
    });

    it("counts with the same filter as the page query", async () => {
      await service.getProviderGroup({ search: "jason" });

      expect(providerGroup.count).toHaveBeenCalledWith({
        where: { group_name: { contains: "jason", mode: "insensitive" } },
      });
    });

    it("applies pagination and sorting", async () => {
      await service.getProviderGroup({
        page_no: "3",
        page_size: "5",
        sort_by: "group_name",
        order_by: "asc",
      });

      expect(providerGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 5,
          orderBy: { group_name: "asc" },
        }),
      );
    });

    it("reports next and previous pages", async () => {
      providerGroup.count.mockResolvedValue(30);

      const result = await service.getProviderGroup({ page_no: "2" });

      expect(result).toMatchObject({ count: 30, next: 3, previous: 1 });
    });

    it("maps the address back to Zenara's field names", async () => {
      const result = await service.getProviderGroup({});

      expect(result.results[0].physical_address).toEqual({
        id: 10n,
        uuid: "addr-uuid",
        address_line_1: "1200 Market St",
        address_line_2: null,
        city: "Philadelphia",
        state: "PA",
        zip: "19107",
        country: "US",
      });
      expect(result.results[0].billing_address).toBeNull();
    });

    it("defaults the nullable display fields", async () => {
      const result = await service.getProviderGroup({});

      expect(result.results[0]).toMatchObject({
        email: "",
        speciality: [],
        caller_id: "",
        caller_id_verified: false,
        disable_patient_emails: false,
      });
    });
  });

  describe("getProviderGroupById", () => {
    it("returns the group with its addresses", async () => {
      const result = await service.getProviderGroupById(1n);

      expect(providerGroup.findUnique).toHaveBeenCalledWith({
        where: { id: 1n },
        include: { physical_address: true, billing_address: true },
      });
      expect(result).toMatchObject({ id: 1n, group_name: "Jason RTM Group" });
    });

    it("404s when the group is missing", async () => {
      providerGroup.findUnique.mockResolvedValue(null);

      await expect(service.getProviderGroupById(1n)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateProviderGroup", () => {
    it("updates the supplied columns", async () => {
      await service.updateProviderGroup(1n, { group_name: "Renamed" });

      expect(providerGroup.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1n },
          data: expect.objectContaining({ group_name: "Renamed" }),
        }),
      );
    });

    it("404s when the group is missing", async () => {
      providerGroup.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProviderGroup(1n, { group_name: "Renamed" }),
      ).rejects.toThrow(NotFoundException);
      expect(providerGroup.update).not.toHaveBeenCalled();
    });

    it("writes a new address row and repoints the group at it", async () => {
      await service.updateProviderGroup(1n, {
        physical_address: { address_line_1: "9 New St" },
      });

      expect(address.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ type: "physical", line1: "9 New St" }),
        select: { id: true },
      });
      expect(providerGroup.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ physical_address_id: 10n }),
        }),
      );
    });

    it("leaves the address ids untouched when no address is supplied", async () => {
      await service.updateProviderGroup(1n, { phone: "+12155551234" });

      expect(address.create).not.toHaveBeenCalled();
      expect(providerGroup.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            physical_address_id: undefined,
            billing_address_id: undefined,
          }),
        }),
      );
    });
  });
});
