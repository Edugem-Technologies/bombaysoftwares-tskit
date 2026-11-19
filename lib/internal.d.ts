/**
 * Internal helpers shared across modules. Not part of the public API — do not re-export from index.ts.
 */
/**
 * Defines an own, enumerable property. Unlike `obj[key] = value`, this cannot be hijacked by keys
 * such as `"__proto__"`, which makes it safe for building objects from untrusted keys
 * (API payloads, query strings, user-provided grouping keys).
 */
export declare const defineOwn: (target: object, key: PropertyKey, value: unknown) => void;
export declare const hasOwn: (target: object, key: PropertyKey) => boolean;
/** Keys that must never be copied/merged from untrusted input (prototype pollution vectors). */
export declare const isUnsafeKey: (key: PropertyKey) => boolean;
/**
 * Returns a cryptographically strong random integer in [0, max) when Web Crypto is available,
 * otherwise falls back to Math.random.
 */
export declare const randomIndex: (max: number) => number;
