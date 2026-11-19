import { defineOwn, hasOwn, randomIndex } from "./internal"

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
export function range(end: number): number[]
export function range(start: number, end: number, step?: number): number[]
export function range(start: number, end?: number, step?: number): number[] {
    if (end === undefined) {
        end = start
        start = 0
    }
    if (step === undefined) step = start <= end ? 1 : -1
    if (step === 0) throw new RangeError("step must not be 0")
    const length = Math.max(Math.ceil((end - start) / step), 0) || 0
    const result: number[] = new Array(length)
    // Multiply instead of accumulating to avoid floating point drift.
    for (let i = 0; i < length; i++) result[i] = start + i * step
    return result
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
export function chunk<T>(array: readonly T[], size: number): T[][] {
    if (!Number.isInteger(size) || size < 1) {
        throw new RangeError("size must be a positive integer")
    }
    const result: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size))
    }
    return result
}

/**
 * Groups items by the key returned from `getKey`. Group order follows first occurrence.
 * @param {T[]} array - The items to group.
 * @param {Function} getKey - Returns the group key for an item.
 * @example
 * groupBy(users, (u) => u.role); returns { admin: [...], member: [...] }
 * @returns {Record<K, T[]>} - An object mapping each key to its items.
 */
export function groupBy<T, K extends PropertyKey>(
    array: readonly T[],
    getKey: (item: T, index: number) => K
): Record<K, T[]> {
    const result = {} as Record<K, T[]>
    array.forEach((item, index) => {
        const key = getKey(item, index)
        if (hasOwn(result, key)) result[key].push(item)
        else defineOwn(result, key, [item])
    })
    return result
}

/**
 * Indexes items by the key returned from `getKey`. Later items win on duplicate keys.
 * @param {T[]} array - The items to index.
 * @param {Function} getKey - Returns the key for an item.
 * @example
 * keyBy([{ id: 1, name: "A" }, { id: 2, name: "B" }], (u) => u.id); returns { 1: { id: 1, name: "A" }, 2: { id: 2, name: "B" } }
 * @returns {Record<K, T>} - An object mapping each key to its item.
 */
