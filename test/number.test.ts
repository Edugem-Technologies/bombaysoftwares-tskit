import { expect } from "chai"
import {
    clamp,
    formatBytes,
    formatCompactNumber,
    formatCurrency,
    formatNumber,
    ordinal,
    randomInt,
    roundTo,
} from "../src/index"

describe("number helpers", () => {
    describe("clamp", () => {
        it("restricts a value to the range", () => {
            expect(clamp(150, 0, 100)).to.equal(100)
            expect(clamp(-5, 0, 100)).to.equal(0)
            expect(clamp(50, 0, 100)).to.equal(50)
        })
    })

    describe("roundTo", () => {
        it("rounds without floating point artefacts", () => {
            expect(roundTo(1.005, 2)).to.equal(1.01)
            expect(roundTo(2.675, 2)).to.equal(2.68)
            expect(roundTo(1.0049, 2)).to.equal(1)
            expect(roundTo(123.456)).to.equal(123)
        })

        it("rounds halves away from zero", () => {
            expect(roundTo(2.5)).to.equal(3)
            expect(roundTo(-2.5)).to.equal(-3)
            expect(roundTo(-1.005, 2)).to.equal(-1.01)
        })

        it("supports negative precision and exponent notation", () => {
            expect(roundTo(1234.5678, -2)).to.equal(1200)
            expect(roundTo(1e-7, 2)).to.equal(0)
            expect(roundTo(1.23e-5, 6)).to.equal(0.000012)
        })

        it("passes through non-finite values and never returns -0", () => {
            expect(roundTo(Infinity, 2)).to.equal(Infinity)
            expect(roundTo(NaN, 2)).to.be.NaN
            expect(Object.is(roundTo(-0.001, 2), 0)).to.be.true
        })
    })

    describe("randomInt", () => {
        it("returns integers within the inclusive range", () => {
            const seen = new Set<number>()
            for (let i = 0; i < 500; i++) {
                const value = randomInt(1, 3)
                expect(Number.isInteger(value)).to.be.true
                expect(value).to.be.within(1, 3)
                seen.add(value)
            }
            expect(seen.size).to.equal(3)
        })

        it("handles swapped bounds and equal bounds", () => {
            expect(randomInt(5, 5)).to.equal(5)
            expect(randomInt(10, 8)).to.be.within(8, 10)
        })
    })

    describe("formatNumber", () => {
        it("uses Indian grouping by default", () => {
            expect(formatNumber(1234567.891)).to.equal("12,34,567.891")
            expect(formatNumber(100000)).to.equal("1,00,000")
        })

        it("accepts numeric strings and Intl options", () => {
            expect(formatNumber("1234567.891", { locale: "en-US", maximumFractionDigits: 1 })).to.equal("1,234,567.9")
            expect(formatNumber(0.5, { style: "percent" })).to.equal("50%")
        })

        it("returns an empty string for non-numeric input", () => {
            expect(formatNumber("abc")).to.equal("")
            expect(formatNumber("")).to.equal("")
            expect(formatNumber(NaN)).to.equal("")
            expect(formatNumber(null as unknown as number)).to.equal("")
        })
    })

    describe("formatCurrency", () => {
        it("formats rupees by default", () => {
            expect(formatCurrency(1234567.5)).to.equal("₹12,34,567.50")
            expect(formatCurrency("99")).to.equal("₹99.00")
        })

        it("supports other currencies and locales", () => {
            expect(formatCurrency(1234.5, { currency: "USD", locale: "en-US" })).to.equal("$1,234.50")
        })

        it("allows dropping decimals, respecting each currency's minor unit", () => {
            expect(formatCurrency(999.4, { maximumFractionDigits: 0 })).to.equal("₹999")
            expect(formatCurrency(1234.5678, { currency: "KWD", locale: "en-US", maximumFractionDigits: 1 })).to.equal(
                "KWD\u00a01,234.6" // Intl separates currency codes with a non-breaking space
            )
            expect(formatCurrency(1234.5678, { currency: "JPY", locale: "en-US", maximumFractionDigits: 2 })).to.equal(
                "¥1,234.57"
            )
        })

        it("returns an empty string for non-numeric input", () => {
            expect(formatCurrency("n/a")).to.equal("")
        })
    })

    describe("formatCompactNumber", () => {
        it("uses lakhs and crores by default", () => {
            expect(formatCompactNumber(1234)).to.equal("1.2K")
            expect(formatCompactNumber(123456)).to.equal("1.2L")
            expect(formatCompactNumber(12345678)).to.equal("1.2Cr")
            expect(formatCompactNumber(999)).to.equal("999")
        })

        it("supports other locales and precision", () => {
            expect(formatCompactNumber(1500000, { locale: "en-US" })).to.equal("1.5M")
            expect(formatCompactNumber(1234567, { locale: "en-US", maximumFractionDigits: 2 })).to.equal("1.23M")
        })
    })

    describe("formatBytes", () => {
        it("formats sizes with binary units by default", () => {
            expect(formatBytes(0)).to.equal("0 B")
            expect(formatBytes(512)).to.equal("512 B")
            expect(formatBytes(1024)).to.equal("1 KB")
            expect(formatBytes(1536)).to.equal("1.5 KB")
            expect(formatBytes(5 * 1024 * 1024)).to.equal("5 MB")
            expect(formatBytes(1.25 * 1024 ** 3)).to.equal("1.25 GB")
        })

        it("supports SI units and precision", () => {
            expect(formatBytes(1500, { base: 1000 })).to.equal("1.5 KB")
            expect(formatBytes(1000000, { base: 1000 })).to.equal("1 MB")
            expect(formatBytes(1234567, { decimals: 0 })).to.equal("1 MB")
        })

        it("promotes values that round up to the next unit", () => {
            expect(formatBytes(1023.999)).to.equal("1 KB")
            expect(formatBytes(1024 * 1024 - 1)).to.equal("1 MB")
        })

        it("handles negative and invalid input", () => {
            expect(formatBytes(-2048)).to.equal("-2 KB")
            expect(formatBytes(NaN)).to.equal("")
        })
    })

    describe("ordinal", () => {
        it("adds the correct English suffix", () => {
            const expected: Record<number, string> = {
                1: "1st",
                2: "2nd",
                3: "3rd",
                4: "4th",
                11: "11th",
                12: "12th",
                13: "13th",
                21: "21st",
                22: "22nd",
                101: "101st",
                111: "111th",
                112: "112th",
                0: "0th",
            }
            Object.keys(expected).forEach((key) => expect(ordinal(Number(key))).to.equal(expected[Number(key)]))
            expect(ordinal(-1)).to.equal("-1st")
        })
    })
})
