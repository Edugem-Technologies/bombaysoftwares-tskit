"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordinal = exports.formatBytes = exports.formatCompactNumber = exports.formatCurrency = exports.formatNumber = exports.randomInt = exports.roundTo = exports.clamp = void 0;
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
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
exports.clamp = clamp;
const shiftDecimal = (value, exponent) => {
    const [mantissa, currentExponent] = String(value).split("e");
    return Number(`${mantissa}e${Number(currentExponent || 0) + exponent}`);
};
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
const roundTo = (value, decimals = 0) => {
    if (!isFinite(value))
        return value;
    const rounded = Math.round(shiftDecimal(Math.abs(value), decimals));
    return (value < 0 ? -1 : 1) * shiftDecimal(rounded, -decimals) || 0;
};
exports.roundTo = roundTo;
/**
 * Returns a random integer between `min` and `max`, inclusive.
 * @param {number} min - The lower bound.
 * @param {number} max - The upper bound.
 * @example
 * randomInt(1, 6); returns e.g. 4
 * @returns {number} - The random integer.
 */
const randomInt = (min, max) => {
    const low = Math.ceil(Math.min(min, max));
    const high = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (high - low + 1)) + low;
};
exports.randomInt = randomInt;
const toFiniteNumber = (value) => {
    if (typeof value === "number")
        return isFinite(value) ? value : null;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return isFinite(parsed) ? parsed : null;
    }
    return null;
};
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
const formatNumber = (value, options = {}) => {
    const number = toFiniteNumber(value);
    if (number === null)
        return "";
    const { locale = "en-IN" } = options, formatOptions = __rest(options, ["locale"]);
    return new Intl.NumberFormat(locale, formatOptions).format(number);
};
exports.formatNumber = formatNumber;
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
const formatCurrency = (amount, options = {}) => {
    const { currency = "INR" } = options, rest = __rest(options, ["currency"]);
    if (rest.maximumFractionDigits !== undefined && rest.minimumFractionDigits === undefined) {
        // Older engines throw when maximumFractionDigits is below the currency's minor unit (2 for INR,
        // 0 for JPY, 3 for KWD), so lower the minimum explicitly.
        const currencyDigits = new Intl.NumberFormat(rest.locale || "en-IN", {
            style: "currency",
            currency,
        }).resolvedOptions().minimumFractionDigits;
        rest.minimumFractionDigits = Math.min(rest.maximumFractionDigits, currencyDigits !== undefined ? currencyDigits : 2);
    }
    return (0, exports.formatNumber)(amount, Object.assign(Object.assign({}, rest), { style: "currency", currency }));
};
exports.formatCurrency = formatCurrency;
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
const formatCompactNumber = (value, options = {}) => (0, exports.formatNumber)(value, Object.assign(Object.assign({ maximumFractionDigits: 1 }, options), { notation: "compact" }));
exports.formatCompactNumber = formatCompactNumber;
const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
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
const formatBytes = (bytes, { decimals = 2, base = 1024 } = {}) => {
    if (typeof bytes !== "number" || !isFinite(bytes))
        return "";
    const absolute = Math.abs(bytes);
    let exponent = absolute < 1 ? 0 : Math.min(Math.floor(Math.log(absolute) / Math.log(base)), BYTE_UNITS.length - 1);
    let scaled = (0, exports.roundTo)(absolute / Math.pow(base, exponent), decimals);
    // Rounding can carry into the next unit (e.g. 1023.999 B → "1024 B"); promote it.
    if (scaled >= base && exponent < BYTE_UNITS.length - 1) {
        exponent++;
        scaled = (0, exports.roundTo)(absolute / Math.pow(base, exponent), decimals);
    }
    return `${bytes < 0 ? "-" : ""}${scaled} ${BYTE_UNITS[exponent]}`;
};
exports.formatBytes = formatBytes;
/**
 * Returns a number with its English ordinal suffix.
 * @param {number} value - The number.
 * @example
 * ordinal(1); returns "1st"
 * ordinal(22); returns "22nd"
 * ordinal(113); returns "113th"
 * @returns {string} - The number with its suffix.
 */
const ordinal = (value) => {
    const lastTwo = Math.abs(value) % 100;
    const last = lastTwo % 10;
    const suffix = lastTwo >= 11 && lastTwo <= 13 ? "th" : last === 1 ? "st" : last === 2 ? "nd" : last === 3 ? "rd" : "th";
    return `${value}${suffix}`;
};
exports.ordinal = ordinal;
