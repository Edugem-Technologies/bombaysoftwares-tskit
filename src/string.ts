import { randomIndex } from "./internal"

// Whitespace and ASCII punctuation separate words; everything else (including non-Latin letters) is word content.
const WORD_SEPARATOR = /[\s!-\/:-@\[-`{-~]/
const APOSTROPHES = /['’]/g

const isUpper = (char: string): boolean => char !== char.toLowerCase() && char === char.toUpperCase()
const isLower = (char: string): boolean => char !== char.toUpperCase() && char === char.toLowerCase()
const isDigit = (char: string): boolean => char >= "0" && char <= "9"

/**
 * Splits text into words on separators and case boundaries:
 * "XMLHttpRequest" → ["XML", "Http", "Request"], "user_id" → ["user", "id"], "don't stop" → ["dont", "stop"].
 */
const splitWords = (input: string): string[] => {
    if (typeof input !== "string") return []
    const chars = Array.from(input.replace(APOSTROPHES, ""))
    const words: string[] = []
    let word = ""
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i]
        if (WORD_SEPARATOR.test(char)) {
            if (word) words.push(word)
            word = ""
            continue
        }
        if (word && isUpper(char)) {
            const prev = chars[i - 1]
            const next = chars[i + 1]
            const lowerOrDigitToUpper = isLower(prev) || isDigit(prev)
            const acronymEnd = isUpper(prev) && next !== undefined && isLower(next)
            if (lowerOrDigitToUpper || acronymEnd) {
                words.push(word)
                word = ""
            }
        }
        word += char
    }
    if (word) words.push(word)
    return words
}

const capitalizeWord = (word: string): string => {
    const chars = Array.from(word)
    return chars.length ? chars[0].toUpperCase() + chars.slice(1).join("").toLowerCase() : ""
}

/**
 * Converts text to camelCase.
 * @param {string} text - The text to convert.
 * @example
 * camelCase("user_first_name"); returns "userFirstName"
 * camelCase("XMLHttpRequest"); returns "xmlHttpRequest"
 * @returns {string} - The camelCased text ("" for non-string input).
 */
export const camelCase = (text: string): string =>
    splitWords(text)
        .map((word, index) => (index === 0 ? word.toLowerCase() : capitalizeWord(word)))
        .join("")

/**
 * Converts text to PascalCase.
 * @param {string} text - The text to convert.
 * @example
 * pascalCase("user first name"); returns "UserFirstName"
 * @returns {string} - The PascalCased text ("" for non-string input).
 */
export const pascalCase = (text: string): string => splitWords(text).map(capitalizeWord).join("")

/**
 * Converts text to snake_case.
 * @param {string} text - The text to convert.
 * @example
 * snakeCase("userFirstName"); returns "user_first_name"
 * snakeCase("Hello World!"); returns "hello_world"
 * @returns {string} - The snake_cased text ("" for non-string input).
 */
export const snakeCase = (text: string): string =>
    splitWords(text)
        .map((word) => word.toLowerCase())
        .join("_")

/**
 * Converts text to kebab-case.
 * @param {string} text - The text to convert.
 * @example
 * kebabCase("userFirstName"); returns "user-first-name"
 * @returns {string} - The kebab-cased text ("" for non-string input).
 */
export const kebabCase = (text: string): string =>
    splitWords(text)
        .map((word) => word.toLowerCase())
        .join("-")

/**
 * Converts text to Title Case, splitting on separators and case boundaries.
 * @param {string} text - The text to convert.
 * @example
 * titleCase("order_status"); returns "Order Status"
 * titleCase("createdAt"); returns "Created At"
 * @returns {string} - The title-cased text ("" for non-string input).
 */
export const titleCase = (text: string): string => splitWords(text).map(capitalizeWord).join(" ")

export interface TruncateOptions {
    /** Appended to truncated text; counts towards `maxLength`. Defaults to `"..."`. */
    omission?: string
    /** Avoid cutting words in half. Defaults to `false`. */
    wordBoundary?: boolean
}

/**
 * Truncates text to at most `maxLength` characters (including the omission).
 * Counts Unicode code points, so emoji are never split in half.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - The maximum length of the result.
 * @param {TruncateOptions} [options] - `{ omission = "...", wordBoundary = false }`.
 * @example
 * truncate("The quick brown fox", 12); returns "The quick..."
 * truncate("The quick brown fox", 14, { wordBoundary: true }); returns "The quick..."
 * @returns {string} - The truncated text ("" for non-string input).
 */
export const truncate = (
    text: string,
    maxLength: number,
    { omission = "...", wordBoundary = false }: TruncateOptions = {}
): string => {
    if (typeof text !== "string") return ""
    const chars = Array.from(text)
    if (chars.length <= maxLength) return text
    const omissionChars = Array.from(omission)
    if (maxLength <= omissionChars.length) return omissionChars.slice(0, Math.max(maxLength, 0)).join("")

    const cut = maxLength - omissionChars.length
    let kept = chars.slice(0, cut).join("")
    if (wordBoundary && !/\s/.test(chars[cut])) {
        const lastSpace = kept.search(/\s\S*$/)
        if (lastSpace > 0) kept = kept.slice(0, lastSpace)
    }
    return kept.replace(/\s+$/, "") + omission
}

const SPECIAL_LATIN: Record<string, string> = {
    "ß": "ss",
    "æ": "ae",
    "Æ": "AE",
    "ø": "o",
    "Ø": "O",
    "œ": "oe",
    "Œ": "OE",
    "đ": "d",
    "Đ": "D",
    "ł": "l",
    "Ł": "L",
    "þ": "th",
    "Þ": "TH",
}

/**
 * Converts text into a URL-friendly slug. Accents are stripped ("Café" → "cafe");
 * characters outside a–z/0–9 become separators.
 * @param {string} text - The text to slugify.
 * @param {string} [separator="-"] - The word separator.
 * @example
 * slugify("  Hello, World! Café 2023 "); returns "hello-world-cafe-2023"
 * slugify("Hello World", "_"); returns "hello_world"
 * @returns {string} - The slug ("" for non-string input).
 */
export const slugify = (text: string, separator = "-"): string => {
    if (typeof text !== "string") return ""
    const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return text
        .replace(/[ßæÆøØœŒđĐłŁþÞ]/g, (char) => SPECIAL_LATIN[char])
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        // A replacer function keeps "$&", "$1" etc. in the separator literal.
        .replace(/[^a-z0-9]+/g, () => separator)
        .replace(new RegExp(`^(?:${escapedSeparator})+|(?:${escapedSeparator})+$`, "g"), "")
}

/**
 * Returns the initials of a name: the first letter of the first and last words, upper-cased.
 * Handy for avatar placeholders.
 * @param {string} name - The full name.
 * @example
 * getInitials("John Ronald Tolkien"); returns "JT"
 * getInitials("madonna"); returns "M"
 * @returns {string} - Up to two initials ("" for empty or non-string input).
 */
export const getInitials = (name: string): string => {
    if (typeof name !== "string") return ""
    const words = name.trim().split(/\s+/).filter(Boolean)
    if (!words.length) return ""
    const first = Array.from(words[0])[0]
    const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : ""
    return (first + last).toUpperCase()
}

const HTML_ESCAPES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
}

const HTML_UNESCAPES: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
}

/**
 * Escapes `&`, `<`, `>`, `"` and `'` so text can be safely inserted into HTML.
 * @param {string} text - The text to escape.
 * @example
 * escapeHtml('<a href="x">Tom & Jerry</a>'); returns "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;"
 * @returns {string} - The escaped text ("" for non-string input).
 */
export const escapeHtml = (text: string): string =>
    typeof text === "string" ? text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]) : ""

