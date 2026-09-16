import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BaseService } from "../common/base.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  AddressDto,
  CreatePatientDto,
  DemographyDto,
  DuplicatePatientCheckDto,
  EmergencyContactDto,
  EnrollmentDto,
  InsuranceDto,
  QueryPatientsDto,
  UpdatePatientDto,
} from "./dto/patient.dto";

const NOT_FOUND = "Patient not found";
const MRN_EXISTS = "Patient with provided MRN number already exist";
const EMAIL_EXISTS = "Patient with provided email already exist";
const SAME_CARE_MANAGER =
  "Primary and secondary care manager cannot be the same";

/** The API speaks snake_case; `patients` follows `schema (2).prisma` camelCase. */
const SORT_FIELDS: Record<string, string> = {
  created_at: "createdAt",
  updated_at: "updatedAt",
  first_name: "firstName",
  last_name: "lastName",
  date_of_birth: "dateOfBirth",
  status: "status",
  mrn: "mrn",
};

const PROFILE_INCLUDE = {
  addresses: true,
  emergencyContacts: true,
  insurances: true,
  enrollments: { where: { deleted: false } },
  providerGroup: { select: { id: true, group_name: true } },
} satisfies Prisma.PatientInclude;

type PatientProfileRow = Prisma.PatientGetPayload<{
  include: typeof PROFILE_INCLUDE;
}>;

