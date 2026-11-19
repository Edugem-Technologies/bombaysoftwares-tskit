/**
 * Internal helpers shared across modules. Not part of the public API — do not re-export from index.ts.
 */

/**
 * Defines an own, enumerable property. Unlike `obj[key] = value`, this cannot be hijacked by keys
 * such as `"__proto__"`, which makes it safe for building objects from untrusted keys
 * (API payloads, query strings, user-provided grouping keys).
 */
export const defineOwn = (target: object, key: PropertyKey, value: unknown): void => {
    Object.defineProperty(target, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
    })
}

export const hasOwn = (target: object, key: PropertyKey): boolean =>
    Object.prototype.hasOwnProperty.call(target, key)

/** Keys that must never be copied/merged from untrusted input (prototype pollution vectors). */
export const isUnsafeKey = (key: PropertyKey): boolean =>
    key === "__proto__" || key === "constructor" || key === "prototype"

/**
 * Returns a cryptographically strong random integer in [0, max) when Web Crypto is available,
 * otherwise falls back to Math.random.
 */
export const randomIndex = (max: number): number => {
    const cryptoObj: Crypto | undefined =
        typeof globalThis !== "undefined" ? (globalThis as { crypto?: Crypto }).crypto : undefined
    if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
        // Rejection sampling removes modulo bias.
        const limit = Math.floor(0x100000000 / max) * max
        const buffer = new Uint32Array(1)
        do {
            cryptoObj.getRandomValues(buffer)
        } while (buffer[0] >= limit)
        return buffer[0] % max
    }
    return Math.floor(Math.random() * max)
}
