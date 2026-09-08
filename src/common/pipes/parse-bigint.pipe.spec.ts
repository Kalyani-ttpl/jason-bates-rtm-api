import { BadRequestException } from "@nestjs/common";
import { ParseBigIntPipe } from "./parse-bigint.pipe";

describe("ParseBigIntPipe", () => {
  const pipe = new ParseBigIntPipe();

  it("converts a numeric string to BigInt", () => {
    expect(pipe.transform("42")).toBe(42n);
  });

  it("handles values beyond Number.MAX_SAFE_INTEGER", () => {
    expect(pipe.transform("9007199254740993")).toBe(9007199254740993n);
  });

  it.each(["abc", "", "1.5", "-1", " 1", "1e3"])(
    "rejects %p rather than throwing a raw SyntaxError",
    (value) => {
      expect(() => pipe.transform(value)).toThrow(BadRequestException);
    },
  );
});
