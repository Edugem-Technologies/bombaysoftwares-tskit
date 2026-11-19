import { defineOwn, hasOwn } from "./internal"

export type QueryValue = string | number | boolean | Date | null | undefined | object
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>

export interface ToQueryStringOptions {
    /**
     * How arrays are serialised:
     * - `"repeat"` (default): `tag=a&tag=b`
     * - `"brackets"`: `tag[]=a&tag[]=b`
     * - `"comma"`: `tag=a,b`
     */
    arrayFormat?: "repeat" | "brackets" | "comma"
}

const serializeQueryValue = (value: QueryValue): string => {
    if (value instanceof Date) return value.toISOString()
    if (typeof value === "object" && value !== null) return JSON.stringify(value)
    return String(value)
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
export const toQueryString = (params: QueryParams, { arrayFormat = "repeat" }: ToQueryStringOptions = {}): string => {
    const parts: string[] = []
    const append = (key: string, value: string) => {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }

    Object.keys(params).forEach((key) => {
        const value = params[key]
        if (value === null || value === undefined) return
        if (Array.isArray(value)) {
            const items = (value as readonly QueryValue[]).filter((item) => item !== null && item !== undefined)
            if (arrayFormat === "comma") {
                if (items.length) append(key, items.map(serializeQueryValue).join(","))
            } else {
                const name = arrayFormat === "brackets" ? `${key}[]` : key
                items.forEach((item) => append(name, serializeQueryValue(item)))
            }
            return
        }
        append(key, serializeQueryValue(value as QueryValue))
    })

    return parts.join("&")
}

const safeDecode = (value: string): string => {
    try {
        return decodeURIComponent(value.replace(/\+/g, " "))
    } catch (error) {
        return value
    }
}

/**
 * Parses a query string into an object. Repeated keys (and `key[]` keys) become arrays.
 * A leading `?` is ignored, `+` is decoded as a space, and malformed escape sequences are kept as-is.
 * @param {string} query - The query string, with or without a leading `?`.
 * @example
 * parseQueryString("?q=red+shoes&tag=a&tag=b"); returns { q: "red shoes", tag: ["a", "b"] }
 * @returns {Record<string, string | string[]>} - The parsed parameters.
 */
export const parseQueryString = (query: string): Record<string, string | string[]> => {
    const result: Record<string, string | string[]> = {}
    if (typeof query !== "string") return result

    const trimmed = query.replace(/^[?#]/, "")
    if (!trimmed) return result

    trimmed.split("&").forEach((pair) => {
        if (!pair) return
        const separatorIndex = pair.indexOf("=")
        const rawKey = separatorIndex === -1 ? pair : pair.slice(0, separatorIndex)
        const rawValue = separatorIndex === -1 ? "" : pair.slice(separatorIndex + 1)
        let key = safeDecode(rawKey)
        const value = safeDecode(rawValue)
        const forceArray = key.length > 2 && key.slice(-2) === "[]"
        if (forceArray) key = key.slice(0, -2)

        if (hasOwn(result, key)) {
            const existing = result[key]
            defineOwn(result, key, Array.isArray(existing) ? existing.concat(value) : [existing, value])
        } else {
            defineOwn(result, key, forceArray ? [value] : value)
        }
    })

    return result
}

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
export const buildUrl = (url: string, params: QueryParams = {}, options?: ToQueryStringOptions): string => {
    const query = toQueryString(params, options)
    if (!query) return url
    const hashIndex = url.indexOf("#")
    const base = hashIndex === -1 ? url : url.slice(0, hashIndex)
    const hash = hashIndex === -1 ? "" : url.slice(hashIndex)
    const separator = base.indexOf("?") === -1 ? "?" : /[?&]$/.test(base) ? "" : "&"
    return `${base}${separator}${query}${hash}`
}
