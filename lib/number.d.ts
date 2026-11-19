/**
 * Restricts a number to the inclusive range [min, max].
 * @param {number} value - The number to clamp.
 * @param {number} min - The lower bound.
 * @param {number} max - The upper bound.
 * @example
 * clamp(150, 0, 100); returns 100
 * clamp(-5, 0, 100); returns 0
 * @returns {number} - The clamped number.
 */
export declare const clamp: (value: number, min: number, max: number) => number;
/**
 * Rounds a number to a fixed number of decimal places, avoiding floating point artefacts
 * (`roundTo(1.005, 2)` is `1.01`, whereas `Math.round(1.005 * 100) / 100` is `1`).
 * Halves are rounded away from zero, as is conventional for money.
 * @param {number} value - The number to round.
 * @param {number} [decimals=0] - The number of decimal places.
 * @example
 * roundTo(1.005, 2); returns 1.01
 * roundTo(-2.5); returns -3
 * roundTo(1234.5678, -2); returns 1200
 * @returns {number} - The rounded number.
 */
export declare const roundTo: (value: number, decimals?: number) => number;
/**
 * Returns a random integer between `min` and `max`, inclusive.
 * @param {number} min - The lower bound.
 * @param {number} max - The upper bound.
 * @example
 * randomInt(1, 6); returns e.g. 4
 * @returns {number} - The random integer.
 */
export declare const randomInt: (min: number, max: number) => number;
export interface FormatNumberOptions extends Intl.NumberFormatOptions {
    /** BCP 47 locale. Defaults to `"en-IN"` (lakh/crore grouping). */
    locale?: string;
}
/**
 * Formats a number with locale-aware grouping. Defaults to the Indian numbering system.
 * Accepts numeric strings (e.g. from API payloads). Returns "" for non-numeric input.
 * @param {number | string} value - The number to format.
 * @param {FormatNumberOptions} [options] - Any `Intl.NumberFormat` option plus `locale`.
 * @example
 * formatNumber(1234567.891); returns "12,34,567.891"
 * formatNumber(1234567.891, { locale: "en-US", maximumFractionDigits: 1 }); returns "1,234,567.9"
 * @returns {string} - The formatted number.
 */
export declare const formatNumber: (value: number | string, options?: FormatNumberOptions) => string;
export interface FormatCurrencyOptions extends FormatNumberOptions {
    /** ISO 4217 currency code. Defaults to `"INR"`. */
    currency?: string;
}
/**
 * Formats an amount as currency. Defaults to Indian Rupees with Indian grouping.
 * @param {number | string} amount - The amount to format.
 * @param {FormatCurrencyOptions} [options] - `{ currency = "INR", locale = "en-IN", ...Intl options }`.
 * @example
 * formatCurrency(1234567.5); returns "₹12,34,567.50"
 * formatCurrency(1234.5, { currency: "USD", locale: "en-US" }); returns "$1,234.50"
 * formatCurrency(999, { maximumFractionDigits: 0 }); returns "₹999"
 * @returns {string} - The formatted amount ("" for non-numeric input).
 */
export declare const formatCurrency: (amount: number | string, options?: FormatCurrencyOptions) => string;
/**
 * Formats a number in compact notation. With the default `"en-IN"` locale this uses
 * thousands, lakhs and crores ("1.2K", "1.2L", "1.2Cr"); with `"en-US"`, "1.2K", "1.2M", "1.2B".
 * @param {number | string} value - The number to format.
 * @param {FormatNumberOptions} [options] - `{ locale = "en-IN", maximumFractionDigits = 1, ... }`.
 * @example
 * formatCompactNumber(123456); returns "1.2L"
 * formatCompactNumber(12345678); returns "1.2Cr"
 * formatCompactNumber(1500000, { locale: "en-US" }); returns "1.5M"
 * @returns {string} - The formatted number ("" for non-numeric input).
 */
export declare const formatCompactNumber: (value: number | string, options?: FormatNumberOptions) => string;
export interface FormatBytesOptions {
    /** Maximum decimal places; trailing zeros are dropped. Defaults to `2`. */
    decimals?: number;
    /** 1024 (default, as shown by most operating systems) or 1000 (SI). */
    base?: 1000 | 1024;
}
/**
 * Formats a byte count as a human-readable size.
 * @param {number} bytes - The number of bytes.
 * @param {FormatBytesOptions} [options] - `{ decimals = 2, base = 1024 }`.
 * @example
 * formatBytes(1536); returns "1.5 KB"
 * formatBytes(5 * 1024 * 1024); returns "5 MB"
 * formatBytes(1500, { base: 1000 }); returns "1.5 KB"
 * @returns {string} - The formatted size ("" for non-numeric input).
 */
export declare const formatBytes: (bytes: number, { decimals, base }?: FormatBytesOptions) => string;
/**
 * Returns a number with its English ordinal suffix.
 * @param {number} value - The number.
 * @example
 * ordinal(1); returns "1st"
 * ordinal(22); returns "22nd"
 * ordinal(113); returns "113th"
 * @returns {string} - The number with its suffix.
 */
export declare const ordinal: (value: number) => string;
