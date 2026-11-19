/**
 * Checks whether a string is a valid email address (WHATWG HTML grammar, domain must contain a dot).
 * @param {unknown} value - The value to check.
 * @example
 * isEmail("john.doe@example.com"); returns true
 * isEmail("john@localhost"); returns false
 * @returns {boolean}
 */
export declare const isEmail: (value: unknown) => boolean;
export interface IsUrlOptions {
    /** Allowed protocols, without the colon. Defaults to `["http", "https"]`. */
    protocols?: string[];
}
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
export declare const isUrl: (value: unknown, { protocols }?: IsUrlOptions) => boolean;
/**
 * Checks whether a string is an RFC 9562 UUID (versions 1–8, plus the nil and max UUIDs).
 * @param {unknown} value - The value to check.
 * @example
 * isUUID("123e4567-e89b-42d3-a456-426614174000"); returns true
 * @returns {boolean}
 */
export declare const isUUID: (value: unknown) => boolean;
/**
 * Checks whether a string is a hex colour: #RGB, #RGBA, #RRGGBB or #RRGGBBAA.
 * @param {unknown} value - The value to check.
 * @example
 * isHexColor("#1a2B3c"); returns true
 * isHexColor("1a2b3c"); returns false
 * @returns {boolean}
 */
export declare const isHexColor: (value: unknown) => boolean;
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
export declare const isNumeric: (value: unknown) => boolean;
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
export declare const isIndianMobileNumber: (value: unknown) => boolean;
/**
 * Checks whether a string is a valid PAN (Permanent Account Number), e.g. "ABCPE1234F".
 * The 4th character must be a valid holder type (P, C, H, F, A, T, B, L, J or G). Case-insensitive.
 * @param {unknown} value - The value to check.
 * @example
 * isPAN("ABCPE1234F"); returns true
 * @returns {boolean}
 */
export declare const isPAN: (value: unknown) => boolean;
/**
 * Checks whether a string is a valid GSTIN (regular taxpayer format), including its check character.
 * Case-insensitive.
 * @param {unknown} value - The value to check.
 * @example
 * isGSTIN("27AAPFU0939F1ZV"); returns true
 * isGSTIN("27AAPFU0939F1ZA"); returns false (bad check character)
 * @returns {boolean}
 */
export declare const isGSTIN: (value: unknown) => boolean;
/**
 * Checks whether a string is a valid IFSC (bank branch) code: 4 letters, a 0, then 6 alphanumerics.
 * Case-insensitive.
 * @param {unknown} value - The value to check.
 * @example
 * isIFSC("SBIN0005943"); returns true
 * @returns {boolean}
 */
export declare const isIFSC: (value: unknown) => boolean;
/**
 * Checks whether a string is a valid Indian PIN code: 6 digits not starting with 0
 * (an optional space after the third digit is allowed).
 * @param {unknown} value - The value to check.
 * @example
 * isPincode("400001"); returns true
 * isPincode("400 001"); returns true
 * @returns {boolean}
 */
export declare const isPincode: (value: unknown) => boolean;
/**
 * Checks whether a string is a structurally valid Aadhaar number: 12 digits, not starting with 0 or 1,
 * with a valid Verhoeff check digit. Spaces and dashes are ignored ("2341 2341 2346").
 * This validates the format only; it does not confirm the number has been issued.
 * @param {unknown} value - The value to check.
 * @example
 * isAadhaar("2341 2341 2346"); returns true
 * @returns {boolean}
 */
export declare const isAadhaar: (value: unknown) => boolean;
