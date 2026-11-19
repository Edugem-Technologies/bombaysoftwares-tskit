import { expect } from "chai"
import { install, InstalledClock } from "@sinonjs/fake-timers"
import {
    addTime,
    dateDiff,
    endOf,
    formatDate,
    getAge,
    getDaysInMonth,
    getRelativeTime,
    isLeapYear,
    isSameDay,
    isToday,
    isTomorrow,
    isValidDate,
    isWeekend,
    isYesterday,
    startOf,
    toDate,
} from "../src/index"
import { withTimeZone } from "./helpers"

// The suite runs in Asia/Kolkata (see test/setup.ts); DST cases switch zones explicitly.
const local = (y: number, m: number, d: number, h = 0, min = 0, s = 0, ms = 0) => new Date(y, m - 1, d, h, min, s, ms)

describe("date helpers", () => {
    describe("toDate", () => {
        it("treats numbers as Unix timestamps in seconds", () => {
            expect(toDate(1695193213).toISOString()).to.equal("2023-09-20T07:00:13.000Z")
            expect(toDate(0).getTime()).to.equal(0)
        })

        it("parses date-only strings as local midnight, other ISO strings natively", () => {
            expect(toDate("2024-03-15").getTime()).to.equal(local(2024, 3, 15).getTime())
            expect(toDate("2024-03-15T10:00:00Z").toISOString()).to.equal("2024-03-15T10:00:00.000Z")
        })

        it("returns a copy of Date inputs", () => {
            const original = new Date(0)
            const copy = toDate(original)
            expect(copy).to.not.equal(original)
            expect(copy.getTime()).to.equal(0)
        })

        it("returns an Invalid Date for unparseable input", () => {
            expect(isValidDate(toDate("not a date"))).to.be.false
            expect(isValidDate(toDate(undefined as unknown as string))).to.be.false
        })

        it("rejects impossible calendar dates instead of rolling them over", () => {
            const impossible = [
                "2024-02-30",
                "2023-02-29",
                "2024-04-31",
                "2024-13-01",
                "2024-00-10",
                "2024-01-00",
                "2024-02-31T10:00:00", // the native parser would turn these into 2 Mar / 1 Mar
                "2024-02-30T00:00:00Z",
            ]
            impossible.forEach((value) => expect(isValidDate(toDate(value)), value).to.be.false)
            expect(formatDate("2024-02-31", "YYYY-MM-DD")).to.be.null
        })

        it("accepts real leap days and keeps years below 100 as-is", () => {
            expect(toDate("2024-02-29").getDate()).to.equal(29)
            expect(toDate("2024-02-29T10:00:00Z").toISOString()).to.equal("2024-02-29T10:00:00.000Z")
            expect(toDate("0099-01-01").getFullYear()).to.equal(99) // not 1999
        })
    })

    describe("isValidDate", () => {
        it("accepts only valid Date instances", () => {
            expect(isValidDate(new Date())).to.be.true
            expect(isValidDate(new Date("x"))).to.be.false
            expect(isValidDate("2024-01-01")).to.be.false
            expect(isValidDate(1700000000)).to.be.false
        })
    })

    describe("formatDate", () => {
        const date = local(2024, 3, 5, 14, 7, 9, 42) // Tuesday

        it("formats all tokens in local time", () => {
            expect(formatDate(date, "YYYY YY MMMM MMM MM M DD D dddd ddd")).to.equal(
                "2024 24 March Mar 03 3 05 5 Tuesday Tue"
            )
            expect(formatDate(date, "HH H hh h mm m ss s SSS A a Z")).to.equal("14 14 02 2 07 7 09 9 042 PM pm +05:30")
        })

        it("handles midnight and noon in 12-hour format", () => {
            expect(formatDate(local(2024, 1, 1, 0, 5), "hh:mm A")).to.equal("12:05 AM")
            expect(formatDate(local(2024, 1, 1, 12, 5), "h:mm a")).to.equal("12:05 pm")
        })

        it("outputs [bracketed] text literally", () => {
            expect(formatDate(date, "[Today is] dddd [at] h A")).to.equal("Today is Tuesday at 2 PM")
            expect(formatDate(date, "[YYYY]-YYYY")).to.equal("YYYY-2024")
        })

        it("accepts Unix seconds and ISO strings", () => {
            expect(formatDate(1695193213, "DD-MMM-YYYY HH:mm:ss")).to.equal("20-Sep-2023 12:30:13")
            expect(formatDate("2024-03-05", "DD/MM/YYYY")).to.equal("05/03/2024")
        })

        it("formats in an explicit IANA time zone", () => {
            const instant = new Date(Date.UTC(2023, 11, 31, 20, 0, 0)) // 1 Jan 2024 01:30 in IST
            expect(formatDate(instant, "YYYY-MM-DD HH:mm Z", { timeZone: "UTC" })).to.equal("2023-12-31 20:00 +00:00")
            expect(formatDate(instant, "YYYY-MM-DD HH:mm Z", { timeZone: "Asia/Kolkata" })).to.equal(
                "2024-01-01 01:30 +05:30"
            )
            expect(formatDate(instant, "ddd DD MMM HH:mm Z", { timeZone: "America/New_York" })).to.equal(
                "Sun 31 Dec 15:00 -05:00"
            )
            expect(formatDate(instant, "HH:mm Z", { timeZone: "Asia/Kathmandu" })).to.equal("01:45 +05:45")
        })

        it("reports midnight as 00 in time zone mode", () => {
            const midnightUtc = new Date(Date.UTC(2024, 0, 1, 0, 0, 0))
            expect(formatDate(midnightUtc, "HH:mm", { timeZone: "UTC" })).to.equal("00:00")
        })

        it("reflects DST offsets in time zone mode", () => {
            const summer = new Date(Date.UTC(2024, 6, 1, 12))
            expect(formatDate(summer, "HH:mm Z", { timeZone: "America/New_York" })).to.equal("08:00 -04:00")
        })

        it("computes the offset correctly for years 0-99 (Date.UTC would remap them to 19xx)", () => {
            expect(formatDate("0099-01-01T00:00:00Z", "YYYY-MM-DD HH:mm Z", { timeZone: "UTC" })).to.equal(
                "0099-01-01 00:00 +00:00"
            )
            // Etc/GMT-5 is a fixed UTC+05:00 zone (the sign is inverted by POSIX convention).
            expect(formatDate("0099-01-01T00:00:00Z", "YYYY-MM-DD HH:mm Z", { timeZone: "Etc/GMT-5" })).to.equal(
                "0099-01-01 05:00 +05:00"
            )
        })

        it("returns null for invalid dates and throws for an unknown time zone", () => {
            expect(formatDate("garbage", "YYYY")).to.be.null
            expect(() => formatDate(date, "YYYY", { timeZone: "Mars/Olympus_Mons" })).to.throw(RangeError)
        })
    })

    describe("addTime", () => {
        it("adds and subtracts each unit", () => {
            const base = local(2024, 1, 15, 10, 30)
            expect(addTime(base, 500, "milliseconds").getTime()).to.equal(base.getTime() + 500)
            expect(addTime(base, 30, "seconds").getSeconds()).to.equal(30)
            expect(addTime(base, 45, "minutes").getHours()).to.equal(11)
            expect(addTime(base, -11, "hours").getDate()).to.equal(14)
            expect(addTime(base, 20, "days").getTime()).to.equal(local(2024, 2, 4, 10, 30).getTime())
            expect(addTime(base, -2, "weeks").getTime()).to.equal(local(2024, 1, 1, 10, 30).getTime())
            expect(addTime(base, 13, "months").getTime()).to.equal(local(2025, 2, 15, 10, 30).getTime())
            expect(addTime(base, -1, "years").getTime()).to.equal(local(2023, 1, 15, 10, 30).getTime())
        })

        it("clamps to the end of the month", () => {
            expect(addTime(local(2024, 1, 31), 1, "months").getTime()).to.equal(local(2024, 2, 29).getTime())
            expect(addTime(local(2023, 1, 31), 1, "months").getTime()).to.equal(local(2023, 2, 28).getTime())
            expect(addTime(local(2024, 3, 31), -1, "months").getTime()).to.equal(local(2024, 2, 29).getTime())
            expect(addTime(local(2024, 2, 29), 1, "years").getTime()).to.equal(local(2025, 2, 28).getTime())
        })

        it("does not mutate the input", () => {
            const base = local(2024, 1, 1)
            addTime(base, 5, "days")
            expect(base.getTime()).to.equal(local(2024, 1, 1).getTime())
        })

        it("keeps wall-clock time across DST for calendar units", () => {
            withTimeZone("America/New_York", () => {
                // DST starts 10 Mar 2024 at 02:00 (clocks jump to 03:00).
                const before = new Date(2024, 2, 9, 12, 0)
                const nextDay = addTime(before, 1, "days")
                expect(nextDay.getDate()).to.equal(10)
                expect(nextDay.getHours()).to.equal(12)
                // Whereas 24 hours later is 13:00 local time.
                expect(addTime(before, 24, "hours").getHours()).to.equal(13)
            })
        })

        it("throws for an unknown unit", () => {
            expect(() => addTime(new Date(), 1, "fortnights" as never)).to.throw(RangeError)
        })
    })

    describe("dateDiff", () => {
        it("counts full days by default, truncating toward zero", () => {
            expect(dateDiff(local(2024, 1, 10), local(2024, 1, 1))).to.equal(9)
            expect(dateDiff(local(2024, 1, 1), local(2024, 1, 10))).to.equal(-9)
            expect(dateDiff(local(2024, 1, 2, 9), local(2024, 1, 1, 10))).to.equal(0)
            expect(dateDiff(local(2024, 1, 1, 10), local(2024, 1, 2, 9))).to.equal(0)
            expect(Object.is(dateDiff(local(2024, 1, 1), local(2024, 1, 1, 5), "hours"), -5)).to.be.true
        })

        it("supports time units", () => {
            const a = local(2024, 1, 1, 12, 0, 0)
            const b = local(2024, 1, 1, 10, 29, 30)
            expect(dateDiff(a, b, "milliseconds")).to.equal(5430000)
            expect(dateDiff(a, b, "seconds")).to.equal(5430)
            expect(dateDiff(a, b, "minutes")).to.equal(90)
            expect(dateDiff(a, b, "hours")).to.equal(1)
            expect(Object.is(dateDiff(b, a, "hours"), -1)).to.be.true
            expect(Object.is(dateDiff(a, local(2024, 1, 1, 11, 30), "hours"), 0)).to.be.true
        })

        it("counts full weeks, months and years on the calendar", () => {
            expect(dateDiff(local(2024, 1, 22), local(2024, 1, 1), "weeks")).to.equal(3)
            expect(dateDiff(local(2024, 3, 1), local(2024, 2, 1), "months")).to.equal(1)
            expect(dateDiff(local(2024, 2, 29), local(2024, 1, 31), "months")).to.equal(1)
            expect(dateDiff(local(2024, 3, 14), local(2024, 2, 15), "months")).to.equal(0)
            expect(dateDiff(local(2024, 6, 15), local(2000, 6, 16), "years")).to.equal(23)
            expect(dateDiff(local(2000, 6, 16), local(2024, 6, 15), "years")).to.equal(-23)
        })

        it("counts calendar days correctly across DST", () => {
            withTimeZone("America/New_York", () => {
                // Clocks jump forward at 02:00 on 10 Mar, so 10 Mar 00:00 → 11 Mar 00:00 is only
                // 23 hours (a naive ms / 86_400_000 would say 0 days) but it is one full calendar day.
                expect(dateDiff(new Date(2024, 2, 11), new Date(2024, 2, 10), "hours")).to.equal(23)
                expect(dateDiff(new Date(2024, 2, 11), new Date(2024, 2, 10), "days")).to.equal(1)
                expect(dateDiff(new Date(2024, 2, 10), new Date(2024, 2, 11), "days")).to.equal(-1)
                // Fall back (3 Nov): a 25-hour day is still exactly one day.
                expect(dateDiff(new Date(2024, 10, 4), new Date(2024, 10, 3), "hours")).to.equal(25)
                expect(dateDiff(new Date(2024, 10, 4), new Date(2024, 10, 3), "days")).to.equal(1)
            })
        })

        it("returns NaN for invalid dates", () => {
            expect(dateDiff("nope", new Date())).to.be.NaN
        })

        it("counts days correctly for years 0-99", () => {
            expect(dateDiff("0100-01-01", "0099-12-31", "days")).to.equal(1)
            expect(dateDiff("0099-03-01", "0099-02-01", "days")).to.equal(28)
            expect(dateDiff("0000-03-01", "0000-02-01", "days")).to.equal(29) // year 0 is a leap year
        })
    })

    describe("startOf / endOf", () => {
        const date = local(2024, 2, 15, 13, 45, 30, 500) // Thursday

        it("returns the start of each unit", () => {
            expect(startOf(date, "minute").getTime()).to.equal(local(2024, 2, 15, 13, 45).getTime())
            expect(startOf(date, "hour").getTime()).to.equal(local(2024, 2, 15, 13).getTime())
            expect(startOf(date, "day").getTime()).to.equal(local(2024, 2, 15).getTime())
            expect(startOf(date, "week").getTime()).to.equal(local(2024, 2, 12).getTime()) // Monday
            expect(startOf(date, "week", { weekStartsOn: 0 }).getTime()).to.equal(local(2024, 2, 11).getTime())
            expect(startOf(date, "month").getTime()).to.equal(local(2024, 2, 1).getTime())
            expect(startOf(date, "year").getTime()).to.equal(local(2024, 1, 1).getTime())
        })

        it("returns the last millisecond of each unit", () => {
            expect(endOf(date, "day").getTime()).to.equal(local(2024, 2, 15, 23, 59, 59, 999).getTime())
            expect(endOf(date, "week").getTime()).to.equal(local(2024, 2, 18, 23, 59, 59, 999).getTime())
            expect(endOf(date, "month").getTime()).to.equal(local(2024, 2, 29, 23, 59, 59, 999).getTime())
            expect(endOf(date, "year").getTime()).to.equal(local(2024, 12, 31, 23, 59, 59, 999).getTime())
            expect(endOf(date, "hour").getTime()).to.equal(local(2024, 2, 15, 13, 59, 59, 999).getTime())
        })

        it("handles a week that starts on the given date", () => {
            const monday = local(2024, 2, 12, 8)
            expect(startOf(monday, "week").getTime()).to.equal(local(2024, 2, 12).getTime())
        })

        it("does not mutate the input", () => {
            const input = local(2024, 2, 15, 13)
            startOf(input, "day")
            endOf(input, "month")
            expect(input.getTime()).to.equal(local(2024, 2, 15, 13).getTime())
        })
    })

    describe("calendar predicates", () => {
        let clock: InstalledClock

        beforeEach(() => {
            clock = install({ now: local(2024, 3, 15, 10, 0) }) // Friday
        })

        afterEach(() => {
            clock.uninstall()
        })

        it("isSameDay compares local calendar days", () => {
            expect(isSameDay(local(2024, 1, 1, 0, 0), local(2024, 1, 1, 23, 59))).to.be.true
            expect(isSameDay(local(2024, 1, 1, 23, 59), local(2024, 1, 2, 0, 0))).to.be.false
            expect(isSameDay("bad", "bad")).to.be.false
        })

        it("isToday / isYesterday / isTomorrow", () => {
            expect(isToday(local(2024, 3, 15, 23, 59))).to.be.true
            expect(isToday(local(2024, 3, 14, 23, 59))).to.be.false
            expect(isYesterday(local(2024, 3, 14, 0, 0))).to.be.true
            expect(isYesterday(local(2024, 3, 15))).to.be.false
            expect(isTomorrow(local(2024, 3, 16, 12))).to.be.true
            expect(isTomorrow(local(2024, 3, 17))).to.be.false
            expect(isToday(Math.floor(Date.now() / 1000))).to.be.true
        })

        it("isWeekend", () => {
            expect(isWeekend(local(2024, 3, 16))).to.be.true // Saturday
            expect(isWeekend(local(2024, 3, 17))).to.be.true // Sunday
            expect(isWeekend(local(2024, 3, 15))).to.be.false // Friday
            expect(isWeekend("bad")).to.be.false
        })

        it("getAge defaults to the current date", () => {
            expect(getAge("1990-03-15")).to.equal(34)
            expect(getAge("1990-03-16")).to.equal(33)
        })
    })

    describe("getDaysInMonth / isLeapYear", () => {
        it("returns days in the month", () => {
            expect(getDaysInMonth(local(2024, 2, 10))).to.equal(29)
            expect(getDaysInMonth(local(2023, 2, 10))).to.equal(28)
            expect(getDaysInMonth(local(2024, 4, 30))).to.equal(30)
            expect(getDaysInMonth(local(2024, 12, 1))).to.equal(31)
            expect(getDaysInMonth("bad")).to.be.NaN
        })

        it("handles years 0-99 without remapping them to 19xx", () => {
            expect(getDaysInMonth("0000-02-10")).to.equal(29) // year 0 is leap; 1900 is not
            expect(getDaysInMonth("0099-02-10")).to.equal(28)
        })

        it("detects leap years from a year or a date", () => {
            expect(isLeapYear(2024)).to.be.true
            expect(isLeapYear(2000)).to.be.true
            expect(isLeapYear(1900)).to.be.false
            expect(isLeapYear(2023)).to.be.false
            expect(isLeapYear(local(2024, 6, 1))).to.be.true
        })
    })

    describe("getAge", () => {
        it("counts full years", () => {
            expect(getAge("1990-06-15", "2024-06-14")).to.equal(33)
            expect(getAge("1990-06-15", "2024-06-15")).to.equal(34)
            expect(getAge(local(2000, 2, 29), local(2023, 2, 28))).to.equal(23)
        })

        it("returns null for invalid or future birth dates", () => {
            expect(getAge("garbage")).to.be.null
            expect(getAge("2030-01-01", "2024-01-01")).to.be.null
        })
    })

    describe("getRelativeTime", () => {
        const now = local(2024, 6, 15, 12, 0, 0)
        const relative = (amount: number, unit: Parameters<typeof addTime>[2]) =>
            getRelativeTime(addTime(now, amount, unit), { now })

        it("describes the past", () => {
            expect(relative(-10, "seconds")).to.equal("just now")
            expect(relative(-50, "seconds")).to.equal("1 minute ago")
            expect(relative(-5, "minutes")).to.equal("5 minutes ago")
            expect(relative(-50, "minutes")).to.equal("1 hour ago")
            expect(relative(-3, "hours")).to.equal("3 hours ago")
            expect(relative(-23, "hours")).to.equal("1 day ago")
            expect(relative(-3, "days")).to.equal("3 days ago")
            expect(relative(-27, "days")).to.equal("1 month ago")
            expect(relative(-4, "months")).to.equal("4 months ago")
            expect(relative(-11, "months")).to.equal("1 year ago")
            expect(relative(-3, "years")).to.equal("3 years ago")
        })

        it("describes the future", () => {
            expect(relative(10, "seconds")).to.equal("just now")
            expect(relative(5, "minutes")).to.equal("in 5 minutes")
            expect(relative(2, "days")).to.equal("in 2 days")
            expect(relative(1, "years")).to.equal("in 1 year")
        })

        it("accepts Unix seconds and defaults `now` to the current time", () => {
            const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300
            expect(getRelativeTime(fiveMinutesAgo)).to.equal("5 minutes ago")
        })

        it("returns null for invalid dates", () => {
            expect(getRelativeTime("nope")).to.be.null
        })
    })
})
