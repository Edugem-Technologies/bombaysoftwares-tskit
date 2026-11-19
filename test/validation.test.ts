import { expect } from "chai"
import {
    isAadhaar,
    isEmail,
    isGSTIN,
    isHexColor,
    isIFSC,
    isIndianMobileNumber,
    isNumeric,
    isPAN,
    isPincode,
    isUrl,
    isUUID,
} from "../src/index"

const expectAll = (fn: (value: unknown) => boolean, values: unknown[], expected: boolean) => {
    values.forEach((value) => expect(fn(value), `${fn.name}(${JSON.stringify(value)})`).to.equal(expected))
}

describe("validation helpers", () => {
    it("isEmail", () => {
        expectAll(
            isEmail,
            [
                "john.doe@example.com",
                "john.doe.smith@example.com",
                "a+tag@sub.example.co.in",
                "x_y-z@ex-ample.io",
                "UPPER@EXAMPLE.COM",
            ],
            true
        )
        expectAll(
            isEmail,
            [
                "john@localhost",
                "john@",
                "@example.com",
                "john doe@example.com",
                "john@-example.com",
                ".john@example.com",
                "john.@example.com",
                "john..doe@example.com",
                "",
                null,
                5,
            ],
            false
        )
        expect(isEmail(`${"a".repeat(250)}@x.com`)).to.be.false
    })

    it("isUrl", () => {
        expectAll(
            isUrl,
            ["https://example.com", "http://localhost:3000/path?q=1#hash", "https://sub.example.co.in/a/b"],
            true
        )
        expectAll(
            isUrl,
            ["javascript:alert(1)", "example.com", "https://", "https://exa mple.com", "ftp://files.example.com", "", null],
            false
        )
        expect(isUrl("ftp://files.example.com", { protocols: ["ftp"] })).to.be.true
        expect(isUrl("HTTPS://EXAMPLE.COM")).to.be.true
    })

    it("isUUID", () => {
        expectAll(
            isUUID,
            [
                "123e4567-e89b-42d3-a456-426614174000",
                "017F22E2-79B0-7CC3-98C4-DC0C0C07398F",
                "00000000-0000-0000-0000-000000000000",
                "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            ],
            true
        )
        expectAll(
            isUUID,
            ["123e4567-e89b-02d3-a456-426614174000", "123e4567-e89b-42d3-c456-426614174000", "not-a-uuid", "", null],
            false
        )
    })

    it("isHexColor", () => {
        expectAll(isHexColor, ["#fff", "#FFFF", "#1a2B3c", "#1a2b3c80"], true)
        expectAll(isHexColor, ["fff", "#ff", "#fffff", "#ggg", "#1a2b3c8", "", null], false)
    })

    it("isNumeric", () => {
        expectAll(isNumeric, [42, -1.5, 0, "42", " 42.5 ", "-1e3", "+.5", "5."], true)
        expectAll(isNumeric, [NaN, Infinity, "", " ", "12abc", "0x10", "Infinity", "1,000", null, undefined, []], false)
    })

    describe("India-specific", () => {
        it("isIndianMobileNumber", () => {
            expectAll(
                isIndianMobileNumber,
                ["9876543210", "98765 43210", "+91 98765 43210", "+91-9876543210", "919876543210", "09876543210", "6000000000"],
                true
            )
            expectAll(
                isIndianMobileNumber,
                ["5876543210", "987654321", "98765432100", "+1 9876543210", "abcdefghij", "", null],
                false
            )
        })

        it("isPAN", () => {
            expectAll(isPAN, ["ABCPE1234F", "abcpe1234f", "AAACR5055K"], true)
            expectAll(isPAN, ["ABCXE1234F", "ABCPE12345", "ABCP1234F", "", null], false)
        })

        it("isGSTIN validates format and check character", () => {
            expectAll(isGSTIN, ["27AAPFU0939F1ZV", "27aapfu0939f1zv"], true)
            expectAll(
                isGSTIN,
                [
                    "27AAPFU0939F1ZA", // wrong check character
                    "27AAPFU0939F1YV", // 14th character must be Z
                    "27AAPFU0939F0ZV", // entity code cannot be 0
                    "27AAPFU0939F1Z",
                    "",
                    null,
                ],
                false
            )
        })

        it("isIFSC", () => {
            expectAll(isIFSC, ["SBIN0005943", "HDFC0ABC123", "sbin0005943"], true)
            expectAll(isIFSC, ["SBIN1005943", "SBI0005943", "SBIN000594", "", null], false)
        })

        it("isPincode", () => {
            expectAll(isPincode, ["400001", "110 001", "560034"], true)
            expectAll(isPincode, ["040001", "40001", "4000011", "400-001", "", null], false)
        })

        it("isAadhaar validates format and Verhoeff checksum", () => {
            expectAll(isAadhaar, ["234123412346", "2341 2341 2346", "2341-2341-2346"], true)
            expectAll(
                isAadhaar,
                [
                    "234123412347", // bad check digit
                    "234123412364", // transposed digits
                    "123412341234", // cannot start with 1
                    "23412341234",
                    "",
                    null,
                ],
                false
            )
        })
    })
})
