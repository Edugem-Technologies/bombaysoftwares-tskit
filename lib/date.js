"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelativeTime = exports.getAge = exports.isWeekend = exports.isTomorrow = exports.isYesterday = exports.isToday = exports.isSameDay = exports.endOf = exports.startOf = exports.dateDiff = exports.addTime = exports.isLeapYear = exports.getDaysInMonth = exports.formatDate = exports.isValidDate = exports.toDate = void 0;
const constants_1 = require("./constants");
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const isLeap = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
/**
 * Year-safe `Date.UTC`: `Date.UTC` and `new Date(y, m, d)` remap years 0-99 to 1900-1999,
 * whereas `setUTCFullYear` takes the year literally.
 */
const utcTime = (year, month, day, hour = 0, minute = 0, second = 0, ms = 0) => {
    const date = new Date(0);
    date.setUTCFullYear(year, month, day);
    date.setUTCHours(hour, minute, second, ms);
    return date.getTime();
};
/** Whether the year / month (1-12) / day exists on the calendar, e.g. rejects 2023-02-29 and 2024-04-31. */
const isRealCalendarDate = (year, month, day) => {
    if (month < 1 || month > 12 || day < 1)
        return false;
    return day <= (month === 2 && isLeap(year) ? 29 : DAYS_IN_MONTH[month - 1]);
};
const pad = (value, length = 2) => {
    const sign = value < 0 ? "-" : "";
    let digits = String(Math.abs(value));
    while (digits.length < length)
        digits = "0" + digits;
    return sign + digits;
};
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
const toDate = (input) => {
    if (input instanceof Date)
        return new Date(input.getTime());
    if (typeof input === "number")
        return new Date(input * MS_PER_SECOND);
    if (typeof input === "string") {
        const value = input.trim();
        const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?=$|[T\s])/.exec(value);
        if (isoDate) {
            const year = Number(isoDate[1]);
            const month = Number(isoDate[2]);
            const day = Number(isoDate[3]);
            if (!isRealCalendarDate(year, month, day))
                return new Date(NaN);
            if (value.length === 10) {
                // Date-only: local midnight. setFullYear keeps years below 100 as-is
                // (new Date(99, 0, 1) would be 1999).
                const date = new Date(0);
                date.setFullYear(year, month - 1, day);
                date.setHours(0, 0, 0, 0);
                return date;
            }
        }
        return new Date(value);
    }
    return new Date(NaN);
};
exports.toDate = toDate;
/**
 * Checks whether a value is a `Date` instance holding a valid time.
 * @param {unknown} value - The value to check.
 * @example
 * isValidDate(new Date("2024-01-01")); returns true
 * isValidDate(new Date("not a date")); returns false
 * @returns {boolean}
 */