@Injectable()
export class PatientsService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(PatientsService.name);
  }

  /**
   * Tells the onboarding form whether a patient with the same name and date of
   * birth already exists, so the user can be warned before creating a duplicate.
   */
  async duplicateCheck(payload: DuplicatePatientCheckDto) {
    try {
      const patient = await this.prisma.patient.findFirst({
        where: {
          firstName: { equals: payload.first_name, mode: "insensitive" },
          lastName: { equals: payload.last_name, mode: "insensitive" },
          dateOfBirth: new Date(payload.date_of_birth),
          isDeleted: false,
        },
        select: { id: true },
      });

      return { detail: patient !== null };
    } catch (error) {
      this.handleError(error, "Failed to check duplicate patient");
    }
  }

  /**
   * Onboards a patient: demographics, address, enrolments, emergency contacts
   * and insurances all land in one transaction, so a failure part-way through
   * leaves no half-built patient behind.
   */
  async create(payload: CreatePatientDto) {
    try {
      const { demography } = payload;
      await this.validateDemography(demography);

      const patient = await this.prisma.$transaction(async (tx) => {
        const created = await tx.patient.create({
          data: {
            ...this.toPatientFields(demography),
            firstName: demography.first_name,
            lastName: demography.last_name,
            dateOfBirth: new Date(demography.date_of_birth),
            isActive: true,
          },
        });

        if (demography.address) {
          await tx.address.create({
            data: {
              ...this.toAddressFields(demography.address),
              patientId: created.id,
              type: "primary",
            },
          });
        }

        await this.writeEnrollments(tx, created.id, payload.enrollments);
        await this.writeEmergencyContacts(
          tx,
          created.id,
          payload.emergency_contacts,
        );
        if (!payload.no_insurance) {
          await this.writeInsurances(tx, created.id, payload.insurances);
        }

        return created;
      });

      return {
        detail: "Patient created successfully",
        patient_id: patient.id,
        uuid: patient.uuid,
      };
    } catch (error) {
      this.handleError(error, "Failed to create patient");
    }
  }

  /**
   * Updates an onboarded patient. Each child list is replaced when supplied and
   * left untouched when omitted; `deleted_*` removes specific rows instead.
   */
  async update(id: bigint, payload: UpdatePatientDto) {
    try {
      const existing = await this.prisma.patient.findUnique({ where: { id } });
      this.throwNotFoundError(existing, NOT_FOUND);

      const { demography } = payload;
      if (demography) await this.validateDemography(demography, id);

      await this.prisma.$transaction(async (tx) => {
        if (demography) {
          await tx.patient.update({
            where: { id },
            data: {
              ...this.toPatientFields(demography),
              ...(demography.first_name && {
                firstName: demography.first_name,
              }),
              ...(demography.last_name && { lastName: demography.last_name }),
              ...(demography.date_of_birth && {
                dateOfBirth: new Date(demography.date_of_birth),
              }),
            },
          });

          if (demography.address) {
            await tx.address.deleteMany({
              where: { patientId: id, type: "primary" },
            });
            await tx.address.create({
              data: {
                ...this.toAddressFields(demography.address),
                patientId: id,
                type: "primary",
              },
            });
          }
        }

        if (payload.deleted_emergency_contacts?.length) {
          await tx.patientEmergencyContact.deleteMany({
            where: {
              patientId: id,
              id: { in: payload.deleted_emergency_contacts.map(BigInt) },
            },
          });
        }

        if (payload.deleted_insurances?.length) {
          await tx.patientInsurance.deleteMany({
            where: {
              patientId: id,
              id: { in: payload.deleted_insurances.map(BigInt) },
            },
          });
        }

        if (payload.enrollments?.length) {
          await tx.enrollment.deleteMany({ where: { patient_id: id } });
          await this.writeEnrollments(tx, id, payload.enrollments);
        }

        if (payload.emergency_contacts?.length) {
          await tx.patientEmergencyContact.deleteMany({
            where: { patientId: id },
          });
          await this.writeEmergencyContacts(tx, id, payload.emergency_contacts);
        }

        if (payload.insurances?.length) {
          await tx.patientInsurance.deleteMany({ where: { patientId: id } });
          await this.writeInsurances(tx, id, payload.insurances);
        }
      });

      return { detail: "Patient updated successfully" };
    } catch (error) {
      this.handleError(error, "Failed to update patient");
    }
  }

  /** Full onboarding record: demographics plus every child list. */
  async findProfile(id: bigint) {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id },
        include: PROFILE_INCLUDE,
      });
      this.throwNotFoundError(patient, NOT_FOUND);

      const row = patient!;
      return {
        ...this.toDemography(row),
        emergency_contacts: row.emergencyContacts.map((contact) => ({
          id: contact.id,
          contact_person: [contact.firstName, contact.lastName]
            .filter(Boolean)
            .join(" "),
          phone: contact.phone,
          relation: contact.relationship,
          email: contact.email,
          preferred_language: contact.preferredLanguage,
        })),
        insurances: row.insurances.map((insurance) => ({
          id: insurance.id,
          name: insurance.name,
          insurance_type: insurance.type,
          holder_name: [insurance.insuredFirstName, insurance.insuredLastName]
            .filter(Boolean)
            .join(" "),
          policy_number: insurance.memberId,
          group_number: insurance.groupId,
          group_name: insurance.groupName,
          relation_to_insured: insurance.relationshipToInsured,
          effective_date: insurance.effectiveDate,
          expiration_date: insurance.expirationDate,
          image1: insurance.cardFrontUrl,
          image2: insurance.cardBackUrl,
        })),
        enrollments: row.enrollments,
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch patient profile");
    }
  }

  /** Demographics only — the same record without the child lists. */
  async findDemography(id: bigint) {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id },
        include: PROFILE_INCLUDE,
      });
      this.throwNotFoundError(patient, NOT_FOUND);

      return this.toDemography(patient!);
    } catch (error) {
      this.handleError(error, "Failed to fetch patient demography");
    }
  }

  /** Paginated patient list for the onboarding and roster screens. */
  async findAll(param: QueryPatientsDto) {
    try {
      const pageNo = Math.max(Number(param.page_no) || 1, 1);
      const pageSize = Math.min(
        Math.max(Number(param.page_size) || 10, 1),
        100,
      );
      const sortBy = SORT_FIELDS[param.sort_by ?? "created_at"] ?? "createdAt";
      const orderBy = param.order_by ?? "desc";

      const where: Prisma.PatientWhereInput = {
        isDeleted: false,
        ...(param.status && { status: param.status }),
        ...(param.group_id && { providerGroupId: BigInt(param.group_id) }),
        ...(param.program && {
          enrollments: {
            some: {
              category: param.program,
              deleted: false,
              unenrolled: false,
            },
          },
        }),
        ...(param.search && {
          OR: [
            { firstName: { contains: param.search, mode: "insensitive" } },
            { lastName: { contains: param.search, mode: "insensitive" } },
            { email: { contains: param.search, mode: "insensitive" } },
            { phone: { contains: param.search, mode: "insensitive" } },
            { mrn: { contains: param.search, mode: "insensitive" } },
          ],
        }),
      };

      const [rows, count] = await Promise.all([
        this.prisma.patient.findMany({
          where,
          include: {
            enrollments: {
              where: { deleted: false },
              select: { id: true, category: true, unenrolled: true },
            },
            providerGroup: { select: { id: true, group_name: true } },
          },
          take: pageSize,
          skip: (pageNo - 1) * pageSize,
          orderBy: { [sortBy]: orderBy },
        }),
        this.prisma.patient.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows.map((row) => ({
          id: row.id,
          uuid: row.uuid,
          first_name: row.firstName,
          middle_name: row.middleName,
          last_name: row.lastName,
          date_of_birth: row.dateOfBirth,
          gender: row.gender,
          email: row.email,
          phone: row.phone,
          mrn: row.mrn,
          status: row.status,
          invite_status: row.inviteStatus,
          risk_level: row.riskLevel,
          provider_group: row.providerGroup,
          programs: row.enrollments
            .filter((enrollment) => !enrollment.unenrolled)
            .map((enrollment) => enrollment.category),
        })),
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch patients");
    }
  }

  /**
   * Checks the care manager pair, the linked providers and group, and that the
   * MRN and email are not already taken.
   */
  private async validateDemography(
    demography: DemographyDto,
    excludeId?: bigint,
  ) {
    if (
      demography.primary_care_manager &&
      demography.primary_care_manager === demography.secondary_care_manager
    ) {
      this.throwBadRequestError(SAME_CARE_MANAGER);
    }

    const providerIds = [
      demography.primary_care_manager,
      demography.secondary_care_manager,
      demography.primary_physician,
    ].filter((id): id is number => typeof id === "number");

    for (const id of providerIds) {
      const provider = await this.prisma.provider.findUnique({
        where: { id: BigInt(id) },
        select: { id: true },
      });
      this.throwNotFoundError(provider, `Provider ${id} not found`);
    }

    if (demography.provider_group) {
      const group = await this.prisma.providerGroup.findUnique({
        where: { id: BigInt(demography.provider_group) },
        select: { id: true },
      });
      this.throwNotFoundError(group, "Provider group not found");
    }

    const exclude = excludeId ? { NOT: { id: excludeId } } : {};

    if (demography.mrn) {
      const duplicate = await this.prisma.patient.findFirst({
        where: { mrn: demography.mrn, ...exclude },
        select: { id: true },
      });
      if (duplicate) this.throwConflictError(MRN_EXISTS);
    }

    if (demography.email) {
      const duplicate = await this.prisma.patient.findFirst({
        where: { email: demography.email, ...exclude },
        select: { id: true },
      });
      if (duplicate) this.throwConflictError(EMAIL_EXISTS);
    }
  }

  /** Maps the snake_case onboarding payload onto the camelCase patient row. */
  private toPatientFields(demography: DemographyDto) {
    return {
      ...(demography.middle_name !== undefined && {
        middleName: demography.middle_name,
      }),
      ...(demography.gender !== undefined && { gender: demography.gender }),
      ...(demography.pronoun !== undefined && { pronoun: demography.pronoun }),
      ...(demography.email !== undefined && { email: demography.email }),
      ...(demography.phone !== undefined && { phone: demography.phone }),
      ...(demography.secondary_phone !== undefined && {
        secondaryPhone: demography.secondary_phone,
      }),
      ...(demography.home_phone !== undefined && {
        homePhone: demography.home_phone,
      }),
      ...(demography.work_phone !== undefined && {
        workPhone: demography.work_phone,
      }),
      ...(demography.language !== undefined && {
        preferredLanguage: demography.language,
      }),
      ...(demography.race !== undefined && { race: demography.race }),
      ...(demography.ethnicity !== undefined && {
        ethnicity: demography.ethnicity,
      }),
      ...(demography.marital_status !== undefined && {
        maritalStatus: demography.marital_status,
      }),
      ...(demography.pos !== undefined && { pos: demography.pos }),
      ...(demography.notes !== undefined && { notes: demography.notes }),
      ...(demography.registration_date !== undefined && {
        registrationDate: new Date(demography.registration_date),
      }),
      ...(demography.risk_level !== undefined && {
        riskLevel: demography.risk_level,
      }),
      ...(demography.risk_score !== undefined && {
        riskScore: demography.risk_score,
      }),
      ...(demography.is_consent_to_message !== undefined && {
        isConsentToMessage: demography.is_consent_to_message,
      }),
      ...(demography.is_consent_to_call !== undefined && {
        isConsentToCall: demography.is_consent_to_call,
      }),
      ...(demography.is_consent_to_email !== undefined && {
        isConsentToEmail: demography.is_consent_to_email,
      }),
      ...(demography.is_pcm_eligible !== undefined && {
        isPcmEligible: demography.is_pcm_eligible,
      }),
      ...(demography.is_rtm_eligible !== undefined && {
        isRtmEligible: demography.is_rtm_eligible,
      }),
      ...(demography.is_heart_eligible !== undefined && {
        isHeartEligible: demography.is_heart_eligible,
      }),
      ...(demography.referring_provider !== undefined && {
        referringProvider: demography.referring_provider,
      }),
      ...(demography.preferred_communication_channel !== undefined && {
        preferredCommunication: demography.preferred_communication_channel,
      }),
      ...(demography.timezone !== undefined && {
        timezone: demography.timezone,
      }),
      ...(demography.disable_call_recording !== undefined && {
        disableCallRecording: demography.disable_call_recording,
      }),
      ...(demography.mrn !== undefined && { mrn: demography.mrn }),
      ...(demography.picture !== undefined && {
        profilePicture: demography.picture,
      }),
      ...(demography.primary_care_manager !== undefined && {
        primaryCareManagerId: BigInt(demography.primary_care_manager),
      }),
      ...(demography.secondary_care_manager !== undefined && {
        secondaryCareManagerId: BigInt(demography.secondary_care_manager),
      }),
      ...(demography.primary_physician !== undefined && {
        primaryPhysicianId: BigInt(demography.primary_physician),
      }),
      ...(demography.provider_group !== undefined && {
        providerGroupId: BigInt(demography.provider_group),
      }),
    };
  }

  private toAddressFields(address: AddressDto) {
    return {
      line1: address.address_line_1,
      line2: address.address_line_2,
      city: address.city,
      state: address.state,
      postalCode: address.zip,
      country: address.country,
    };
  }

  private async writeEnrollments(
    tx: Prisma.TransactionClient,
    patientId: bigint,
    enrollments?: EnrollmentDto[],
  ) {
    if (!enrollments?.length) return;

    await tx.enrollment.createMany({
      data: enrollments.map((enrollment) => ({
        patient_id: patientId,
        category: enrollment.category,
        enrolled_at: enrollment.enrolled_at
          ? new Date(enrollment.enrolled_at)
          : new Date(),
        consent_form_type: enrollment.consent_form_type,
        signed_consent_file: enrollment.signed_consent_file,
        consent_signed_at: enrollment.signed_consent_file ? new Date() : null,
        is_billable: enrollment.is_billable ?? false,
        is_declined: enrollment.is_declined ?? false,
        declined_at: enrollment.declined_at
          ? new Date(enrollment.declined_at)
          : null,
        note: enrollment.note,
        unenrolled: false,
      })),
    });
  }

  /** `contact_person` is one field on the form and two columns in the table. */
  private async writeEmergencyContacts(
    tx: Prisma.TransactionClient,
    patientId: bigint,
    contacts?: EmergencyContactDto[],
  ) {
    if (!contacts?.length) return;

    await tx.patientEmergencyContact.createMany({
      data: contacts.map((contact) => {
        const [firstName, ...rest] = contact.contact_person.trim().split(/\s+/);
        return {
          patientId,
          firstName,
          lastName: rest.join(" "),
          phone: contact.phone,
          relationship: contact.relation,
          email: contact.email,
          preferredLanguage: contact.preferred_language,
        };
      }),
    });
  }

  private async writeInsurances(
    tx: Prisma.TransactionClient,
    patientId: bigint,
    insurances?: InsuranceDto[],
  ) {
    if (!insurances?.length) return;

    await tx.patientInsurance.createMany({
      data: insurances.map((insurance) => {
        const [firstName, ...rest] = (insurance.holder_name ?? "")
          .trim()
          .split(/\s+/);
        return {
          patientId,
          name: insurance.name,
          type: insurance.insurance_type,
          memberId: insurance.policy_number,
          groupId: insurance.group_number,
          groupName: insurance.group_name,
          insuredFirstName: firstName || null,
          insuredLastName: rest.join(" ") || null,
          relationshipToInsured: insurance.relation_to_insured,
          effectiveDate: insurance.effective_date
            ? new Date(insurance.effective_date)
            : null,
          expirationDate: insurance.expiration_date
            ? new Date(insurance.expiration_date)
            : null,
          cardFrontUrl: insurance.image1,
          cardBackUrl: insurance.image2,
        };
      }),
    });
  }

  /** Turns the stored row back into the snake_case shape the form expects. */
  private toDemography(row: PatientProfileRow) {
    const address = row.addresses.find((a) => a.type === "primary");

    return {
      id: row.id,
      uuid: row.uuid,
      first_name: row.firstName,
      middle_name: row.middleName,
      last_name: row.lastName,
      gender: row.gender,
      pronoun: row.pronoun,
      date_of_birth: row.dateOfBirth,
      email: row.email,
      phone: row.phone,
      secondary_phone: row.secondaryPhone,
      home_phone: row.homePhone,
      work_phone: row.workPhone,
      language: row.preferredLanguage,
      race: row.race,
      ethnicity: row.ethnicity,
      marital_status: row.maritalStatus,
      pos: row.pos,
      notes: row.notes,
      registration_date: row.registrationDate,
      risk_level: row.riskLevel,
      risk_score: row.riskScore,
      is_consent_to_message: row.isConsentToMessage,
      is_consent_to_call: row.isConsentToCall,
      is_consent_to_email: row.isConsentToEmail,
      is_pcm_eligible: row.isPcmEligible,
      is_rtm_eligible: row.isRtmEligible,
      is_heart_eligible: row.isHeartEligible,
      referring_provider: row.referringProvider,
      preferred_communication_channel: row.preferredCommunication,
      timezone: row.timezone,
      disable_call_recording: row.disableCallRecording,
      mrn: row.mrn,
      status: row.status,
      invite_status: row.inviteStatus,
      picture: row.profilePicture,
      primary_care_manager: row.primaryCareManagerId,
      secondary_care_manager: row.secondaryCareManagerId,
      primary_physician: row.primaryPhysicianId,
      provider_group: row.providerGroup,
      address: address
        ? {
            id: address.id,
            address_line_1: address.line1,
            address_line_2: address.line2,
            city: address.city,
            state: address.state,
            zip: address.postalCode,
            country: address.country,
          }
        : null,
    };
  }
}
