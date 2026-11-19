"use strict";
/**
 * Internal helpers shared across modules. Not part of the public API — do not re-export from index.ts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomIndex = exports.isUnsafeKey = exports.hasOwn = exports.defineOwn = void 0;
/**
 * Defines an own, enumerable property. Unlike `obj[key] = value`, this cannot be hijacked by keys
 * such as `"__proto__"`, which makes it safe for building objects from untrusted keys
 * (API payloads, query strings, user-provided grouping keys).
 */
const defineOwn = (target, key, value) => {
    Object.defineProperty(target, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
    });
};
exports.defineOwn = defineOwn;
const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);
exports.hasOwn = hasOwn;
/** Keys that must never be copied/merged from untrusted input (prototype pollution vectors). */
const isUnsafeKey = (key) => key === "__proto__" || key === "constructor" || key === "prototype";
exports.isUnsafeKey = isUnsafeKey;
/**
 * Returns a cryptographically strong random integer in [0, max) when Web Crypto is available,
 * otherwise falls back to Math.random.
 */
const randomIndex = (max) => {
    const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
    if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
        // Rejection sampling removes modulo bias.
        const limit = Math.floor(0x100000000 / max) * max;
        const buffer = new Uint32Array(1);
        do {
            cryptoObj.getRandomValues(buffer);
        } while (buffer[0] >= limit);
        return buffer[0] % max;
    }
    return Math.floor(Math.random() * max);
};
exports.randomIndex = randomIndex;
