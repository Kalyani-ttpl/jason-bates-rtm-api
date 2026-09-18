import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { RecurringDataDto } from "./dto/task.dto";

dayjs.extend(utc);

/** Guards against a typo like "daily until 2099" creating thousands of tasks. */
export const MAX_OCCURRENCES = 366;

type Unit = "day" | "week" | "month";

const UNITS: Record<string, Unit> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  days: "day",
  weeks: "week",
  months: "month",
};

/**
 * Due dates for a recurring task, starting at `start` and keeping its time of
 * day. `endAfter` is the total number of tasks; `endType: "on_date"` runs
 * through `endDate` inclusive. Custom weekly repeats land on
 * `selectedWeekdays` (ISO, Monday = 1) every `customFrequency` weeks.
 */
export function recurringDates(start: string, rule: RecurringDataDto): Date[] {
  const custom = rule.recurringFrequency === "custom";
  const unit =
    UNITS[custom ? (rule.customFrequencyUnit ?? "") : rule.recurringFrequency];
  if (!unit) {
    throw new RangeError(`Unsupported recurrence: ${rule.recurringFrequency}`);
  }

  const until =
    rule.endType === "on_date" && rule.endDate
      ? dayjs.utc(rule.endDate).endOf("day")
      : null;
  const wanted = until ? Infinity : (rule.endAfter ?? 0);
  if (!until && wanted > MAX_OCCURRENCES) tooMany();

  const every = custom ? Math.max(rule.customFrequency ?? 1, 1) : 1;
  const first = dayjs.utc(start);
  const weekdays =
    custom && unit === "week" && rule.selectedWeekdays?.length
      ? [...new Set(rule.selectedWeekdays)].sort((a, b) => a - b)
      : [];

  const dates: Date[] = [];
  for (let step = 0; dates.length < wanted; step += 1) {
    const base = first.add(step * every, unit);
    const candidates = weekdays.length ? weekdaysOf(base, weekdays) : [base];

    // The cycle opens after the end date, so nothing later can qualify.
    if (until && candidates[0].isAfter(until)) break;

    for (const date of candidates) {
      if (date.isBefore(first) || (until && date.isAfter(until))) continue;
      dates.push(date.toDate());
      if (dates.length >= wanted) break;
    }
    if (dates.length > MAX_OCCURRENCES) tooMany();
  }

  return dates;
}

/** The chosen weekdays of `base`'s week, at `base`'s time of day. */
function weekdaysOf(base: Dayjs, weekdays: number[]): Dayjs[] {
  const monday = base.subtract((base.day() + 6) % 7, "day");
  return weekdays.map((weekday) => monday.add(weekday - 1, "day"));
}

function tooMany(): never {
  throw new RangeError(
    `Recurrence creates more than ${MAX_OCCURRENCES} tasks; shorten the range`,
  );
}