const isValidDate = (value) => value instanceof Date && !isNaN(value.getTime());
exports.isValidDate = isValidDate;
const formatterCache = new Map();
const getZonedFormatter = (timeZone) => {
    let formatter = formatterCache.get(timeZone);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat("en-US", {
            timeZone,
            hourCycle: "h23",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            weekday: "short",
        });
        formatterCache.set(timeZone, formatter);
    }
    return formatter;
};
const getDateParts = (date, timeZone) => {
    if (!timeZone) {
        return {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate(),
            weekday: date.getDay(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
            millisecond: date.getMilliseconds(),
            offsetMinutes: -date.getTimezoneOffset(),
        };
    }
    const values = {};
    getZonedFormatter(timeZone)
        .formatToParts(date)
        .forEach((part) => {
        values[part.type] = part.value;
    });
    const parts = {
        year: Number(values.year),
        month: Number(values.month) - 1,
        day: Number(values.day),
        weekday: constants_1.WEEKDAY_SHORT.indexOf(values.weekday),
        hour: Number(values.hour) % 24, // some engines report midnight as "24"
        minute: Number(values.minute),
        second: Number(values.second),
        millisecond: date.getUTCMilliseconds(),
        offsetMinutes: 0,
    };
    const asUtc = utcTime(parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond);
    parts.offsetMinutes = Math.round((asUtc - date.getTime()) / MS_PER_MINUTE);
    return parts;
};
const formatOffset = (offsetMinutes) => {
    const sign = offsetMinutes < 0 ? "-" : "+";
    const absolute = Math.abs(offsetMinutes);
    return `${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
};
const FORMAT_TOKENS = /\[([^\]]*)]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|SSS|A|a|Z/g;
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
const formatDate = (input, pattern, options = {}) => {
    const date = (0, exports.toDate)(input);
    if (!(0, exports.isValidDate)(date))
        return null;
    const p = getDateParts(date, options.timeZone);
    const hour12 = p.hour % 12 || 12;
    return pattern.replace(FORMAT_TOKENS, (token, literal) => {
        if (literal !== undefined)
            return literal;
        switch (token) {
            case "YYYY":
                return pad(p.year, 4);
            case "YY":
                return pad(p.year % 100);
            case "MMMM":
                return constants_1.MONTH_FULL[p.month];
            case "MMM":
                return constants_1.MONTH[p.month];
            case "MM":
                return pad(p.month + 1);
            case "M":
                return String(p.month + 1);
            case "DD":
                return pad(p.day);
            case "D":
                return String(p.day);
            case "dddd":
                return constants_1.WEEKDAY[p.weekday];
            case "ddd":
                return constants_1.WEEKDAY_SHORT[p.weekday];
            case "HH":
                return pad(p.hour);
            case "H":
                return String(p.hour);
            case "hh":
                return pad(hour12);
            case "h":
                return String(hour12);
            case "mm":
                return pad(p.minute);
            case "m":
                return String(p.minute);
            case "ss":
                return pad(p.second);
            case "s":
                return String(p.second);
            case "SSS":
                return pad(p.millisecond, 3);
            case "A":
                return p.hour < 12 ? "AM" : "PM";
            case "a":
                return p.hour < 12 ? "am" : "pm";
            case "Z":
                return formatOffset(p.offsetMinutes);
            default:
                return token;
        }
    });
};
exports.formatDate = formatDate;
/**
 * Returns the number of days in the month of the given date (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * getDaysInMonth(new Date(2024, 1, 10)); returns 29
 * @returns {number} - 28–31, or NaN for an invalid date.
 */
const getDaysInMonth = (input) => {
    const date = (0, exports.toDate)(input);
    if (!(0, exports.isValidDate)(date))
        return NaN;
    const month = date.getMonth();
    return month === 1 && isLeap(date.getFullYear()) ? 29 : DAYS_IN_MONTH[month];
};
exports.getDaysInMonth = getDaysInMonth;
/**
 * Checks whether a year is a leap year.
 * @param {number | Date} yearOrDate - A full year (e.g. 2024) or a Date.
 * @example
 * isLeapYear(2024); returns true
 * isLeapYear(1900); returns false
 * @returns {boolean}
 */
const isLeapYear = (yearOrDate) => {
    return isLeap(yearOrDate instanceof Date ? yearOrDate.getFullYear() : yearOrDate);
};
exports.isLeapYear = isLeapYear;
const addMonths = (date, months) => {
    const result = new Date(date.getTime());
    const day = result.getDate();
    result.setDate(1);
    result.setMonth(result.getMonth() + months);
    // Clamp to the end of the target month: 31 Jan + 1 month = 28/29 Feb.
    result.setDate(Math.min(day, (0, exports.getDaysInMonth)(result)));
    return result;
};
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
const addTime = (input, amount, unit) => {
    const date = (0, exports.toDate)(input);
    switch (unit) {
        case "milliseconds":
            return new Date(date.getTime() + amount);
        case "seconds":
            return new Date(date.getTime() + amount * MS_PER_SECOND);
        case "minutes":
            return new Date(date.getTime() + amount * MS_PER_MINUTE);
        case "hours":
            return new Date(date.getTime() + amount * MS_PER_HOUR);
        case "days":
            date.setDate(date.getDate() + Math.trunc(amount));
            return date;
        case "weeks":
            date.setDate(date.getDate() + Math.trunc(amount) * 7);
            return date;
        case "months":
            return addMonths(date, Math.trunc(amount));
        case "years":
            return addMonths(date, Math.trunc(amount) * 12);
        default:
            throw new RangeError(`Unsupported unit: ${unit}`);
    }
};
exports.addTime = addTime;
const calendarDifference = (left, right, unit) => {
    if (unit === "days") {
        const leftDay = utcTime(left.getFullYear(), left.getMonth(), left.getDate());
        const rightDay = utcTime(right.getFullYear(), right.getMonth(), right.getDate());
        return Math.round((leftDay - rightDay) / MS_PER_DAY);
    }
    const months = (left.getFullYear() - right.getFullYear()) * 12 + (left.getMonth() - right.getMonth());
    return unit === "months" ? months : left.getFullYear() - right.getFullYear();
};
const fullCalendarUnits = (left, right, unit) => {
    let result = calendarDifference(left, right, unit);
    if (result === 0)
        return 0;
    // Drop the last unit if it is not complete yet (e.g. 1 Jan 10:00 → 2 Jan 09:00 is 0 full days).
    const shifted = (0, exports.addTime)(right, result, unit).getTime();
    if (result > 0 && shifted > left.getTime())
        result--;
    else if (result < 0 && shifted < left.getTime())
        result++;
    return result;
};
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
const dateDiff = (left, right, unit = "days") => {
    const a = (0, exports.toDate)(left);
    const b = (0, exports.toDate)(right);
    if (!(0, exports.isValidDate)(a) || !(0, exports.isValidDate)(b))
        return NaN;
    const ms = a.getTime() - b.getTime();
    const truncate = (value) => Math.trunc(value) || 0; // avoid -0
    switch (unit) {
        case "milliseconds":
            return ms;
        case "seconds":
            return truncate(ms / MS_PER_SECOND);
        case "minutes":
            return truncate(ms / MS_PER_MINUTE);
        case "hours":
            return truncate(ms / MS_PER_HOUR);
        case "days":
            return fullCalendarUnits(a, b, "days");
        case "weeks":
            return truncate(fullCalendarUnits(a, b, "days") / 7);
        case "months":
            return fullCalendarUnits(a, b, "months");
        case "years":
            return fullCalendarUnits(a, b, "years");
        default:
            throw new RangeError(`Unsupported unit: ${unit}`);
    }
};
exports.dateDiff = dateDiff;
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
const startOf = (input, unit, { weekStartsOn = 1 } = {}) => {
    const date = (0, exports.toDate)(input);
    switch (unit) {
        case "year":
            date.setMonth(0, 1);
            date.setHours(0, 0, 0, 0);
            return date;
        case "month":
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            return date;
        case "week": {
            const offset = (date.getDay() - weekStartsOn + 7) % 7;
            date.setDate(date.getDate() - offset);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        case "day":
            date.setHours(0, 0, 0, 0);
            return date;
        case "hour":
            date.setMinutes(0, 0, 0);
            return date;
        case "minute":
            date.setSeconds(0, 0);
            return date;
        default:
            throw new RangeError(`Unsupported unit: ${unit}`);
    }
};
exports.startOf = startOf;
const NEXT_UNIT = {
    minute: [1, "minutes"],
    hour: [1, "hours"],
    day: [1, "days"],
    week: [1, "weeks"],
    month: [1, "months"],
    year: [1, "years"],
};
/**
 * Returns a new Date set to the last millisecond of the given unit (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @param {StartOfUnit} unit - "minute", "hour", "day", "week", "month" or "year".
 * @param {StartOfOptions} [options] - `{ weekStartsOn = 1 }` (Monday).
 * @example
 * endOf(new Date(2024, 1, 10), "month"); returns 29 Feb 2024 23:59:59.999
 * @returns {Date} - The end of the unit.
 */
const endOf = (input, unit, options = {}) => {
    const next = NEXT_UNIT[unit];
    if (!next)
        throw new RangeError(`Unsupported unit: ${unit}`);
    const nextStart = (0, exports.addTime)((0, exports.startOf)(input, unit, options), next[0], next[1]);
    return new Date(nextStart.getTime() - 1);
};
exports.endOf = endOf;
/**
 * Checks whether two dates fall on the same local calendar day.
 * @param {DateInput} a - The first date.
 * @param {DateInput} b - The second date.
 * @example
 * isSameDay(new Date(2024, 0, 1, 9), new Date(2024, 0, 1, 23)); returns true
 * @returns {boolean}
 */
const isSameDay = (a, b) => {
    const left = (0, exports.toDate)(a);
    const right = (0, exports.toDate)(b);
    return ((0, exports.isValidDate)(left) &&
        (0, exports.isValidDate)(right) &&
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate());
};
exports.isSameDay = isSameDay;
/**
 * Checks whether a date is today (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * isToday(new Date()); returns true
 * @returns {boolean}
 */
const isToday = (input) => (0, exports.isSameDay)(input, new Date());
exports.isToday = isToday;
/**
 * Checks whether a date was yesterday (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * isYesterday(addTime(new Date(), -1, "days")); returns true
 * @returns {boolean}
 */
const isYesterday = (input) => (0, exports.isSameDay)(input, (0, exports.addTime)(new Date(), -1, "days"));
exports.isYesterday = isYesterday;
/**
 * Checks whether a date is tomorrow (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * isTomorrow(addTime(new Date(), 1, "days")); returns true
 * @returns {boolean}
 */
const isTomorrow = (input) => (0, exports.isSameDay)(input, (0, exports.addTime)(new Date(), 1, "days"));
exports.isTomorrow = isTomorrow;
/**
 * Checks whether a date falls on a Saturday or Sunday (local time).
 * @param {DateInput} input - A Date, Unix timestamp in seconds, or ISO string.
 * @example
 * isWeekend(new Date(2024, 2, 16)); returns true (Saturday)
 * @returns {boolean}
 */
const isWeekend = (input) => {
    const date = (0, exports.toDate)(input);
    if (!(0, exports.isValidDate)(date))
        return false;
    const day = date.getDay();
    return day === 0 || day === 6;
};
exports.isWeekend = isWeekend;
/**
 * Calculates age in full years from a date of birth.
 * @param {DateInput} dateOfBirth - The date of birth.
 * @param {DateInput} [asOf=new Date()] - The reference date.
 * @example
 * getAge("1990-06-15", "2024-06-14"); returns 33
 * getAge("1990-06-15", "2024-06-15"); returns 34
 * @returns {number | null} - The age, or null if a date is invalid or the birth date is after `asOf`.
 */
const getAge = (dateOfBirth, asOf = new Date()) => {
    const years = (0, exports.dateDiff)(asOf, dateOfBirth, "years");
    if (isNaN(years))
        return null;
    return (0, exports.toDate)(dateOfBirth).getTime() > (0, exports.toDate)(asOf).getTime() ? null : years;
};
exports.getAge = getAge;
const RELATIVE_UNITS = [
    // [unit, seconds per unit, use this unit while |diff| is below this many seconds]
    ["minute", 60, 45 * 60],
    ["hour", 60 * 60, 22 * 60 * 60],
    ["day", 24 * 60 * 60, 26 * 24 * 60 * 60],
    ["month", 30.4375 * 24 * 60 * 60, 320 * 24 * 60 * 60],
    ["year", 365.25 * 24 * 60 * 60, Infinity],
];
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
const getRelativeTime = (input, { now = new Date() } = {}) => {
    const date = (0, exports.toDate)(input);
    const reference = (0, exports.toDate)(now);
    if (!(0, exports.isValidDate)(date) || !(0, exports.isValidDate)(reference))
        return null;
    const diffSeconds = (date.getTime() - reference.getTime()) / MS_PER_SECOND;
    const absolute = Math.abs(diffSeconds);
    if (absolute < 45)
        return "just now";
    for (const [unit, secondsPerUnit, limit] of RELATIVE_UNITS) {
        if (absolute < limit) {
            const value = Math.max(1, Math.round(absolute / secondsPerUnit));
            const label = `${value} ${unit}${value === 1 ? "" : "s"}`;
            return diffSeconds < 0 ? `${label} ago` : `in ${label}`;
        }
    }
    return null; // unreachable: the last unit has an Infinity limit
};
exports.getRelativeTime = getRelativeTime;
