export type QueryValue = string | number | boolean | Date | null | undefined | object;
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;
export interface ToQueryStringOptions {
    /**
     * How arrays are serialised:
     * - `"repeat"` (default): `tag=a&tag=b`
     * - `"brackets"`: `tag[]=a&tag[]=b`
     * - `"comma"`: `tag=a,b`
     */
    arrayFormat?: "repeat" | "brackets" | "comma";
}
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
export declare const toQueryString: (params: QueryParams, { arrayFormat }?: ToQueryStringOptions) => string;
/**
 * Parses a query string into an object. Repeated keys (and `key[]` keys) become arrays.
 * A leading `?` is ignored, `+` is decoded as a space, and malformed escape sequences are kept as-is.
 * @param {string} query - The query string, with or without a leading `?`.
 * @example
 * parseQueryString("?q=red+shoes&tag=a&tag=b"); returns { q: "red shoes", tag: ["a", "b"] }
 * @returns {Record<string, string | string[]>} - The parsed parameters.
 */
export declare const parseQueryString: (query: string) => Record<string, string | string[]>;
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
export declare const buildUrl: (url: string, params?: QueryParams, options?: ToQueryStringOptions) => string;
