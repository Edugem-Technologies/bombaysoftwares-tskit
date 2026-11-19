"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepSnakeCaseKeys = exports.deepCamelCaseKeys = exports.isEmpty = exports.isEqual = exports.isPlainObject = void 0;
exports.pick = pick;
exports.omit = omit;
exports.get = get;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
exports.omitNullish = omitNullish;
const internal_1 = require("./internal");
/**
 * Checks whether a value is a plain object (created by `{}`, `new Object()` or `Object.create(null)`).
 * Arrays, dates, class instances, maps etc. are not plain objects.
 * @param {unknown} value - The value to check.
 * @example
 * isPlainObject({ a: 1 }); returns true
 * isPlainObject(new Date()); returns false
 * @returns {boolean}
 */
const isPlainObject = (value) => {
    if (value === null || typeof value !== "object")
        return false;
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
};
exports.isPlainObject = isPlainObject;
/**
 * Creates an object composed of the picked keys.
 * @param {T} obj - The source object.
 * @param {K[]} keys - The keys to keep.
 * @example
 * pick({ id: 1, name: "A", password: "x" }, ["id", "name"]); returns { id: 1, name: "A" }
 * @returns {Pick<T, K>} - A new object with only the given keys.
 */
function pick(obj, keys) {
    const result = {};
    for (const key of keys) {
        if (key in obj)
            (0, internal_1.defineOwn)(result, key, obj[key]);
    }
    return result;
}
/**
 * Creates a shallow copy of an object without the given keys.
 * @param {T} obj - The source object.
 * @param {K[]} keys - The keys to remove.
 * @example
 * omit({ id: 1, name: "A", password: "x" }, ["password"]); returns { id: 1, name: "A" }
 * @returns {Omit<T, K>} - A new object without the given keys.
 */
