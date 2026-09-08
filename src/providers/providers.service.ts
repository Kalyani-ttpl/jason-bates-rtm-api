import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { BaseService } from "../common/base.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProviderDto } from "./dto/providers.dto";

const EMAIL_EXISTS = "Provider with this email already exists";
const NPI_EXISTS = "Provider with this NPI already exists";
const CREATED = "Provider created successfully";

@Injectable()
export class ProvidersService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(ProvidersService.name);
  }

  /**
   * Creates a provider: the sign-in account, the provider record and its group
   * memberships. Ported from Zenara's createProvider, which sets no password and
   * emails an invitation; here an optional password is hashed instead.
   */
  async createProvider(data: CreateProviderDto, groupIdFromRoute?: bigint) {
    try {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: { contains: data.email, mode: "insensitive" } },
      });
      if (existingEmail) {
        this.throwBadRequestError(EMAIL_EXISTS);
      }

      if (data.npi) {
        const existingNpi = await this.prisma.provider.findFirst({
          where: { npi: data.npi },
        });
        if (existingNpi) {
          this.throwBadRequestError(NPI_EXISTS);
        }
      }

      const groupIds = data.provider_group?.length
        ? data.provider_group.map((id) => BigInt(id))
        : groupIdFromRoute
          ? [groupIdFromRoute]
          : [];

      const created = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            picture: data.picture,
            passwordHash: data.password
              ? await bcrypt.hash(data.password, 10)
              : undefined,
            isActive: true,
            isProvider: true,
            isPatient: false,
            isTenantAdmin: data.is_tenant_admin ?? false,
            isSuperTenantAdmin: false,
          },
          select: { id: true },
        });

        const provider = await tx.provider.create({
          data: {
            ...this.toProvider(data),
            user_id: user.id,
            is_deleted: false,
          },
          select: { id: true },
        });

        if (groupIds.length) {
          await tx.providerGroupMember.createMany({
            data: groupIds.map((provider_group_id) => ({
              provider_id: provider.id,
              provider_group_id,
            })),
            skipDuplicates: true,
          });
        }

        return { id: provider.id, user_id: user.id };
      });

      return { ...created, message: CREATED };
    } catch (error) {
      this.handleError(error, "Failed to create provider");
    }
  }

  /** Maps the request payload onto the provider columns. */
  private toProvider(
    data: CreateProviderDto,
  ): Prisma.ProviderUncheckedCreateInput {
    return {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      middle_name: data.middle_name,
      display_name: data.display_name,
      gender: data.gender,
      pronoun: data.pronoun,
      phone: data.phone,
      npi: data.npi,
      role: data.role,
      secondary_role: data.secondary_role,
      language: data.language,
      timezone: data.timezone,
      picture: data.picture,
      status: data.status,
      speciality: data.speciality,
      provider_type: data.provider_type,
      year_of_experience: data.year_of_experience,
      bio: data.bio,
      state_license: data.state_license,
      license_number: data.license_number,
      taxonomyCode: data.taxonomyCode,
      is_tenant_admin: data.is_tenant_admin ?? false,
      is_clinical_manager: data.is_clinical_manager ?? false,
      is_auto_timelog: data.is_auto_timelog ?? false,
      auto_timelog_message: data.auto_timelog_message,
      caller_id: data.caller_id,
      caller_id_verified: data.caller_id_verified ?? false,
      dynamic_caller_ids: data.dynamic_caller_ids,
    };
  }
}
