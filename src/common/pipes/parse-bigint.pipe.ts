import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

/** Converts a numeric route param to BigInt, rejecting anything BigInt() would throw on. */
@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string): bigint {
    if (!/^\d+$/.test(value)) {
      throw new BadRequestException("Invalid id");
    }
    return BigInt(value);
  }
}
