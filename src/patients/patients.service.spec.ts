import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PatientsService } from "./patients.service";

const DEMOGRAPHY = {
  first_name: "Isidro",
  last_name: "McGlynn",
  date_of_birth: "1959-01-01",
};

describe("PatientsService", () => {
  const profileRow = {
    id: 1n,
    uuid: "uuid-1",
    firstName: "Isidro",
    middleName: null,
    lastName: "McGlynn",
    dateOfBirth: new Date("1959-01-01"),
    gender: "Male",
    preferredLanguage: "en",
    profilePicture: "media/patient/1/pic.png",
    addresses: [
      { id: 3n, type: "primary", line1: "12 Main St", city: "Boston" },
    ],
    emergencyContacts: [
      {
        id: 4n,
        firstName: "Jane",
        lastName: "Doe",
        phone: "9876543210",
        relationship: "Spouse",
        email: null,
        preferredLanguage: null,
      },
    ],
    insurances: [
      {
        id: 5n,
        name: "Blue Cross",
        type: "primary",
        insuredFirstName: "John",
        insuredLastName: "McGlynn",
        memberId: "POL-1",
        groupId: "GRP-1",
        groupName: null,
        relationshipToInsured: "Self",
        effectiveDate: null,
        expirationDate: null,
        cardFrontUrl: "media/front.png",
        cardBackUrl: null,
      },
    ],
    enrollments: [{ id: 6n, category: "rtm", unenrolled: false }],
    providerGroup: { id: 2n, group_name: "Jason RTM Group" },
  };

  let patient: any;
  let address: any;
  let contact: any;
  let insurance: any;
  let enrollment: any;
  let provider: any;
  let providerGroup: any;
  let tx: any;
  let prisma: any;
  let service: PatientsService;

  beforeEach(() => {
    patient = {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(profileRow),
      findMany: jest.fn().mockResolvedValue([profileRow]),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue({ id: 10n, uuid: "uuid-10" }),
      update: jest.fn().mockResolvedValue({ id: 10n }),
    };
    address = {
      create: jest.fn().mockResolvedValue({ id: 3n }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };
    contact = {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };
    insurance = {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };
    enrollment = {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };
    provider = { findUnique: jest.fn().mockResolvedValue({ id: 1n }) };
    providerGroup = { findUnique: jest.fn().mockResolvedValue({ id: 1n }) };

    tx = {
      patient,
      address,
      patientEmergencyContact: contact,
      patientInsurance: insurance,
      enrollment,
    };
    prisma = {
      ...tx,
      provider,
      providerGroup,
      $transaction: jest.fn((cb: any) => cb(tx)),
    };
    service = new PatientsService(prisma);
  });

  describe("duplicateCheck", () => {
    it("reports no match", async () => {
      await expect(
        service.duplicateCheck({ ...DEMOGRAPHY } as any),
      ).resolves.toEqual({ detail: false });
    });

    it("reports a match", async () => {
      patient.findFirst.mockResolvedValue({ id: 1n });

      await expect(
        service.duplicateCheck({ ...DEMOGRAPHY } as any),
      ).resolves.toEqual({ detail: true });
    });

    it("matches name case-insensitively on the exact date of birth", async () => {
      await service.duplicateCheck({ ...DEMOGRAPHY });

      expect(patient.findFirst.mock.calls[0][0].where).toMatchObject({
        firstName: { equals: "Isidro", mode: "insensitive" },
        lastName: { equals: "McGlynn", mode: "insensitive" },
        dateOfBirth: new Date("1959-01-01"),
        isDeleted: false,
      });
    });
  });

  describe("create", () => {
    it("creates the patient and returns its id", async () => {
      await expect(
        service.create({ demography: { ...DEMOGRAPHY } } as any),
      ).resolves.toEqual({
        detail: "Patient created successfully",
        patient_id: 10n,
        uuid: "uuid-10",
      });
    });

    it("maps snake_case demography onto camelCase columns", async () => {
      await service.create({
        demography: {
          ...DEMOGRAPHY,
          language: "es",
          secondary_phone: "123",
          is_rtm_eligible: true,
          picture: "media/pic.png",
        },
      });

      expect(patient.create.mock.calls[0][0].data).toMatchObject({
        firstName: "Isidro",
        lastName: "McGlynn",
        dateOfBirth: new Date("1959-01-01"),
        preferredLanguage: "es",
        secondaryPhone: "123",
        isRtmEligible: true,
        profilePicture: "media/pic.png",
      });
    });

    it("stores the address against the patient as primary", async () => {
      await service.create({
        demography: {
          ...DEMOGRAPHY,
          address: { address_line_1: "12 Main St", zip: "02108" },
        },
      });

      expect(address.create.mock.calls[0][0].data).toMatchObject({
        line1: "12 Main St",
        postalCode: "02108",
        patientId: 10n,
        type: "primary",
      });
    });

    it("splits contact_person into first and last name", async () => {
      await service.create({
        demography: { ...DEMOGRAPHY },
        emergency_contacts: [
          { contact_person: "Jane Van Doe", relation: "Spouse" },
        ],
      });

      expect(contact.createMany.mock.calls[0][0].data[0]).toMatchObject({
        firstName: "Jane",
        lastName: "Van Doe",
        relationship: "Spouse",
      });
    });

    it("splits holder_name onto the insured name columns", async () => {
      await service.create({
        demography: { ...DEMOGRAPHY },
        insurances: [{ name: "Blue Cross", holder_name: "John McGlynn" }],
      });

      expect(insurance.createMany.mock.calls[0][0].data[0]).toMatchObject({
        insuredFirstName: "John",
        insuredLastName: "McGlynn",
      });
    });

    it("skips insurances when no_insurance is set", async () => {
      await service.create({
        demography: { ...DEMOGRAPHY },
        no_insurance: true,
        insurances: [{ name: "Blue Cross" }],
      });

      expect(insurance.createMany).not.toHaveBeenCalled();
    });

    it("stamps consent_signed_at when a signed file is supplied", async () => {
      await service.create({
        demography: { ...DEMOGRAPHY },
        enrollments: [{ category: "rtm", signed_consent_file: "media/c.pdf" }],
      });

      const row = enrollment.createMany.mock.calls[0][0].data[0];
      expect(row.signed_consent_file).toBe("media/c.pdf");
      expect(row.consent_signed_at).toBeInstanceOf(Date);
    });

    it("leaves consent_signed_at null without a signed file", async () => {
      await service.create({
        demography: { ...DEMOGRAPHY },
        enrollments: [{ category: "rtm" }],
      });

      expect(enrollment.createMany.mock.calls[0][0].data[0]).toMatchObject({
        consent_signed_at: null,
        unenrolled: false,
      });
    });

    it("400s when the same provider is both care managers", async () => {
      await expect(
        service.create({
          demography: {
            ...DEMOGRAPHY,
            primary_care_manager: 1,
            secondary_care_manager: 1,
          },
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it("404s for a care manager that does not exist", async () => {
      provider.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          demography: { ...DEMOGRAPHY, primary_care_manager: 99 },
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it("409s on a duplicate MRN", async () => {
      patient.findFirst.mockResolvedValue({ id: 2n });

      await expect(
        service.create({
          demography: { ...DEMOGRAPHY, mrn: "MRN-1" },
        } as any),
      ).rejects.toThrow(ConflictException);
    });

    it("409s on a duplicate email", async () => {
      patient.findFirst.mockResolvedValue({ id: 2n });

      await expect(
        service.create({
          demography: { ...DEMOGRAPHY, email: "a@b.com" },
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("only writes the demography fields supplied", async () => {
      await service.update(1n, { demography: { gender: "Female" } } as any);

      expect(patient.update.mock.calls[0][0].data).toEqual({
        gender: "Female",
      });
    });

    it("replaces the primary address rather than adding a second", async () => {
      await service.update(1n, {
        demography: { address: { city: "Boston" } },
      } as any);

      expect(address.deleteMany).toHaveBeenCalledWith({
        where: { patientId: 1n, type: "primary" },
      });
      expect(address.create).toHaveBeenCalled();
    });

    it("removes only the emergency contacts listed for deletion", async () => {
      await service.update(1n, {
        deleted_emergency_contacts: ["4", "5"],
      } as any);

      expect(contact.deleteMany).toHaveBeenCalledWith({
        where: { patientId: 1n, id: { in: [4n, 5n] } },
      });
    });

    it("removes only the insurances listed for deletion", async () => {
      await service.update(1n, { deleted_insurances: ["7"] } as any);

      expect(insurance.deleteMany).toHaveBeenCalledWith({
        where: { patientId: 1n, id: { in: [7n] } },
      });
    });

    it("replaces enrollments wholesale when supplied", async () => {
      await service.update(1n, {
        enrollments: [{ category: "rtm" }],
      } as any);

      expect(enrollment.deleteMany).toHaveBeenCalledWith({
        where: { patient_id: 1n },
      });
      expect(enrollment.createMany).toHaveBeenCalled();
    });

    it("leaves child lists untouched when they are omitted", async () => {
      await service.update(1n, { demography: { gender: "Female" } } as any);

      expect(enrollment.deleteMany).not.toHaveBeenCalled();
      expect(contact.deleteMany).not.toHaveBeenCalled();
      expect(insurance.deleteMany).not.toHaveBeenCalled();
    });

    it("404s for an unknown patient", async () => {
      patient.findUnique.mockResolvedValue(null);

      await expect(service.update(99n, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findProfile", () => {
    it("rejoins contact_person from the two name columns", async () => {
      const result: any = await service.findProfile(1n);

      expect(result.emergency_contacts[0]).toMatchObject({
        contact_person: "Jane Doe",
        relation: "Spouse",
      });
    });

    it("maps insurance columns back to the form field names", async () => {
      const result: any = await service.findProfile(1n);

      expect(result.insurances[0]).toMatchObject({
        holder_name: "John McGlynn",
        policy_number: "POL-1",
        group_number: "GRP-1",
        image1: "media/front.png",
      });
    });

    it("returns the enrollments", async () => {
      const result: any = await service.findProfile(1n);

      expect(result.enrollments).toHaveLength(1);
    });

    it("404s for an unknown patient", async () => {
      patient.findUnique.mockResolvedValue(null);

      await expect(service.findProfile(99n)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findDemography", () => {
    it("returns snake_case demographics with the primary address", async () => {
      const result: any = await service.findDemography(1n);

      expect(result).toMatchObject({
        first_name: "Isidro",
        last_name: "McGlynn",
        language: "en",
        picture: "media/patient/1/pic.png",
      });
      expect(result.address).toMatchObject({ address_line_1: "12 Main St" });
    });

    it("omits the child lists", async () => {
      const result: any = await service.findDemography(1n);

      expect(result.insurances).toBeUndefined();
      expect(result.emergency_contacts).toBeUndefined();
    });

    it("returns a null address when none is stored", async () => {
      patient.findUnique.mockResolvedValue({ ...profileRow, addresses: [] });

      const result: any = await service.findDemography(1n);

      expect(result.address).toBeNull();
    });
  });

  describe("findAll", () => {
    it("returns the repository pagination envelope", async () => {
      const result: any = await service.findAll({});

      expect(result).toMatchObject({ count: 1, next: null, previous: null });
      expect(result.results[0]).toMatchObject({ first_name: "Isidro" });
    });

    it("lists the categories the patient is still enrolled in", async () => {
      const result: any = await service.findAll({});

      expect(result.results[0].programs).toEqual(["rtm"]);
    });

    it("excludes deleted patients", async () => {
      await service.findAll({});

      expect(patient.findMany.mock.calls[0][0].where).toMatchObject({
        isDeleted: false,
      });
    });

    it("searches across name, email, phone and mrn", async () => {
      await service.findAll({ search: "mcg" });

      expect(patient.findMany.mock.calls[0][0].where.OR).toHaveLength(5);
    });

    it("filters on an active enrollment in the given program", async () => {
      await service.findAll({ program: "rtm" });

      expect(patient.findMany.mock.calls[0][0].where.enrollments).toEqual({
        some: { category: "rtm", deleted: false, unenrolled: false },
      });
    });

    it("falls back to createdAt for an unknown sort_by", async () => {
      await service.findAll({ sort_by: "nonsense" });

      expect(patient.findMany.mock.calls[0][0].orderBy).toEqual({
        createdAt: "desc",
      });
    });

    it("caps the page size at 100", async () => {
      await service.findAll({ page_size: "5000" });

      expect(patient.findMany.mock.calls[0][0].take).toBe(100);
    });
  });
});
