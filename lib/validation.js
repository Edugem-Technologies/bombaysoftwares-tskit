"use strict";
/*
 * Validators return `false` (never throw) for non-string or malformed input,
 * so they can be used directly in form validation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAadhaar = exports.isPincode = exports.isIFSC = exports.isGSTIN = exports.isPAN = exports.isIndianMobileNumber = exports.isNumeric = exports.isHexColor = exports.isUUID = exports.isUrl = exports.isEmail = void 0;
// WHATWG HTML email grammar with two deliberate tightenings:
// - the local part is an RFC 5322 dot-atom (no leading, trailing or consecutive dots), which WHATWG allows
//   but mail providers reject;
// - the domain must contain a dot (a TLD).
const EMAIL_PATTERN = /^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
/**
 * Checks whether a string is a valid email address: WHATWG HTML grammar, except that the local part
 * may not start, end or repeat dots, and the domain must contain a dot.
 * @param {unknown} value - The value to check.
 * @example
 * isEmail("john.doe@example.com"); returns true
 * isEmail("john@localhost"); returns false
 * @returns {boolean}
 */
const isEmail = (value) => typeof value === "string" && value.length <= 254 && EMAIL_PATTERN.test(value);
exports.isEmail = isEmail;
/**
 * Checks whether a string is an absolute URL with an allowed protocol and a host.
 * @param {unknown} value - The value to check.
 * @param {IsUrlOptions} [options] - `{ protocols = ["http", "https"] }`.
 * @example
 * isUrl("https://example.com/path?q=1"); returns true
 * isUrl("javascript:alert(1)"); returns false
 * isUrl("ftp://files.example.com", { protocols: ["ftp"] }); returns true
 * @returns {boolean}
 */
const isUrl = (value, { protocols = ["http", "https"] } = {}) => {
    if (typeof value !== "string" || /\s/.test(value))
        return false;
    const scheme = /^([a-z][a-z\d+\-.]*):\/\//i.exec(value);
    if (!scheme || protocols.map((p) => p.toLowerCase()).indexOf(scheme[1].toLowerCase()) === -1)
        return false;
    try {
        return new URL(value).hostname.length > 0;
    }
    catch (error) {
        return false;
    }
};
exports.isUrl = isUrl;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Checks whether a string is an RFC 9562 UUID (versions 1–8, plus the nil and max UUIDs).
 * @param {unknown} value - The value to check.
 * @example
 * isUUID("123e4567-e89b-42d3-a456-426614174000"); returns true
 * @returns {boolean}
 */
const isUUID = (value) => typeof value === "string" &&
    (UUID_PATTERN.test(value) ||
        value === "00000000-0000-0000-0000-000000000000" ||
        value.toLowerCase() === "ffffffff-ffff-ffff-ffff-ffffffffffff");
exports.isUUID = isUUID;
/**
 * Checks whether a string is a hex colour: #RGB, #RGBA, #RRGGBB or #RRGGBBAA.
 * @param {unknown} value - The value to check.
 * @example
 * isHexColor("#1a2B3c"); returns true
 * isHexColor("1a2b3c"); returns false
 * @returns {boolean}
 */
const isHexColor = (value) => typeof value === "string" && /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
exports.isHexColor = isHexColor;
/**
 * Checks whether a value is a finite number or a string containing a decimal number
 * (optional sign, decimals and exponent; surrounding whitespace allowed). Hex, "Infinity" and "" are rejected.
 * @param {unknown} value - The value to check.
 * @example
 * isNumeric("42.5"); returns true
 * isNumeric("-1e3"); returns true
 * isNumeric("12abc"); returns false
 * @returns {boolean}
 */
