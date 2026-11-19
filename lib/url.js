"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUrl = exports.parseQueryString = exports.toQueryString = void 0;
const internal_1 = require("./internal");
const serializeQueryValue = (value) => {
    if (value instanceof Date)
        return value.toISOString();
    if (typeof value === "object" && value !== null)
        return JSON.stringify(value);
    return String(value);
};
/**
 * Serialises an object into a URL query string (without the leading `?`).
 * `null` and `undefined` values are skipped, dates become ISO strings and nested objects are JSON-encoded.
 * @param {QueryParams} params - The parameters to encode.
 * @param {ToQueryStringOptions} [options] - `{ arrayFormat: "repeat" | "brackets" | "comma" }`.
 * @example
 * toQueryString({ q: "red shoes", page: 2, sort: undefined }); returns "q=red%20shoes&page=2"
 * toQueryString({ tag: ["a", "b"] }, { arrayFormat: "comma" }); returns "tag=a%2Cb"
 * @returns {string} - The encoded query string.
 */
const toQueryString = (params, { arrayFormat = "repeat" } = {}) => {
    const parts = [];
    const append = (key, value) => {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    };
    Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value === null || value === undefined)
            return;
        if (Array.isArray(value)) {
            const items = value.filter((item) => item !== null && item !== undefined);
            if (arrayFormat === "comma") {
                if (items.length)
                    append(key, items.map(serializeQueryValue).join(","));
            }
            else {
                const name = arrayFormat === "brackets" ? `${key}[]` : key;
                items.forEach((item) => append(name, serializeQueryValue(item)));
            }
            return;
        }
        append(key, serializeQueryValue(value));
    });
    return parts.join("&");
};
exports.toQueryString = toQueryString;
const safeDecode = (value) => {
    try {
        return decodeURIComponent(value.replace(/\+/g, " "));
    }
    catch (error) {
        return value;
    }
};
/**
 * Parses a query string into an object. Repeated keys (and `key[]` keys) become arrays.
 * A leading `?` is ignored, `+` is decoded as a space, and malformed escape sequences are kept as-is.
 * @param {string} query - The query string, with or without a leading `?`.
 * @example
 * parseQueryString("?q=red+shoes&tag=a&tag=b"); returns { q: "red shoes", tag: ["a", "b"] }
 * @returns {Record<string, string | string[]>} - The parsed parameters.
 */
const parseQueryString = (query) => {
    const result = {};
    if (typeof query !== "string")
        return result;
    const trimmed = query.replace(/^[?#]/, "");
    if (!trimmed)
        return result;
    trimmed.split("&").forEach((pair) => {
        if (!pair)
            return;
        const separatorIndex = pair.indexOf("=");
        const rawKey = separatorIndex === -1 ? pair : pair.slice(0, separatorIndex);
        const rawValue = separatorIndex === -1 ? "" : pair.slice(separatorIndex + 1);
        let key = safeDecode(rawKey);
        const value = safeDecode(rawValue);
        const forceArray = key.length > 2 && key.slice(-2) === "[]";
        if (forceArray)
            key = key.slice(0, -2);
        if ((0, internal_1.hasOwn)(result, key)) {
            const existing = result[key];
            (0, internal_1.defineOwn)(result, key, Array.isArray(existing) ? existing.concat(value) : [existing, value]);
        }
        else {
            (0, internal_1.defineOwn)(result, key, forceArray ? [value] : value);
        }
    });
    return result;
};
exports.parseQueryString = parseQueryString;
/**
 * Appends query parameters to a URL, preserving any existing query string and `#hash`.
 * @param {string} url - The base URL or path.
 * @param {QueryParams} [params] - The parameters to append (`null`/`undefined` values are skipped).
 * @param {ToQueryStringOptions} [options] - Passed to {@link toQueryString}.
 * @example
 * buildUrl("/api/users", { page: 2, q: "" }); returns "/api/users?page=2&q="
 * buildUrl("/search?lang=en#top", { q: "tea" }); returns "/search?lang=en&q=tea#top"
 * buildUrl("/api/users", { q: undefined }); returns "/api/users"
 * @returns {string} - The URL with the encoded parameters.
 */
const buildUrl = (url, params = {}, options) => {
    const query = (0, exports.toQueryString)(params, options);
    if (!query)
        return url;
    const hashIndex = url.indexOf("#");
    const base = hashIndex === -1 ? url : url.slice(0, hashIndex);
    const hash = hashIndex === -1 ? "" : url.slice(hashIndex);
    const separator = base.indexOf("?") === -1 ? "?" : /[?&]$/.test(base) ? "" : "&";
    return `${base}${separator}${query}${hash}`;
};
exports.buildUrl = buildUrl;