/**
 * Reverses {@link escapeHtml}.
 * @param {string} text - The text to unescape.
 * @example
 * unescapeHtml("Tom &amp; Jerry"); returns "Tom & Jerry"
 * @returns {string} - The unescaped text ("" for non-string input).
 */
export const unescapeHtml = (text: string): string =>
    typeof text === "string" ? text.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => HTML_UNESCAPES[entity]) : ""

export interface MaskOptions {
    /** Number of leading characters left visible. Defaults to `0`. */
    visibleStart?: number
    /** Number of trailing characters left visible. Defaults to `4`. */
    visibleEnd?: number
    /** The masking character. Defaults to `"*"`. */
    maskChar?: string
}

/**
 * Masks the middle of a string, e.g. for phone, card or account numbers.
 * If the string is not longer than `visibleStart + visibleEnd`, it is returned unchanged.
 * @param {string | number} value - The value to mask.
 * @param {MaskOptions} [options] - `{ visibleStart = 0, visibleEnd = 4, maskChar = "*" }`.
 * @example
 * mask("9876543210"); returns "******3210"
 * mask("4111111111111111", { visibleStart: 4, visibleEnd: 4 }); returns "4111********1111"
 * @returns {string} - The masked string.
 */
export const mask = (
    value: string | number,
    { visibleStart = 0, visibleEnd = 4, maskChar = "*" }: MaskOptions = {}
): string => {
    if (value === null || value === undefined) return ""
    const chars = Array.from(String(value))
    const start = Math.max(0, visibleStart)
    const end = Math.max(0, visibleEnd)
    if (chars.length <= start + end) return chars.join("")
    return (
        chars.slice(0, start).join("") +
        maskChar.repeat(chars.length - start - end) +
        chars.slice(chars.length - end).join("")
    )
}

