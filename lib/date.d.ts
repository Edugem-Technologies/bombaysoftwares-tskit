/**
 * Anything the date helpers accept:
 * - a `Date`
 * - a `number`: a Unix timestamp in **seconds** (the convention used throughout this package)
 * - a `string`: an ISO 8601 string. Date-only strings ("2024-03-15") are parsed as local midnight.
 */
export type DateInput = Date | number | string;
export type TimeUnit = "milliseconds" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years";
export type StartOfUnit = "minute" | "hour" | "day" | "week" | "month" | "year";
/**
 * Converts any supported input into a new `Date` instance (never the same instance that was passed in).
 * Numbers are treated as Unix timestamps in **seconds**. Date-only ISO strings ("2024-03-15") are
 * parsed as local midnight rather than UTC midnight, avoiding off-by-one-day bugs.
 * Invalid input, including impossible calendar dates such as "2024-02-31" (which the native parser
 * silently rolls over to 2 March), yields an Invalid Date (check with {@link isValidDate}).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * toDate(1695193213); returns Date for 2023-09-20T07:00:13.000Z
 * toDate("2024-03-15"); returns Date for 15 Mar 2024 00:00 local time
 * @returns {Date} - A new Date instance.
 */
export declare const toDate: (input: DateInput) => Date;
/**
 * Checks whether a value is a `Date` instance holding a valid time.
 * @param {unknown} value - The value to check.
 * @example
 * isValidDate(new Date("2024-01-01")); returns true
 * isValidDate(new Date("not a date")); returns false
 * @returns {boolean}
 */
export declare const isValidDate: (value: unknown) => value is Date;
export interface FormatDateOptions {
    /**
     * IANA time zone to format in, e.g. `"Asia/Kolkata"`, `"UTC"`, `"America/New_York"`.
     * Defaults to the runtime's local time zone. An unknown zone throws a RangeError.
     */
    timeZone?: string;
}
/**
 * Formats a date using a token pattern. Text inside `[brackets]` is output literally.
 *
 * | Token | Output | Token | Output |
 * |---|---|---|---|
 * | YYYY | 2024 | HH / H | 09 / 9 (24-hour) |
 * | YY | 24 | hh / h | 09 / 9 (12-hour) |
 * | MMMM | March | mm / m | 05 / 5 |
 * | MMM | Mar | ss / s | 07 / 7 |
 * | MM / M | 03 / 3 | SSS | 042 (milliseconds) |
 * | DD / D | 05 / 5 | A / a | PM / pm |
 * | dddd / ddd | Tuesday / Tue | Z | +05:30 |
 *
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @param {string} pattern - The format pattern.
 * @param {FormatDateOptions} [options] - `{ timeZone }` to format in a specific IANA time zone.
 * @example
 * formatDate(new Date(2024, 2, 5, 14, 7), "DD-MMM-YYYY hh:mm A"); returns "05-Mar-2024 02:07 PM"
 * formatDate(1695193213, "YYYY-MM-DD HH:mm", { timeZone: "Asia/Kolkata" }); returns "2023-09-20 12:30"
 * formatDate("2024-03-05", "dddd, D MMMM [at] h a"); returns "Tuesday, 5 March at 12 am"
 * @returns {string | null} - The formatted string, or null if the input is not a valid date.
 */
export declare const formatDate: (input: DateInput, pattern: string, options?: FormatDateOptions) => string | null;
/**
 * Returns the number of days in the month of the given date (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * getDaysInMonth(new Date(2024, 1, 10)); returns 29
 * @returns {number} - 28–31, or NaN for an invalid date.
 */
export declare const getDaysInMonth: (input: DateInput) => number;
/**
 * Checks whether a year is a leap year.
 * @param {number | Date} yearOrDate - A full year (e.g. 2024) or a Date.
 * @example
 * isLeapYear(2024); returns true
 * isLeapYear(1900); returns false
 * @returns {boolean}
 */
export declare const isLeapYear: (yearOrDate: number | Date) => boolean;
/**
 * Adds (or, with a negative amount, subtracts) time to a date and returns a new Date.
 * Day/week/month/year arithmetic follows the local calendar, so it is safe across DST changes,
 * and month/year arithmetic clamps to the end of the month (31 Jan + 1 month = 29 Feb 2024).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @param {number} amount - The amount to add; fractional amounts are truncated for days and larger units.
 * @param {TimeUnit} unit - The unit of `amount`.
 * @example
 * addTime(new Date(2024, 0, 31), 1, "months"); returns 29 Feb 2024
 * addTime(new Date(), -7, "days"); returns the same time one week ago
 * @returns {Date} - A new Date.
 */
