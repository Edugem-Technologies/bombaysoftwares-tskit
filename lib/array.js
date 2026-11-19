"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = range;
exports.chunk = chunk;
exports.groupBy = groupBy;
exports.keyBy = keyBy;
exports.uniqueBy = uniqueBy;
exports.partition = partition;
exports.sortBy = sortBy;
exports.sum = sum;
exports.shuffle = shuffle;
exports.sample = sample;
exports.difference = difference;
exports.intersection = intersection;
exports.compact = compact;
const internal_1 = require("./internal");
function range(start, end, step) {
    if (end === undefined) {
        end = start;
        start = 0;
    }
    if (step === undefined)
        step = start <= end ? 1 : -1;
    if (step === 0)
        throw new RangeError("step must not be 0");
    const length = Math.max(Math.ceil((end - start) / step), 0) || 0;
    const result = new Array(length);
    // Multiply instead of accumulating to avoid floating point drift.
    for (let i = 0; i < length; i++)
        result[i] = start + i * step;
    return result;
}
/**
 * Splits an array into groups of `size`. The final chunk holds the remaining elements.
 * @param {T[]} array - The array to split.
 * @param {number} size - The length of each chunk (positive integer).
 * @example
 * chunk([1, 2, 3, 4, 5], 2); returns [[1, 2], [3, 4], [5]]
 * @returns {T[][]} - The chunks.
 * @throws {RangeError} If `size` is not a positive integer.
 */