function omit(obj, keys) {
    const result = Object.assign({}, obj);
    for (const key of keys)
        delete result[key];
    return result;
}
const PATH_SEGMENT = /\[\s*(["'])(.*?)\1\s*\]|\[\s*(\d+)\s*\]|([^.[\]]+)/g;
const toPath = (path) => {
    if (Array.isArray(path))
        return path.slice();
    const segments = [];
    const pattern = new RegExp(PATH_SEGMENT.source, "g");
    let match;
    while ((match = pattern.exec(path)) !== null) {
        segments.push(match[2] !== undefined ? match[2] : match[3] !== undefined ? match[3] : match[4]);
    }
    return segments;
};
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
function get(obj, path, defaultValue) {
    let current = obj;
    for (const segment of toPath(path)) {
        if (current === null || current === undefined)
            return defaultValue;
        current = current[segment];
    }
    return (current === undefined ? defaultValue : current);
}
const cloneValue = (value, seen) => {
    if (value === null || typeof value !== "object")
        return value;
    if (seen.has(value))
        return seen.get(value);
    if (value instanceof Date)
        return new Date(value.getTime());
    if (value instanceof RegExp) {
        const copy = new RegExp(value.source, value.flags);
        copy.lastIndex = value.lastIndex;
        return copy;
    }
    if (value instanceof Map) {
        const copy = new Map();
        seen.set(value, copy);
        value.forEach((v, k) => copy.set(cloneValue(k, seen), cloneValue(v, seen)));
        return copy;
    }
    if (value instanceof Set) {
        const copy = new Set();
        seen.set(value, copy);
        value.forEach((v) => copy.add(cloneValue(v, seen)));
        return copy;
    }
    if (ArrayBuffer.isView(value)) {
        if (value instanceof DataView) {
            return new DataView(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
        }
        // Typed arrays and Node Buffers: `.from` always copies the underlying memory.
        const ctor = value.constructor;
        return ctor.from(value);
    }
    if (value instanceof ArrayBuffer)
        return value.slice(0);
    if (Array.isArray(value)) {
        const copy = new Array(value.length);
        seen.set(value, copy);
        value.forEach((item, index) => {
            copy[index] = cloneValue(item, seen);
        });
        return copy;
    }
    // Plain objects and class instances: keep the prototype, copy own enumerable keys (incl. symbols).
    const copy = Object.create(Object.getPrototypeOf(value));
    seen.set(value, copy);
    const source = value;
    Object.keys(source).forEach((key) => (0, internal_1.defineOwn)(copy, key, cloneValue(source[key], seen)));
    Object.getOwnPropertySymbols(source).forEach((symbol) => {
        if (Object.prototype.propertyIsEnumerable.call(source, symbol)) {
            (0, internal_1.defineOwn)(copy, symbol, cloneValue(source[symbol], seen));
        }
    });
    return copy;
};
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
function deepClone(value) {
    return cloneValue(value, new Map());
}
const mergeInto = (target, source) => {
    Object.keys(source).forEach((key) => {
        if ((0, internal_1.isUnsafeKey)(key))
            return;
        const incoming = source[key];
        if (incoming === undefined)
            return;
        const existing = (0, internal_1.hasOwn)(target, key) ? target[key] : undefined;
        if ((0, exports.isPlainObject)(incoming)) {
            const base = {};
            if ((0, exports.isPlainObject)(existing))
                mergeInto(base, existing);
            mergeInto(base, incoming);
            (0, internal_1.defineOwn)(target, key, base);
        }
        else {
            (0, internal_1.defineOwn)(target, key, incoming);
        }
    });
};
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
function deepMerge(target, ...sources) {
    const result = {};
    mergeInto(result, target);
    sources.forEach((source) => {
        if ((0, exports.isPlainObject)(source))
            mergeInto(result, source);
    });
    return result;
}
const equalValues = (a, b, seen) => {
    // SameValueZero: NaN equals NaN, +0 equals -0.
    if (a === b || (a !== a && b !== b))
        return true;
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object")
        return false;
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
        return false;
    // Circular references: assume equal while the pair is being compared.
    if (seen.get(a) === b)
        return true;
    seen.set(a, b);
    if (a instanceof Date)
        return a.getTime() === b.getTime();
    if (a instanceof RegExp)
        return a.toString() === b.toString();
    if (a instanceof Map) {
        const other = b;
        if (a.size !== other.size)
            return false;
        let equal = true;
        a.forEach((value, key) => {
            if (equal && (!other.has(key) || !equalValues(value, other.get(key), seen)))
                equal = false;
        });
        return equal;
    }
    if (a instanceof Set) {
        const other = b;
        if (a.size !== other.size)
            return false;
        const remaining = [];
        other.forEach((value) => remaining.push(value));
        let equal = true;
        a.forEach((value) => {
            if (!equal)
                return;
            if (other.has(value))
                return;
            const index = remaining.findIndex((candidate) => equalValues(value, candidate, seen));
            if (index === -1)
                equal = false;
            else
                remaining.splice(index, 1);
        });
        return equal;
    }
    if (ArrayBuffer.isView(a) && !(a instanceof DataView)) {
        const left = a;
        const right = b;
        if (left.length !== right.length)
            return false;
        for (let i = 0; i < left.length; i++)
            if (left[i] !== right[i])
                return false;
        return true;
    }
    if (Array.isArray(a)) {
        const other = b;
        if (a.length !== other.length)
            return false;
        for (let i = 0; i < a.length; i++)
            if (!equalValues(a[i], other[i], seen))
                return false;
        return true;
    }
    const left = a;
    const right = b;
    const leftKeys = Object.keys(left);
    if (leftKeys.length !== Object.keys(right).length)
        return false;
    return leftKeys.every((key) => (0, internal_1.hasOwn)(right, key) && equalValues(left[key], right[key], seen));
};
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
const isEqual = (a, b) => equalValues(a, b, new Map());
exports.isEqual = isEqual;
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
const isEmpty = (value) => {
    if (value === null || value === undefined)
        return true;
    if (typeof value === "string" || Array.isArray(value))
        return value.length === 0;
    if (value instanceof Map || value instanceof Set)
        return value.size === 0;
    if (ArrayBuffer.isView(value))
        return value.byteLength === 0;
    if (typeof value === "object" && !(value instanceof Date)) {
        return Object.keys(value).length === 0 && Object.getOwnPropertySymbols(value).length === 0;
    }
    return false;
};
exports.isEmpty = isEmpty;
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
function omitNullish(obj, { emptyStrings = false } = {}) {
    const result = {};
    const source = obj;
    Object.keys(source).forEach((key) => {
        const value = source[key];
        if (value === null || value === undefined)
            return;
        if (emptyStrings && value === "")
            return;
        (0, internal_1.defineOwn)(result, key, value);
    });
    return result;
}
/**
 * Converts snake_case / kebab-case keys to camelCase.
 * Leading/trailing underscores are preserved (e.g. "_id" stays "_id") and already-camelCased
 * keys are left untouched, so the conversion is safe for typical API payloads.
 */
const toCamelKey = (key) => {
    const match = /^([_-]*)(.*?)([_-]*)$/.exec(key);
    const body = match[2].replace(/[_-]+([^_-])/g, (_, char) => char.toUpperCase());
    return match[1] + body + match[3];
};
/** Converts camelCase / PascalCase keys to snake_case (`"userID"` → `"user_id"`). */
const toSnakeKey = (key) => key
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1_$2")
    .toLowerCase();
const transformKeysDeep = (value, transform) => {
    if (Array.isArray(value))
        return value.map((item) => transformKeysDeep(item, transform));
    if (!(0, exports.isPlainObject)(value))
        return value;
    const result = {};
    Object.keys(value).forEach((key) => {
        (0, internal_1.defineOwn)(result, transform(key), transformKeysDeep(value[key], transform));
    });
    return result;
};
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
const deepCamelCaseKeys = (value) => transformKeysDeep(value, toCamelKey);
exports.deepCamelCaseKeys = deepCamelCaseKeys;
/**
 * Recursively converts object keys from camelCase to snake_case, including objects nested inside arrays.
 * Non-plain values (dates, class instances) are left untouched.
 * @param {unknown} value - An object or array (typically an API request body).
 * @example
 * deepSnakeCaseKeys({ userId: 1, homeAddress: { zipCode: "400001" } });
 * returns { user_id: 1, home_address: { zip_code: "400001" } }
 * @returns {T} - A new value with snake_cased keys.
 */
const deepSnakeCaseKeys = (value) => transformKeysDeep(value, toSnakeKey);
exports.deepSnakeCaseKeys = deepSnakeCaseKeys;