export declare const addTime: (input: DateInput, amount: number, unit: TimeUnit) => Date;
/**
 * Returns the number of **full** units between two dates (`left - right`), truncated toward zero.
 * Days, weeks, months and years are counted on the local calendar (DST-safe), so
 * `dateDiff("2024-03-01", "2024-02-01", "months")` is 1 even though February is short.
 * @param {DateInput} left - The later date (for a positive result).
 * @param {DateInput} right - The earlier date.
 * @param {TimeUnit} [unit="days"] - The unit of the result.
 * @example
 * dateDiff(new Date(2024, 0, 10), new Date(2024, 0, 1)); returns 9
 * dateDiff(new Date(2024, 0, 1), new Date(2024, 0, 10)); returns -9
 * dateDiff(new Date(2024, 5, 15), new Date(2000, 5, 16), "years"); returns 23
 * @returns {number} - The difference, or NaN if either date is invalid.
 */
export declare const dateDiff: (left: DateInput, right: DateInput, unit?: TimeUnit) => number;
export interface StartOfOptions {
    /** First day of the week for the "week" unit: 0 = Sunday … 6 = Saturday. Defaults to 1 (Monday, ISO 8601). */
    weekStartsOn?: number;
}
/**
 * Returns a new Date set to the start of the given unit (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @param {StartOfUnit} unit - "minute", "hour", "day", "week", "month" or "year".
 * @param {StartOfOptions} [options] - `{ weekStartsOn = 1 }` (Monday).
 * @example
 * startOf(new Date(2024, 2, 15, 13, 45), "day"); returns 15 Mar 2024 00:00:00.000
 * startOf(new Date(2024, 2, 15), "month"); returns 1 Mar 2024 00:00:00.000
 * @returns {Date} - The start of the unit.
 */
export declare const startOf: (input: DateInput, unit: StartOfUnit, { weekStartsOn }?: StartOfOptions) => Date;
/**
 * Returns a new Date set to the last millisecond of the given unit (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @param {StartOfUnit} unit - "minute", "hour", "day", "week", "month" or "year".
 * @param {StartOfOptions} [options] - `{ weekStartsOn = 1 }` (Monday).
 * @example
 * endOf(new Date(2024, 1, 10), "month"); returns 29 Feb 2024 23:59:59.999
 * @returns {Date} - The end of the unit.
 */
export declare const endOf: (input: DateInput, unit: StartOfUnit, options?: StartOfOptions) => Date;
/**
 * Checks whether two dates fall on the same local calendar day.
 * @param {DateInput} a - The first date.
 * @param {DateInput} b - The second date.
 * @example
 * isSameDay(new Date(2024, 0, 1, 9), new Date(2024, 0, 1, 23)); returns true
 * @returns {boolean}
 */
export declare const isSameDay: (a: DateInput, b: DateInput) => boolean;
/**
 * Checks whether a date is today (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * isToday(new Date()); returns true
 * @returns {boolean}
 */
export declare const isToday: (input: DateInput) => boolean;
/**
 * Checks whether a date was yesterday (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * isYesterday(addTime(new Date(), -1, "days")); returns true
 * @returns {boolean}
 */
export declare const isYesterday: (input: DateInput) => boolean;
/**
 * Checks whether a date is tomorrow (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * isTomorrow(addTime(new Date(), 1, "days")); returns true
 * @returns {boolean}
 */
export declare const isTomorrow: (input: DateInput) => boolean;
/**
 * Checks whether a date falls on a Saturday or Sunday (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * isWeekend(new Date(2024, 2, 16)); returns true (Saturday)
 * @returns {boolean}
 */
export declare const isWeekend: (input: DateInput) => boolean;
/**
 * Calculates age in full years from a date of birth.
 * @param {DateInput} dateOfBirth - The date of birth.
 * @param {DateInput} [asOf=new Date()] - The reference date.
 * @example
 * getAge("1990-06-15", "2024-06-14"); returns 33
 * getAge("1990-06-15", "2024-06-15"); returns 34
 * @returns {number | null} - The age, or null if a date is invalid or the birth date is after `asOf`.
 */
export declare const getAge: (dateOfBirth: DateInput, asOf?: DateInput) => number | null;
export interface RelativeTimeOptions {
    /** The reference point. Defaults to the current time. */
    now?: DateInput;
}
/**
 * Describes a date relative to now in English, e.g. "just now", "5 minutes ago", "in 3 days".
 * Uses the same rounding thresholds as moment/dayjs (45 s, 45 min, 22 h, 26 days, ~11 months).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @param {RelativeTimeOptions} [options] - `{ now }` to override the reference time.
 * @example
 * getRelativeTime(addTime(new Date(), -5, "minutes")); returns "5 minutes ago"
 * getRelativeTime(addTime(new Date(), 2, "days")); returns "in 2 days"
 * @returns {string | null} - The relative description, or null for an invalid date.
 */
export declare const getRelativeTime: (input: DateInput, { now }?: RelativeTimeOptions) => string | null;
