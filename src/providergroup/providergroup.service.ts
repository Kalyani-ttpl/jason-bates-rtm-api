import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BaseService } from "../common/base.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  AddressDto,
  CreateGroupDto,
  QueryGroupsDto,
  UpdateGroupDto,
} from "./dto/providergroup.dto";

const GROUP_EXISTS = "Provider group with this name already exists";
const GROUP_NOT_FOUND = "Provider group not found";

const WITH_ADDRESSES = {
  physical_address: true,
  billing_address: true,
} as const;

@Injectable()
export class ProvidergroupService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(ProvidergroupService.name);
  }

  /**
   * Creates a provider group with its physical and billing addresses, rejecting
   * a name that is already taken. Ported from Zenara's createProviderGroup.
   */
  async createProviderGroup(data: CreateGroupDto) {
    try {
      const { physical_address, billing_address, ...group } = data;

      const existingGroup = await this.prisma.providerGroup.findFirst({
        where: {
          group_name: { contains: group.group_name, mode: "insensitive" },
        },
      });
      if (existingGroup) {
        this.throwConflictError(GROUP_EXISTS);
      }

      const created = await this.prisma.$transaction(async (tx) => {
        const physical = physical_address
          ? await tx.address.create({
              data: this.toAddress(physical_address, "physical"),
              select: { id: true },
            })
          : null;

        const billing = billing_address
          ? await tx.address.create({
              data: this.toAddress(billing_address, "billing"),
              select: { id: true },
            })
          : null;

        return tx.providerGroup.create({
          data: {
            ...group,
            speciality: group.speciality as Prisma.InputJsonValue,
            physical_address_id: physical?.id,
            billing_address_id: billing?.id,
          },
          select: {
            id: true,
            group_name: true,
            physical_address_id: true,
            billing_address_id: true,
          },
        });
      });

      return {
        message: "Provider group created successfully",
        data: created,
        success: true,
      };
    } catch (error) {
      this.handleError(error, "Failed to create provider group");
    }
  }

  /** Returns a paginated, searchable list of provider groups. */
  async getProviderGroup(param: QueryGroupsDto) {
    try {
      const pageNo = Math.max(Number(param.page_no) || 1, 1);
      const pageSize = Math.min(
        Math.max(Number(param.page_size) || 10, 1),
        100,
      );
      const sortBy = param.sort_by ?? "created_at";
      const orderBy = param.order_by ?? "desc";

      const where = param.search
        ? {
            group_name: {
              contains: param.search,
              mode: "insensitive" as const,
            },
          }
        : {};

      const [rows, count] = await Promise.all([
        this.prisma.providerGroup.findMany({
          where,
          skip: (pageNo - 1) * pageSize,
          take: pageSize,
          orderBy: { [sortBy]: orderBy },
          include: WITH_ADDRESSES,
        }),
        this.prisma.providerGroup.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows.map((row) => this.toResponse(row)),
      };
    } catch (error) {
      this.handleError(error, "Failed to get provider group");
    }
  }

  async getProviderGroupById(id: bigint) {
    try {
      const group = await this.prisma.providerGroup.findUnique({
        where: { id },
        include: WITH_ADDRESSES,
      });
      this.throwNotFoundError(group, GROUP_NOT_FOUND);

      return this.toResponse(group!);
    } catch (error) {
      this.handleError(error, "Failed to get provider group by ID");
    }
  }

  /**
   * Updates a provider group. Following Zenara, a supplied address is written as
   * a new `addresses` row that the group is then repointed at, rather than
   * editing the existing one.
   */
  async updateProviderGroup(id: bigint, data: UpdateGroupDto) {
    try {
      const { physical_address, billing_address, ...group } = data;

      const existing = await this.prisma.providerGroup.findUnique({
        where: { id },
        select: { id: true },
      });
      this.throwNotFoundError(existing, GROUP_NOT_FOUND);

      const updated = await this.prisma.$transaction(async (tx) => {
        const physical = physical_address
          ? await tx.address.create({
              data: this.toAddress(physical_address, "physical"),
              select: { id: true },
            })
          : null;

        const billing = billing_address
          ? await tx.address.create({
              data: this.toAddress(billing_address, "billing"),
              select: { id: true },
            })
          : null;

        return tx.providerGroup.update({
          where: { id },
          data: {
            ...group,
            physical_address_id: physical?.id,
            billing_address_id: billing?.id,
          },
          include: WITH_ADDRESSES,
        });
      });

      return this.toResponse(updated);
    } catch (error) {
      this.handleError(error, "Failed to update provider group");
    }
  }

  /** Maps Zenara's address payload onto the `addresses` columns. */
  private toAddress(data: AddressDto, type: string): Prisma.AddressCreateInput {
    return {
      type,
      line1: data.address_line_1,
      line2: data.address_line_2,
      city: data.city,
      state: data.state,
      postalCode: data.zip,
      country: data.country,
    };
  }

  /** Mirrors Zenara's convertOneProviderGroupResponse. */
  private toResponse(
    group: Prisma.ProviderGroupGetPayload<{
      include: typeof WITH_ADDRESSES;
    }>,
  ) {
    return {
      id: group.id,
      uuid: group.uuid,
      created_at: group.created_at,
      updated_at: group.updated_at,
      billing_address: this.toAddressResponse(group.billing_address),
      physical_address: this.toAddressResponse(group.physical_address),
      connections: [],
      vendors: [],
      group_name: group.group_name,
      website: group.website,
      email: group.email || "",
      group_npi: group.group_npi,
      speciality: group.speciality || [],
      status: group.status,
      phone: group.phone || "",
      bio: group.bio || "",
      caller_id: group.caller_id || "",
      caller_id_verified: group.caller_id_verified ?? false,
      code: group.code,
      device_vender_base_url: group.device_vender_base_url,
      timezone: group.timezone,
      fax_id: group.fax_id,
      picture: group.picture,
      report_logo: group.report_logo,
      consent_logo: group.consent_logo,
      communication_logo: group.communication_logo,
      disable_patient_emails: group.disable_patient_emails ?? false,
      disable_patient_notifications:
        group.disable_patient_notifications ?? false,
      disable_patient_sms: group.disable_patient_sms ?? false,
      disable_patient_calls: group.disable_patient_calls ?? false,
      disable_provider_emails: group.disable_provider_emails ?? false,
      disable_provider_notifications:
        group.disable_provider_notifications ?? false,
      disable_provider_sms: group.disable_provider_sms ?? false,
      disable_call_recording: group.disable_call_recording ?? false,
      show_revenue: group.show_revenue ?? false,
      system_email: group.system_email,
      system_email_verified: group.system_email_verified ?? false,
    };
  }

  /** Reverses `toAddress`, so the API keeps Zenara's address field names. */
  private toAddressResponse(address: Prisma.AddressGetPayload<object> | null) {
    if (!address) {
      return null;
    }
    return {
      id: address.id,
      uuid: address.uuid,
      address_line_1: address.line1,
      address_line_2: address.line2,
      city: address.city,
      state: address.state,
      zip: address.postalCode,
      country: address.country,
    };
  }
}
