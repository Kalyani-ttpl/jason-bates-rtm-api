import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/client";
import { randomUUID } from "node:crypto";
import * as jwt from "jsonwebtoken";

/**
 * Shared error mapping, validation and logging helpers for feature services.
 * Ported from the Zenara backend so services copied from there keep working.
 */
export class BaseService {
  protected readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  /** Translates Prisma and unknown errors into the matching HTTP exception. */
  protected handleError(error: any, customMessage?: string): never {
    if (error instanceof HttpException) {
      throw error;
    }

    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          throw new BadRequestException(
            customMessage || "A record with this identifier already exists",
          );
        case "P2025":
          throw new NotFoundException(customMessage || "Record not found");
        case "P2003":
          throw new BadRequestException(
            customMessage || "Related record does not exist",
          );
        case "P2014":
          throw new BadRequestException(customMessage || "Invalid ID provided");
        case "P2016":
          throw new BadRequestException(
            customMessage || "Invalid query parameters",
          );
        case "P2024":
          throw new InternalServerErrorException(
            customMessage || "Database timeout",
          );
        default:
          throw new InternalServerErrorException(
            customMessage || "Database operation failed",
          );
      }
    }

    if (error instanceof PrismaClientValidationError) {
      throw new BadRequestException(customMessage || "Invalid data provided");
    }

    if (error instanceof PrismaClientInitializationError) {
      throw new InternalServerErrorException(
        customMessage || "Database initialization failed",
      );
    }

    if (error instanceof PrismaClientRustPanicError) {
      throw new InternalServerErrorException(
        customMessage || "Critical database error occurred",
      );
    }

    throw new InternalServerErrorException(
      customMessage || "An unexpected error occurred",
    );
  }

  protected throwNotFoundError(
    value: any,
    message = "Resource not found",
  ): void {
    if (value === undefined || value === null || value === "") {
      throw new NotFoundException(message);
    }
  }

  protected throwBadRequestError(messageOrObject: string | object): void {
    throw new BadRequestException(messageOrObject);
  }

  protected throwConflictError(messageOrObject: string | object): void {
    throw new ConflictException(
      typeof messageOrObject === "string"
        ? { detail: messageOrObject }
        : { detail: messageOrObject },
    );
  }

  protected throwForbiddenError(messageOrObject: string | object): void {
    throw new ForbiddenException(
      typeof messageOrObject === "string"
        ? { detail: messageOrObject }
        : { detail: messageOrObject },
    );
  }

  protected validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === "") {
      throw new BadRequestException(`${fieldName} is required`);
    }
  }

  protected validateId(id: string, entityName: string): void {
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new BadRequestException(`Invalid ${entityName} ID`);
    }
  }

  protected validateEmail(email: string): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException("Invalid email format");
    }
  }

  protected validatePhoneNumber(phoneNumber: string): void {
    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      throw new BadRequestException("Invalid phone number format");
    }
  }

  protected async validateExists<T>(
    promise: Promise<T | null>,
    entityName: string,
  ): Promise<T> {
    try {
      const result = await promise;
      if (!result) {
        throw new NotFoundException(`${entityName} not found`);
      }
      return result;
    } catch (error) {
      this.handleError(error, `Error validating ${entityName} existence`);
    }
  }

  protected generateUUID(): string {
    return randomUUID();
  }

  /** Decodes the bearer token from request headers without verifying it. */
  protected decodeTokenFromHeaders(headers: Record<string, any>) {
    const token = this.getTokenFromHeaders(headers);
    try {
      return jwt.decode(token) as any;
    } catch (error) {
      this.logger.error("Failed to decode token", error?.stack || error);
      throw new UnauthorizedException("Failed to decode token");
    }
  }

  protected getTokenFromHeaders(headers: Record<string, any>): string {
    const authorization = headers["authorization"] || headers["Authorization"];
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Authorization token is missing or invalid",
      );
    }
    return authorization.split(" ")[1];
  }

  protected usNumberFormat(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/[^0-9]/g, "");
    if (cleaned.length === 10) return `+1${cleaned}`;
    if (cleaned.length === 11 && cleaned[0] === "1") return `+${cleaned}`;
    return phoneNumber;
  }

  protected logInfo(message: string, context?: any): void {
    this.logger.log(message, context);
  }

  protected logError(message: string, error?: any): void {
    this.logger.error(message, error?.stack);
  }

  protected logDebug(message: string, context?: any): void {
    this.logger.debug(message, context);
  }
}
