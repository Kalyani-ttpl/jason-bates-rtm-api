import { MAX_OCCURRENCES, recurringDates } from "./recurrence";

const iso = (dates: Date[]) => dates.map((d) => d.toISOString());

describe("recurringDates", () => {
  const start = "2026-09-17T10:30:00.000Z"; // a Thursday

  it("repeats daily for endAfter total occurrences", () => {
    expect(
      iso(recurringDates(start, { recurringFrequency: "daily", endAfter: 3 })),
    ).toEqual([
      "2026-09-17T10:30:00.000Z",
      "2026-09-18T10:30:00.000Z",
      "2026-09-19T10:30:00.000Z",
    ]);
  });

  it("repeats weekly through an end date, inclusive, keeping the time", () => {
    expect(
      iso(
        recurringDates(start, {
          recurringFrequency: "weekly",
          endType: "on_date",
          endDate: "2026-10-01",
        }),
      ),
    ).toEqual([
      "2026-09-17T10:30:00.000Z",
      "2026-09-24T10:30:00.000Z",
      "2026-10-01T10:30:00.000Z",
    ]);
  });

  it("clamps monthly repeats to the end of short months without drifting", () => {
    expect(
      iso(
        recurringDates("2026-01-31T09:00:00.000Z", {
          recurringFrequency: "monthly",
          endAfter: 3,
        }),
      ),
    ).toEqual([
      "2026-01-31T09:00:00.000Z",
      "2026-02-28T09:00:00.000Z",
      "2026-03-31T09:00:00.000Z",
    ]);
  });

  it("repeats every N days for custom days", () => {
    expect(
      iso(
        recurringDates(start, {
          recurringFrequency: "custom",
          customFrequency: 3,
          customFrequencyUnit: "days",
          endAfter: 3,
        }),
      ),
    ).toEqual([
      "2026-09-17T10:30:00.000Z",
      "2026-09-20T10:30:00.000Z",
      "2026-09-23T10:30:00.000Z",
    ]);
  });

  it("lands custom weekly repeats on the chosen weekdays, skipping days before the start", () => {
    // Mon, Wed, Fri every week from a Thursday start: this week's Mon and Wed are past.
    expect(
      iso(
        recurringDates(start, {
          recurringFrequency: "custom",
          customFrequency: 1,
          customFrequencyUnit: "weeks",
          selectedWeekdays: [5, 1, 3],
          endAfter: 4,
        }),
      ),
    ).toEqual([
      "2026-09-18T10:30:00.000Z",
      "2026-09-21T10:30:00.000Z",
      "2026-09-23T10:30:00.000Z",
      "2026-09-25T10:30:00.000Z",
    ]);
  });

  it("treats endAfter as the total, not per weekday as Zenara does", () => {
    const dates = recurringDates(start, {
      recurringFrequency: "custom",
      customFrequencyUnit: "weeks",
      selectedWeekdays: [4, 5],
      endAfter: 5,
    });

    expect(dates).toHaveLength(5);
  });

  it("skips alternate weeks for a custom frequency of 2", () => {
    expect(
      iso(
        recurringDates(start, {
          recurringFrequency: "custom",
          customFrequency: 2,
          customFrequencyUnit: "weeks",
          selectedWeekdays: [4],
          endType: "on_date",
          endDate: "2026-10-15",
        }),
      ),
    ).toEqual([
      "2026-09-17T10:30:00.000Z",
      "2026-10-01T10:30:00.000Z",
      "2026-10-15T10:30:00.000Z",
    ]);
  });

  it("returns nothing when the end date is before the start", () => {
    expect(
      recurringDates(start, {
        recurringFrequency: "daily",
        endType: "on_date",
        endDate: "2026-09-01",
      }),
    ).toEqual([]);
  });

  it("rejects an endAfter above the cap before generating anything", () => {
    expect(() =>
      recurringDates(start, {
        recurringFrequency: "daily",
        endAfter: MAX_OCCURRENCES + 1,
      }),
    ).toThrow(RangeError);
  });

  it("rejects an end date that would exceed the cap", () => {
    expect(() =>
      recurringDates(start, {
        recurringFrequency: "daily",
        endType: "on_date",
        endDate: "2099-01-01",
      }),
    ).toThrow(RangeError);
  });

  it("rejects a custom schedule with no unit", () => {
    expect(() =>
      recurringDates(start, { recurringFrequency: "custom", endAfter: 2 }),
    ).toThrow("Unsupported recurrence");
  });
});
