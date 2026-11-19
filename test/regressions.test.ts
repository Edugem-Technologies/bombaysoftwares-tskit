import { expect } from "chai"
import { install, InstalledClock } from "@sinonjs/fake-timers"
import {
    formatTimestamp,
    getCurrentDate,
    getCurrentDateTime,
    handleCopyToClipboard,
    millisToMinutesAndSeconds,
} from "../src/index"

// Regression tests for bugs found in pre-existing helpers. Runs in Asia/Kolkata (see test/setup.ts).
describe("regressions in existing helpers", () => {
    describe("getCurrentDateTime / getCurrentDate", () => {
        let clock: InstalledClock

        afterEach(() => clock.uninstall())

        it("zero-pads months 10-12 correctly (previously returned e.g. '2026-011-05')", () => {
            clock = install({ now: new Date(2026, 10, 5, 9, 4, 7) })
            expect(getCurrentDateTime()).to.equal("2026-11-05 09:04:07")
        })

        it("still zero-pads single-digit months", () => {
            clock = install({ now: new Date(2026, 0, 5, 23, 59, 59) })
            expect(getCurrentDateTime()).to.equal("2026-01-05 23:59:59")
        })

        it("getCurrentDate uses the local date even when the UTC date differs", () => {
            clock = install({ now: new Date(2026, 0, 5, 0, 30) }) // 4 Jan 19:00 UTC
            expect(getCurrentDate()).to.equal("2026-01-05")
        })
    })

    describe("formatTimestamp", () => {
        it("uses the UTC year together with the other UTC parts (previously mixed in the local year)", () => {
            const timestamp = Date.UTC(2023, 11, 31, 20, 0, 0) / 1000 // already 2024 in IST
            expect(formatTimestamp(timestamp)).to.equal("31-12-2023 20:00 ")
        })
    })

    describe("millisToMinutesAndSeconds", () => {
        it("never rounds seconds up to 60 (previously returned '0:60.999')", () => {
            expect(millisToMinutesAndSeconds(59999)).to.equal("0:59.999")
            expect(millisToMinutesAndSeconds(59500)).to.equal("0:59.500")
            expect(millisToMinutesAndSeconds(119999)).to.equal("1:59.999")
        })
    })

    describe("handleCopyToClipboard", () => {
        it("resolves with an error result outside the browser instead of throwing a ReferenceError", async () => {
            expect(typeof (globalThis as { window?: unknown }).window).to.equal("undefined")
            const result = await handleCopyToClipboard("text")
            expect(result).to.deep.equal({ success: false, message: "Please host in the secure environment." })
        })
    })
})
