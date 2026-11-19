/** Recursively makes every property optional. */
export type DeepPartial<T> = T extends (...args: never[]) => unknown ? T : T extends readonly (infer U)[] ? readonly U[] : T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T;
/**
 * Checks whether a value is a plain object (created by `{}`, `new Object()` or `Object.create(null)`).
 * Arrays, dates, class instances, maps etc. are not plain objects.
 * @param {unknown} value - The value to check.
 * @example
 * isPlainObject({ a: 1 }); returns true
 * isPlainObject(new Date()); returns false
 * @returns {boolean}
 */
export declare const isPlainObject: (value: unknown) => value is Record<string, unknown>;
/**
 * Creates an object composed of the picked keys.
 * @param {T} obj - The source object.
 * @param {K[]} keys - The keys to keep.
 * @example
 * pick({ id: 1, name: "A", password: "x" }, ["id", "name"]); returns { id: 1, name: "A" }
 * @returns {Pick<T, K>} - A new object with only the given keys.
 */
export declare function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K>;
/**
 * Creates a shallow copy of an object without the given keys.
 * @param {T} obj - The source object.
 * @param {K[]} keys - The keys to remove.
 * @example
 * omit({ id: 1, name: "A", password: "x" }, ["password"]); returns { id: 1, name: "A" }
 * @returns {Omit<T, K>} - A new object without the given keys.
 */
export declare function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K>;
/**
 * Safely reads a nested value using a path such as `"user.addresses[0].city"`.
 * Returns `defaultValue` when the resolved value is `undefined`.
 * @param {unknown} obj - The object to query.
 * @param {string | PropertyKey[]} path - Dot/bracket notation string or an array of keys.
 * @param {T} [defaultValue] - Returned when the path resolves to `undefined`.
 * @example
 * get({ user: { tags: ["a", "b"] } }, "user.tags[1]"); returns "b"
 * get({ user: null }, "user.name", "Guest"); returns "Guest"
 * @returns {T} - The resolved value or `defaultValue`.
 */
export declare function get<T = unknown>(obj: unknown, path: string | readonly PropertyKey[], defaultValue?: T): T;
/**
 * Creates a deep copy of a value. Supports plain objects, arrays, Date, RegExp, Map, Set,
 * typed arrays/Buffers, ArrayBuffer and circular references. Class instances keep their prototype.
 * Functions are copied by reference. Works in environments without `structuredClone`
 * (older Node versions, React Native).
 * @param {T} value - The value to clone.
 * @example
 * const copy = deepClone({ date: new Date(), tags: new Set(["a"]) });
 * @returns {T} - The deep copy.
 */
export declare function deepClone<T>(value: T): T;
/**
 * Deeply merges plain objects from left to right into a new object (inputs are not mutated).
 * - Nested plain objects are merged recursively.
 * - Arrays and other values (dates, class instances) from later sources replace earlier ones.
 * - `undefined` values in sources are ignored, so optional overrides don't erase defaults.
 * - `__proto__`, `constructor` and `prototype` keys are skipped (prototype-pollution safe).
 * @param {T} target - The base object (e.g. defaults).
 * @param {...DeepPartial<T>[]} sources - Objects whose values take precedence.
 * @example
 * deepMerge({ api: { timeout: 5000, retries: 3 } }, { api: { timeout: 10000 } });
 * returns { api: { timeout: 10000, retries: 3 } }
 * @returns {T} - The merged object.
 */
export declare function deepMerge<T extends object>(target: T, ...sources: Array<DeepPartial<T> | null | undefined>): T;
/**
 * Performs a deep equality comparison. Supports primitives, plain objects, arrays, Date, RegExp,
 * Map, Set, typed arrays and circular references. Objects must share the same prototype.
 * @param {unknown} a - The first value.
 * @param {unknown} b - The second value.
 * @example
 * isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }); returns true
 * isEqual(new Date(0), new Date(1)); returns false
 * @returns {boolean} - true if the values are deeply equal.
 */
export declare const isEqual: (a: unknown, b: unknown) => boolean;
/**
 * Checks whether a value is "empty":
 * `null`/`undefined`, `""`, `[]`, an empty Map/Set, or an object with no own enumerable keys.
 * Numbers, booleans, functions and dates are never considered empty.
 * @param {unknown} value - The value to check.
 * @example
 * isEmpty({}); returns true
 * isEmpty([0]); returns false
 * isEmpty(0); returns false
 * @returns {boolean} - true if the value is empty.
 */
export declare const isEmpty: (value: unknown) => boolean;
export interface OmitNullishOptions {
    /** Also remove empty strings (handy for blank form fields). Defaults to `false`. */
    emptyStrings?: boolean;
}
/**
 * Returns a shallow copy of an object without `null` and `undefined` values.
 * Useful for building API payloads and query params from optional fields.
 * @param {T} obj - The source object.
 * @param {OmitNullishOptions} [options] - `{ emptyStrings: true }` also drops `""`.
 * @example
 * omitNullish({ name: "A", email: null, phone: undefined, age: 0 }); returns { name: "A", age: 0 }
 * omitNullish({ q: "", page: 1 }, { emptyStrings: true }); returns { page: 1 }
 * @returns {Partial<T>} - The cleaned object.
 */
export declare function omitNullish<T extends object>(obj: T, { emptyStrings }?: OmitNullishOptions): Partial<T>;
/**
 * Recursively converts object keys from snake_case (or kebab-case) to camelCase, including
 * objects nested inside arrays. Non-plain values (dates, class instances) are left untouched.
 * Unlike `camelCaseKeys`, this handles nested payloads and any value type.
 * @param {unknown} value - An object or array (typically an API response).
 * @example
 * deepCamelCaseKeys<User>({ user_id: 1, home_address: { zip_code: "400001" } });
 * returns { userId: 1, homeAddress: { zipCode: "400001" } }
 * @returns {T} - A new value with camelCased keys.
 */
export declare const deepCamelCaseKeys: <T = unknown>(value: unknown) => T;
/**
 * Recursively converts object keys from camelCase to snake_case, including objects nested inside arrays.
 * Non-plain values (dates, class instances) are left untouched.
 * @param {unknown} value - An object or array (typically an API request body).
 * @example
 * deepSnakeCaseKeys({ userId: 1, homeAddress: { zipCode: "400001" } });
 * returns { user_id: 1, home_address: { zip_code: "400001" } }
 * @returns {T} - A new value with snake_cased keys.
 */
export declare const deepSnakeCaseKeys: <T = unknown>(value: unknown) => T;