const isNumeric = (value) => {
    if (typeof value === "number")
        return isFinite(value);
    return typeof value === "string" && /^\s*[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?\s*$/i.test(value);
};
exports.isNumeric = isNumeric;
/* ------------------------------------------------------------------------------------------------
 * India-specific validators
 * ---------------------------------------------------------------------------------------------- */
/**
 * Checks whether a string is an Indian mobile number: 10 digits starting with 6–9,
 * optionally prefixed with +91, 91 or 0. Spaces, dashes and parentheses are ignored.
 * @param {unknown} value - The value to check.
 * @example
 * isIndianMobileNumber("98765 43210"); returns true
 * isIndianMobileNumber("+91-9876543210"); returns true
 * isIndianMobileNumber("5876543210"); returns false
 * @returns {boolean}
 */
const isIndianMobileNumber = (value) => typeof value === "string" && /^(?:\+91|91|0)?[6-9]\d{9}$/.test(value.replace(/[\s\-()]/g, ""));
exports.isIndianMobileNumber = isIndianMobileNumber;
/**
 * Checks whether a string is a valid PAN (Permanent Account Number), e.g. "ABCPE1234F".
 * The 4th character must be a valid holder type (P, C, H, F, A, T, B, L, J or G). Case-insensitive.
 * @param {unknown} value - The value to check.
 * @example
 * isPAN("ABCPE1234F"); returns true
 * @returns {boolean}
 */
const isPAN = (value) => typeof value === "string" && /^[A-Z]{3}[PCHFATBLJG][A-Z]\d{4}[A-Z]$/.test(value.toUpperCase());
exports.isPAN = isPAN;
const GSTIN_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/**
 * Checks whether a string is a valid GSTIN (regular taxpayer format), including its check character.
 * Case-insensitive.
 * @param {unknown} value - The value to check.
 * @example
 * isGSTIN("27AAPFU0939F1ZV"); returns true
 * isGSTIN("27AAPFU0939F1ZA"); returns false (bad check character)
 * @returns {boolean}
 */
const isGSTIN = (value) => {
    if (typeof value !== "string")
        return false;
    const gstin = value.toUpperCase();
    if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin))
        return false;
    let sum = 0;
    for (let i = 0; i < 14; i++) {
        const product = GSTIN_CHARSET.indexOf(gstin[i]) * (i % 2 === 0 ? 1 : 2);
        sum += Math.floor(product / 36) + (product % 36);
    }
    return GSTIN_CHARSET[(36 - (sum % 36)) % 36] === gstin[14];
};
exports.isGSTIN = isGSTIN;
/**
 * Checks whether a string is a valid IFSC (bank branch) code: 4 letters, a 0, then 6 alphanumerics.
 * Case-insensitive.
 * @param {unknown} value - The value to check.
 * @example
 * isIFSC("SBIN0005943"); returns true
 * @returns {boolean}
 */
const isIFSC = (value) => typeof value === "string" && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase());
exports.isIFSC = isIFSC;
/**
 * Checks whether a string is a valid Indian PIN code: 6 digits not starting with 0
 * (an optional space after the third digit is allowed).
 * @param {unknown} value - The value to check.
 * @example
 * isPincode("400001"); returns true
 * isPincode("400 001"); returns true
 * @returns {boolean}
 */
const isPincode = (value) => typeof value === "string" && /^[1-9]\d{2}\s?\d{3}$/.test(value);
exports.isPincode = isPincode;
// Verhoeff checksum tables (dihedral group D5).
const VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];
const isValidVerhoeff = (digits) => {
    let checksum = 0;
    for (let i = 0; i < digits.length; i++) {
        const digit = Number(digits[digits.length - 1 - i]);
        checksum = VERHOEFF_D[checksum][VERHOEFF_P[i % 8][digit]];
    }
    return checksum === 0;
};
/**
 * Checks whether a string is a structurally valid Aadhaar number: 12 digits, not starting with 0 or 1,
 * with a valid Verhoeff check digit. Spaces and dashes are ignored ("2341 2341 2346").
 * This validates the format only; it does not confirm the number has been issued.
 * @param {unknown} value - The value to check.
 * @example
 * isAadhaar("2341 2341 2346"); returns true
 * @returns {boolean}
 */
const isAadhaar = (value) => {
    if (typeof value !== "string")
        return false;
    const digits = value.replace(/[\s-]/g, "");
    return /^[2-9]\d{11}$/.test(digits) && isValidVerhoeff(digits);
};
exports.isAadhaar = isAadhaar;