function chunk(array, size) {
    if (!Number.isInteger(size) || size < 1) {
        throw new RangeError("size must be a positive integer");
    }
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
/**
 * Groups items by the key returned from `getKey`. Group order follows first occurrence.
 * @param {T[]} array - The items to group.
 * @param {Function} getKey - Returns the group key for an item.
 * @example
 * groupBy(users, (u) => u.role); returns { admin: [...], member: [...] }
 * @returns {Record<K, T[]>} - An object mapping each key to its items.
 */
function groupBy(array, getKey) {
    const result = {};
    array.forEach((item, index) => {
        const key = getKey(item, index);
        if ((0, internal_1.hasOwn)(result, key))
            result[key].push(item);
        else
            (0, internal_1.defineOwn)(result, key, [item]);
    });
    return result;
}
/**
 * Indexes items by the key returned from `getKey`. Later items win on duplicate keys.
 * @param {T[]} array - The items to index.
 * @param {Function} getKey - Returns the key for an item.
 * @example
 * keyBy([{ id: 1, name: "A" }, { id: 2, name: "B" }], (u) => u.id); returns { 1: { id: 1, name: "A" }, 2: { id: 2, name: "B" } }
 * @returns {Record<K, T>} - An object mapping each key to its item.
 */
function keyBy(array, getKey) {
    const result = {};
    array.forEach((item, index) => (0, internal_1.defineOwn)(result, getKey(item, index), item));
    return result;
}
/**
 * Removes duplicates using the key returned from `getKey`, keeping the first occurrence.
 * Unlike `getUniqueValueFromArray`, this works with objects and mixed types.
 * @param {T[]} array - The array to de-duplicate.
 * @param {Function} getKey - Returns the identity of an item.
 * @example
 * uniqueBy([{ id: 1 }, { id: 2 }, { id: 1 }], (item) => item.id); returns [{ id: 1 }, { id: 2 }]
 * @returns {T[]} - A new array without duplicates.
 */
function uniqueBy(array, getKey) {
    const seen = new Set();
    return array.filter((item) => {
        const key = getKey(item);
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function partition(array, predicate) {
    const passed = [];
    const failed = [];
    array.forEach((item, index) => (predicate(item, index) ? passed : failed).push(item));
    return [passed, failed];
}
const toComparableValue = (value) => value instanceof Date ? value.getTime() : value;
// NaN (including Invalid Date) is treated like a missing value so the comparator stays consistent.
const isMissing = (value) => value === null || value === undefined || (typeof value === "number" && value !== value);
const compareValues = (a, b, direction) => {
    const left = toComparableValue(a);
    const right = toComparableValue(b);
    const leftMissing = isMissing(left);
    const rightMissing = isMissing(right);
    // Missing values always sort last, regardless of direction.
    if (leftMissing || rightMissing)
        return leftMissing === rightMissing ? 0 : leftMissing ? 1 : -1;
    if (left === right)
        return 0;
    return (left < right ? -1 : 1) * direction;
};
/**
 * Returns a new array sorted by one or more criteria. The sort is stable, does not mutate the input,
 * and always places `null`/`undefined` values last. Strings are compared by code unit; pass
 * `(item) => item.name.toLowerCase()` for case-insensitive sorting.
 * @param {T[]} array - The array to sort.
 * @param {...SortCriterion<T>} criteria - Selector functions or `{ by, order }` objects, applied in order.
 * @example
 * sortBy(users, (u) => u.age);
 * sortBy(users, { by: (u) => u.role }, { by: (u) => u.createdAt, order: "desc" });
 * @returns {T[]} - The sorted copy.
 */
function sortBy(array, ...criteria) {
    const normalized = (criteria.length ? criteria : [(item) => item]).map((criterion) => typeof criterion === "function"
        ? { by: criterion, direction: 1 }
        : { by: criterion.by, direction: criterion.order === "desc" ? -1 : 1 });
    return array
        .map((item, index) => ({ item, index }))
        .sort((a, b) => {
        for (const { by, direction } of normalized) {
            const result = compareValues(by(a.item), by(b.item), direction);
            if (result !== 0)
                return result;
        }
        return a.index - b.index;
    })
        .map(({ item }) => item);
}
function sum(array, selector) {
    let total = 0;
    for (const item of array)
        total += selector ? selector(item) : item;
    return total;
}
/**
 * Returns a new array with the elements in random order (Fisher–Yates).
 * @param {T[]} array - The array to shuffle.
 * @example
 * shuffle([1, 2, 3, 4]); returns e.g. [3, 1, 4, 2]
 * @returns {T[]} - The shuffled copy.
 */
function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = (0, internal_1.randomIndex)(i + 1);
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }
    return result;
}
/**
 * Returns a random element of the array, or `undefined` if it is empty.
 * @param {T[]} array - The array to pick from.
 * @example
 * sample(["red", "green", "blue"]); returns e.g. "green"
 * @returns {T | undefined} - A random element.
 */
function sample(array) {
    return array.length ? array[(0, internal_1.randomIndex)(array.length)] : undefined;
}
/**
 * Returns the items of `array` that are not present in `values` (SameValueZero comparison).
 * @param {T[]} array - The array to inspect.
 * @param {T[]} values - The values to exclude.
 * @example
 * difference([1, 2, 3, 4], [2, 4]); returns [1, 3]
 * @returns {T[]} - The remaining items, in their original order.
 */
function difference(array, values) {
    const exclude = new Set(values);
    return array.filter((item) => !exclude.has(item));
}
/**
 * Returns the unique items present in both arrays (SameValueZero comparison), in the order of `a`.
 * @param {T[]} a - The first array.
 * @param {T[]} b - The second array.
 * @example
 * intersection([1, 2, 2, 3], [2, 3, 4]); returns [2, 3]
 * @returns {T[]} - The shared items.
 */
function intersection(a, b) {
    const include = new Set(b);
    return uniqueBy(a.filter((item) => include.has(item)), (item) => item);
}
/**
 * Removes falsy values (`false`, `null`, `undefined`, `0`, `""`, `NaN`) and narrows the type.
 * @param {T[]} array - The array to compact.
 * @example
 * compact([0, 1, false, 2, "", 3, null]); returns [1, 2, 3]
 * @returns {T[]} - The truthy values.
 */
function compact(array) {
    return array.filter(Boolean);
}
