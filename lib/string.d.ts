/**
 * Converts text to camelCase.
 * @param {string} text - The text to convert.
 * @example
 * camelCase("user_first_name"); returns "userFirstName"
 * camelCase("XMLHttpRequest"); returns "xmlHttpRequest"
 * @returns {string} - The camelCased text ("" for non-string input).
 */
export declare const camelCase: (text: string) => string;
/**
 * Converts text to PascalCase.
 * @param {string} text - The text to convert.
 * @example
 * pascalCase("user first name"); returns "UserFirstName"
 * @returns {string} - The PascalCased text ("" for non-string input).
 */
export declare const pascalCase: (text: string) => string;
/**
 * Converts text to snake_case.
 * @param {string} text - The text to convert.
 * @example
 * snakeCase("userFirstName"); returns "user_first_name"
 * snakeCase("Hello World!"); returns "hello_world"
 * @returns {string} - The snake_cased text ("" for non-string input).
 */
export declare const snakeCase: (text: string) => string;
/**
 * Converts text to kebab-case.
 * @param {string} text - The text to convert.
 * @example
 * kebabCase("userFirstName"); returns "user-first-name"
 * @returns {string} - The kebab-cased text ("" for non-string input).
 */
export declare const kebabCase: (text: string) => string;
/**
 * Converts text to Title Case, splitting on separators and case boundaries.
 * @param {string} text - The text to convert.
 * @example
 * titleCase("order_status"); returns "Order Status"
 * titleCase("createdAt"); returns "Created At"
 * @returns {string} - The title-cased text ("" for non-string input).
 */
export declare const titleCase: (text: string) => string;
export interface TruncateOptions {
    /** Appended to truncated text; counts towards `maxLength`. Defaults to `"..."`. */
    omission?: string;
    /** Avoid cutting words in half. Defaults to `false`. */
    wordBoundary?: boolean;
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
export declare const truncate: (text: string, maxLength: number, { omission, wordBoundary }?: TruncateOptions) => string;
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
export declare const slugify: (text: string, separator?: string) => string;
/**
 * Returns the initials of a name: the first letter of the first and last words, upper-cased.
 * Handy for avatar placeholders.
 * @param {string} name - The full name.
 * @example
 * getInitials("John Ronald Tolkien"); returns "JT"
 * getInitials("madonna"); returns "M"
 * @returns {string} - Up to two initials ("" for empty or non-string input).
 */
export declare const getInitials: (name: string) => string;
/**
 * Escapes `&`, `<`, `>`, `"` and `'` so text can be safely inserted into HTML.
 * @param {string} text - The text to escape.
 * @example
 * escapeHtml('<a href="x">Tom & Jerry</a>'); returns "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;"
 * @returns {string} - The escaped text ("" for non-string input).
 */
export declare const escapeHtml: (text: string) => string;
/**
 * Reverses {@link escapeHtml}.
 * @param {string} text - The text to unescape.
 * @example
 * unescapeHtml("Tom &amp; Jerry"); returns "Tom & Jerry"
 * @returns {string} - The unescaped text ("" for non-string input).
 */
export declare const unescapeHtml: (text: string) => string;
export interface MaskOptions {
    /** Number of leading characters left visible. Defaults to `0`. */
    visibleStart?: number;
    /** Number of trailing characters left visible. Defaults to `4`. */
    visibleEnd?: number;
    /** The masking character. Defaults to `"*"`. */
    maskChar?: string;
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
export declare const mask: (value: string | number, { visibleStart, visibleEnd, maskChar }?: MaskOptions) => string;
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
export declare const maskEmail: (email: string, maskChar?: string) => string;
export interface PluralizeOptions {
    /** Explicit plural form for irregular words ("person" → "people"). */
    plural?: string;
    /** Prefix the result with the count ("3 items"). Defaults to `false`. */
    inclusive?: boolean;
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
export declare const pluralize: (word: string, count: number, { plural, inclusive }?: PluralizeOptions) => string;
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
export declare const randomString: (length?: number, alphabet?: string) => string;
