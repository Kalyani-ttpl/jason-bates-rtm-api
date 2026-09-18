import { ValidationPipe } from "@nestjs/common";
import { ChartingQueryDto } from "../patient-charting/dto/charting.dto";
import { QueryTasksDto } from "../tasks/dto/task.dto";

/** Runs a query DTO through the same pipe configuration as `main.ts`. */
const parse = (metatype: new () => object, value: Record<string, string>) =>
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }).transform(
    value,
    { type: "query", metatype },
  );

describe("boolean query params", () => {
  it("accepts is_deleted=false on the charting tabs as a real boolean", async () => {
    await expect(
      parse(ChartingQueryDto, { is_deleted: "false" }),
    ).resolves.toEqual({
      is_deleted: false,
    });
  });

  it("accepts the task list flags as real booleans", async () => {
    await expect(
      parse(QueryTasksDto, { my_tasks: "true", patient_task: "false" }),
    ).resolves.toEqual({ my_tasks: true, patient_task: false });
  });

  it("still rejects a value that is not a boolean", async () => {
    await expect(parse(QueryTasksDto, { my_tasks: "yes" })).rejects.toThrow();
  });

  it("accepts the task filter in any case", async () => {
    await expect(parse(QueryTasksDto, { tasks: "To Do" })).resolves.toEqual({
      tasks: "to do",
    });
  });
});
