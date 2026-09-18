import { Transform } from "class-transformer";

/**
 * Query params arrive as strings and the global pipe does not enable
 * `transform`, so `?flag=false` would reach `@IsBoolean()` as `"false"` and 400.
 * Apply this above `@IsBoolean()` on any boolean query param.
 */
export const ToBoolean = () =>
  Transform(({ value }: { value: unknown }) =>
    value === "true" ? true : value === "false" ? false : value,
  );
