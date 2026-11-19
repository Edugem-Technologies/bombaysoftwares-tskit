/**
 * Creates an array of numbers progressing from `start` up to, but not including, `end`.
 * With a single argument, the range starts at 0. Generalises `getArray`.
 * @param {number} start - The start of the range (or the end, when called with one argument).
 * @param {number} [end] - The end of the range (exclusive).
 * @param {number} [step] - The increment; defaults to 1, or -1 when `end < start`.
 * @example
 * range(4); returns [0, 1, 2, 3]
 * range(1, 5); returns [1, 2, 3, 4]
 * range(0, 20, 5); returns [0, 5, 10, 15]
 * range(5, 0); returns [5, 4, 3, 2, 1]
 * @returns {number[]} - The range of numbers.
 * @throws {RangeError} If `step` is 0.
 */
export declare function range(end: number): number[];
export declare function range(start: number, end: number, step?: number): number[];
/**
 * Splits an array into groups of `size`. The final chunk holds the remaining elements.
 * @param {T[]} array - The array to split.
 * @param {number} size - The length of each chunk (positive integer).
 * @example
 * chunk([1, 2, 3, 4, 5], 2); returns [[1, 2], [3, 4], [5]]
 * @returns {T[][]} - The chunks.
 * @throws {RangeError} If `size` is not a positive integer.
 */
export declare function chunk<T>(array: readonly T[], size: number): T[][];
/**
 * Groups items by the key returned from `getKey`. Group order follows first occurrence.
 * @param {T[]} array - The items to group.
 * @param {Function} getKey - Returns the group key for an item.
 * @example
 * groupBy(users, (u) => u.role); returns { admin: [...], member: [...] }
 * @returns {Record<K, T[]>} - An object mapping each key to its items.
 */
export declare function groupBy<T, K extends PropertyKey>(array: readonly T[], getKey: (item: T, index: number) => K): Record<K, T[]>;
/**
 * Indexes items by the key returned from `getKey`. Later items win on duplicate keys.
 * @param {T[]} array - The items to index.
 * @param {Function} getKey - Returns the key for an item.
 * @example
 * keyBy([{ id: 1, name: "A" }, { id: 2, name: "B" }], (u) => u.id); returns { 1: { id: 1, name: "A" }, 2: { id: 2, name: "B" } }
 * @returns {Record<K, T>} - An object mapping each key to its item.
 */
export declare function keyBy<T, K extends PropertyKey>(array: readonly T[], getKey: (item: T, index: number) => K): Record<K, T>;
/**
 * Removes duplicates using the key returned from `getKey`, keeping the first occurrence.
 * Unlike `getUniqueValueFromArray`, this works with objects and mixed types.
 * @param {T[]} array - The array to de-duplicate.
 * @param {Function} getKey - Returns the identity of an item.
 * @example
 * uniqueBy([{ id: 1 }, { id: 2 }, { id: 1 }], (item) => item.id); returns [{ id: 1 }, { id: 2 }]
 * @returns {T[]} - A new array without duplicates.
 */
export declare function uniqueBy<T>(array: readonly T[], getKey: (item: T) => unknown): T[];
/**
 * Splits an array into two groups: items that pass the predicate and items that do not.
 * @param {T[]} array - The array to split.
 * @param {Function} predicate - The test to apply.
 * @example
 * partition([1, 2, 3, 4], (n) => n % 2 === 0); returns [[2, 4], [1, 3]]
 * @returns {[T[], T[]]} - A tuple of `[passed, failed]`.
 */
export declare function partition<T, S extends T>(array: readonly T[], predicate: (item: T, index: number) => item is S): [S[], Exclude<T, S>[]];
export declare function partition<T>(array: readonly T[], predicate: (item: T, index: number) => boolean): [T[], T[]];
export type Comparable = string | number | boolean | Date | null | undefined;
export type SortCriterion<T> = ((item: T) => Comparable) | {
    by: (item: T) => Comparable;
    order?: "asc" | "desc";
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
export declare function sortBy<T>(array: readonly T[], ...criteria: SortCriterion<T>[]): T[];
/**
 * Sums an array of numbers, or the numbers returned by `selector`.
 * @param {T[]} array - The values to sum.
 * @param {Function} [selector] - Maps each item to a number.
 * @example
 * sum([1, 2, 3]); returns 6
 * sum(cart, (item) => item.price * item.quantity); returns 1499
 * @returns {number} - The total (0 for an empty array).
 */
export declare function sum(array: readonly number[]): number;
export declare function sum<T>(array: readonly T[], selector: (item: T) => number): number;
/**
 * Returns a new array with the elements in random order (Fisher–Yates).
 * @param {T[]} array - The array to shuffle.
 * @example
 * shuffle([1, 2, 3, 4]); returns e.g. [3, 1, 4, 2]
 * @returns {T[]} - The shuffled copy.
 */
export declare function shuffle<T>(array: readonly T[]): T[];
/**
 * Returns a random element of the array, or `undefined` if it is empty.
 * @param {T[]} array - The array to pick from.
 * @example
 * sample(["red", "green", "blue"]); returns e.g. "green"
 * @returns {T | undefined} - A random element.
 */
export declare function sample<T>(array: readonly T[]): T | undefined;
/**
 * Returns the items of `array` that are not present in `values` (SameValueZero comparison).
 * @param {T[]} array - The array to inspect.
 * @param {T[]} values - The values to exclude.
 * @example
 * difference([1, 2, 3, 4], [2, 4]); returns [1, 3]
 * @returns {T[]} - The remaining items, in their original order.
 */
export declare function difference<T>(array: readonly T[], values: readonly T[]): T[];
/**
 * Returns the unique items present in both arrays (SameValueZero comparison), in the order of `a`.
 * @param {T[]} a - The first array.
 * @param {T[]} b - The second array.
 * @example
 * intersection([1, 2, 2, 3], [2, 3, 4]); returns [2, 3]
 * @returns {T[]} - The shared items.
 */
export declare function intersection<T>(a: readonly T[], b: readonly T[]): T[];
type Falsy = false | null | undefined | 0 | "";
/**
 * Removes falsy values (`false`, `null`, `undefined`, `0`, `""`, `NaN`) and narrows the type.
 * @param {T[]} array - The array to compact.
 * @example
 * compact([0, 1, false, 2, "", 3, null]); returns [1, 2, 3]
 * @returns {T[]} - The truthy values.
 */
export declare function compact<T>(array: readonly (T | Falsy)[]): T[];
export {};