export function keyBy<T, K extends PropertyKey>(
    array: readonly T[],
    getKey: (item: T, index: number) => K
): Record<K, T> {
    const result = {} as Record<K, T>
    array.forEach((item, index) => defineOwn(result, getKey(item, index), item))
    return result
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
export function uniqueBy<T>(array: readonly T[], getKey: (item: T) => unknown): T[] {
    const seen = new Set<unknown>()
    return array.filter((item) => {
        const key = getKey(item)
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

/**
 * Splits an array into two groups: items that pass the predicate and items that do not.
 * @param {T[]} array - The array to split.
 * @param {Function} predicate - The test to apply.
 * @example
 * partition([1, 2, 3, 4], (n) => n % 2 === 0); returns [[2, 4], [1, 3]]
 * @returns {[T[], T[]]} - A tuple of `[passed, failed]`.
 */
export function partition<T, S extends T>(
    array: readonly T[],
    predicate: (item: T, index: number) => item is S
): [S[], Exclude<T, S>[]]
export function partition<T>(array: readonly T[], predicate: (item: T, index: number) => boolean): [T[], T[]]
export function partition<T>(array: readonly T[], predicate: (item: T, index: number) => boolean): [T[], T[]] {
    const passed: T[] = []
    const failed: T[] = []
    array.forEach((item, index) => (predicate(item, index) ? passed : failed).push(item))
    return [passed, failed]
}

export type Comparable = string | number | boolean | Date | null | undefined

export type SortCriterion<T> =
    | ((item: T) => Comparable)
    | { by: (item: T) => Comparable; order?: "asc" | "desc" }

const toComparableValue = (value: Comparable): string | number | boolean | null | undefined =>
    value instanceof Date ? value.getTime() : value

// NaN (including Invalid Date) is treated like a missing value so the comparator stays consistent.
const isMissing = (value: unknown): boolean =>
    value === null || value === undefined || (typeof value === "number" && value !== value)

const compareValues = (a: Comparable, b: Comparable, direction: number): number => {
    const left = toComparableValue(a)
    const right = toComparableValue(b)
    const leftMissing = isMissing(left)
    const rightMissing = isMissing(right)
    // Missing values always sort last, regardless of direction.
    if (leftMissing || rightMissing) return leftMissing === rightMissing ? 0 : leftMissing ? 1 : -1
    if (left === right) return 0
    return ((left as string | number | boolean) < (right as string | number | boolean) ? -1 : 1) * direction
}

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
export function sortBy<T>(array: readonly T[], ...criteria: SortCriterion<T>[]): T[] {
    const normalized = (criteria.length ? criteria : [(item: T) => item as unknown as Comparable]).map(
        (criterion) =>
            typeof criterion === "function"
                ? { by: criterion, direction: 1 }
                : { by: criterion.by, direction: criterion.order === "desc" ? -1 : 1 }
    )

    return array
        .map((item, index) => ({ item, index }))
        .sort((a, b) => {
            for (const { by, direction } of normalized) {
                const result = compareValues(by(a.item), by(b.item), direction)
                if (result !== 0) return result
            }
            return a.index - b.index
        })
        .map(({ item }) => item)
}

/**
 * Sums an array of numbers, or the numbers returned by `selector`.
 * @param {T[]} array - The values to sum.
 * @param {Function} [selector] - Maps each item to a number.
 * @example
 * sum([1, 2, 3]); returns 6
 * sum(cart, (item) => item.price * item.quantity); returns 1499
 * @returns {number} - The total (0 for an empty array).
 */
export function sum(array: readonly number[]): number
export function sum<T>(array: readonly T[], selector: (item: T) => number): number
export function sum<T>(array: readonly T[], selector?: (item: T) => number): number {
    let total = 0
    for (const item of array) total += selector ? selector(item) : (item as unknown as number)
    return total
}

/**
 * Returns a new array with the elements in random order (Fisher–Yates).
 * @param {T[]} array - The array to shuffle.
 * @example
 * shuffle([1, 2, 3, 4]); returns e.g. [3, 1, 4, 2]
 * @returns {T[]} - The shuffled copy.
 */
export function shuffle<T>(array: readonly T[]): T[] {
    const result = array.slice()
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomIndex(i + 1)
        const temp = result[i]
        result[i] = result[j]
        result[j] = temp
    }
    return result
}

/**
 * Returns a random element of the array, or `undefined` if it is empty.
 * @param {T[]} array - The array to pick from.
 * @example
 * sample(["red", "green", "blue"]); returns e.g. "green"
 * @returns {T | undefined} - A random element.
 */
export function sample<T>(array: readonly T[]): T | undefined {
    return array.length ? array[randomIndex(array.length)] : undefined
}

/**
 * Returns the items of `array` that are not present in `values` (SameValueZero comparison).
 * @param {T[]} array - The array to inspect.
 * @param {T[]} values - The values to exclude.
 * @example
 * difference([1, 2, 3, 4], [2, 4]); returns [1, 3]
 * @returns {T[]} - The remaining items, in their original order.
 */
export function difference<T>(array: readonly T[], values: readonly T[]): T[] {
    const exclude = new Set(values)
    return array.filter((item) => !exclude.has(item))
}

/**
 * Returns the unique items present in both arrays (SameValueZero comparison), in the order of `a`.
 * @param {T[]} a - The first array.
 * @param {T[]} b - The second array.
 * @example
 * intersection([1, 2, 2, 3], [2, 3, 4]); returns [2, 3]
 * @returns {T[]} - The shared items.
 */
export function intersection<T>(a: readonly T[], b: readonly T[]): T[] {
    const include = new Set(b)
    return uniqueBy(
        a.filter((item) => include.has(item)),
        (item) => item
    )
}

type Falsy = false | null | undefined | 0 | ""

/**
 * Removes falsy values (`false`, `null`, `undefined`, `0`, `""`, `NaN`) and narrows the type.
 * @param {T[]} array - The array to compact.
 * @example
 * compact([0, 1, false, 2, "", 3, null]); returns [1, 2, 3]
 * @returns {T[]} - The truthy values.
 */
export function compact<T>(array: readonly (T | Falsy)[]): T[] {
    return array.filter(Boolean) as T[]
}