/**
 * Masks the local part of an email address, keeping its first and last characters and the domain.
 * Values without an "@" are fully masked.
 * @param {string} email - The email address.
 * @param {string} [maskChar="*"] - The masking character.
 * @example
 * maskEmail("john.doe@gmail.com"); returns "j******e@gmail.com"
 * maskEmail("ab@x.com"); returns "a*@x.com"
 * @returns {string} - The masked email.
 */
export const maskEmail = (email: string, maskChar = "*"): string => {
    if (typeof email !== "string") return ""
    const at = email.lastIndexOf("@")
    if (at <= 0) return maskChar.repeat(Array.from(email).length)
    const local = Array.from(email.slice(0, at))
    const domain = email.slice(at)
    if (local.length === 1) return maskChar + domain
    if (local.length === 2) return local[0] + maskChar + domain
    return local[0] + maskChar.repeat(local.length - 2) + local[local.length - 1] + domain
}

export interface PluralizeOptions {
    /** Explicit plural form for irregular words ("person" → "people"). */
    plural?: string
    /** Prefix the result with the count ("3 items"). Defaults to `false`. */
    inclusive?: boolean
}

const defaultPlural = (word: string): string => {
    if (/(?:s|x|z|ch|sh)$/i.test(word)) return word + "es"
    if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + "ies"
    return word + "s"
}

/**
 * Returns the singular or plural form of a word for a given count, using simple English rules
 * (box → boxes, city → cities, item → items). Pass `plural` for irregular words.
 * @param {string} word - The singular form.
 * @param {number} count - The quantity.
 * @param {PluralizeOptions} [options] - `{ plural, inclusive = false }`.
 * @example
 * pluralize("item", 1); returns "item"
 * pluralize("city", 3, { inclusive: true }); returns "3 cities"
 * pluralize("person", 2, { plural: "people" }); returns "people"
 * @returns {string} - The word form, optionally prefixed with the count.
 */
export const pluralize = (word: string, count: number, { plural, inclusive = false }: PluralizeOptions = {}): string => {
    const form = Math.abs(count) === 1 ? word : plural !== undefined ? plural : defaultPlural(word)
    return inclusive ? `${count} ${form}` : form
}

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

/**
 * Generates a random string. Uses `crypto.getRandomValues` when available (browsers, Node 19+)
 * and falls back to `Math.random` otherwise — do not use it for secrets unless Web Crypto is present.
 * @param {number} [length=16] - The length of the string.
 * @param {string} [alphabet] - Characters to choose from. Defaults to A–Z, a–z, 0–9.
 * @example
 * randomString(8); returns e.g. "aZ3kQ9xB"
 * randomString(6, "0123456789"); returns e.g. "402918"
 * @returns {string} - The random string.
 */
export const randomString = (length = 16, alphabet = ALPHANUMERIC): string => {
    const chars = Array.from(alphabet)
    if (!chars.length) throw new RangeError("alphabet must not be empty")
    let result = ""
    for (let i = 0; i < length; i++) result += chars[randomIndex(chars.length)]
    return result
}
