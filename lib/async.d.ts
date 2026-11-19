type AnyFunction = (...args: any[]) => any;
/**
 * Error thrown by {@link withTimeout} when the wrapped promise does not settle in time.
 * Use `error instanceof TimeoutError` to distinguish timeouts from other failures.
 */
export declare class TimeoutError extends Error {
    constructor(message?: string);
}
/**
 * Returns a promise that resolves after the given number of milliseconds.
 * @param {number} ms - Milliseconds to wait.
 * @example
 * await sleep(500); // pauses for half a second
 * @returns {Promise<void>}
 */
export declare const sleep: (ms: number) => Promise<void>;
export interface DebounceOptions {
    /** Invoke on the leading edge of the wait window. Defaults to `false`. */
    leading?: boolean;
    /** Invoke on the trailing edge of the wait window. Defaults to `true`. */
    trailing?: boolean;
}
export interface DebouncedFunction<F extends AnyFunction> {
    (...args: Parameters<F>): void;
    /** Cancels any pending invocation. */
    cancel(): void;
    /** Immediately runs the pending invocation, if any. */
    flush(): void;
    /** Whether a wait window is currently open. */
    pending(): boolean;
}
/**
 * Creates a debounced function that delays invoking `fn` until `wait` ms have elapsed since the last call.
 * Typical use: search-as-you-type, window resize handlers, autosave.
 * @param {Function} fn - The function to debounce.
 * @param {number} wait - Milliseconds to wait after the last call.
 * @param {DebounceOptions} [options] - `{ leading = false, trailing = true }`.
 * @example
 * const onSearch = debounce((q: string) => fetchResults(q), 300);
 * onSearch("a"); onSearch("ab"); onSearch("abc"); // fetchResults("abc") runs once, 300ms later
 * @returns {DebouncedFunction} - The debounced function with `cancel`, `flush` and `pending` methods.
 */
export declare function debounce<F extends AnyFunction>(fn: F, wait: number, { leading, trailing }?: DebounceOptions): DebouncedFunction<F>;
export interface ThrottleOptions {
    /** Invoke on the leading edge of the window. Defaults to `true`. */
    leading?: boolean;
    /** Invoke with the latest arguments at the end of the window. Defaults to `true`. */
    trailing?: boolean;
}
export interface ThrottledFunction<F extends AnyFunction> {
    (...args: Parameters<F>): void;
    /** Cancels any pending trailing invocation and resets the throttle window. */
    cancel(): void;
}
/**
 * Creates a throttled function that invokes `fn` at most once per `wait` ms.
 * Typical use: scroll/mousemove handlers, rate-limited API calls.
 * @param {Function} fn - The function to throttle.
 * @param {number} wait - Minimum milliseconds between invocations.
 * @param {ThrottleOptions} [options] - `{ leading = true, trailing = true }`.
 * @example
 * const onScroll = throttle(() => updatePosition(), 100);
 * window.addEventListener("scroll", onScroll);
 * @returns {ThrottledFunction} - The throttled function with a `cancel` method.
 */
export declare function throttle<F extends AnyFunction>(fn: F, wait: number, { leading, trailing }?: ThrottleOptions): ThrottledFunction<F>;
export interface RetryOptions {
    /** Number of retries after the first attempt. Defaults to `3` (i.e. up to 4 attempts in total). */
    retries?: number;
    /** Delay before the first retry in ms. Defaults to `1000`. */
    delay?: number;
    /** Multiplier applied to the delay after each retry (exponential backoff). Defaults to `2`. */
    factor?: number;
    /** Upper bound for the delay in ms. Defaults to `30000`. */
    maxDelay?: number;
    /** Return `false` to stop retrying for a given error (e.g. 4xx responses). Defaults to always retrying. */
    shouldRetry?: (error: unknown, attempt: number) => boolean;
    /** Called before each retry; useful for logging. */
    onRetry?: (error: unknown, attempt: number) => void;
}
/**
 * Calls `fn` until it succeeds, retrying failures with exponential backoff.
 * The delay before retry `n` is `min(delay * factor^(n-1), maxDelay)`.
 * @param {Function} fn - The operation to run. Receives the 1-based attempt number.
 * @param {RetryOptions} [options] - Retry configuration.
 * @example
 * const user = await retry(() => api.getUser(id), {
 *     retries: 3,
 *     delay: 500,
 *     shouldRetry: (err) => err.status >= 500,
 * });
 * @returns {Promise<T>} - Resolves with the first successful result; rejects with the last error.
 */
export declare function retry<T>(fn: (attempt: number) => T | Promise<T>, options?: RetryOptions): Promise<T>;
/**
 * Rejects with a {@link TimeoutError} if `promise` does not settle within `ms` milliseconds.
 * Note: this does not cancel the underlying operation; pair it with an AbortController for that.
 * @param {Promise<T>} promise - The promise to race against the timer.
 * @param {number} ms - Timeout in milliseconds.
 * @param {string} [message] - Custom error message.
 * @example
 * const data = await withTimeout(fetch(url), 5000);
 * @returns {Promise<T>} - Settles like `promise`, or rejects with TimeoutError.
 */
export declare function withTimeout<T>(promise: PromiseLike<T>, ms: number, message?: string): Promise<T>;
/**
 * Creates a function that runs `fn` only on its first call and returns that result on every later call.
 * @param {Function} fn - The function to wrap.
 * @example
 * const init = once(() => setupAnalytics());
 * init(); init(); // setupAnalytics runs once
 * @returns {Function} - The wrapped function.
 */
export declare function once<F extends AnyFunction>(fn: F): (...args: Parameters<F>) => ReturnType<F>;
export interface MemoizedFunction<F extends AnyFunction> {
    (...args: Parameters<F>): ReturnType<F>;
    /** The underlying cache; call `cache.clear()` or `cache.delete(key)` to invalidate. */
    cache: Map<unknown, ReturnType<F>>;
}
/**
 * Caches the result of `fn` per cache key. By default the key is the first argument
 * (compared with SameValueZero); pass `resolver` to derive a key from all arguments.
 * Rejected promises are evicted automatically so a failed async call can be retried.
 * @param {Function} fn - The function to memoize.
 * @param {Function} [resolver] - Computes the cache key from the arguments.
 * @example
 * const getUser = memoize((id: number) => api.getUser(id));
 * const area = memoize((w: number, h: number) => w * h, (w, h) => `${w}x${h}`);
 * @returns {MemoizedFunction} - The memoized function with an exposed `cache`.
 */
export declare function memoize<F extends AnyFunction>(fn: F, resolver?: (...args: Parameters<F>) => unknown): MemoizedFunction<F>;
/**
 * Go-style error handling: resolves to `[error, undefined]` on failure or `[null, data]` on success,
 * so callers can avoid nested try/catch blocks.
 * @param {Promise<T> | Function} input - A promise, or a (sync or async) function to call.
 * @example
 * const [error, user] = await tryCatch(api.getUser(id));
 * if (error) return showToast(error.message);
 * @returns {Promise<[E, undefined] | [null, T]>} - The error/data tuple.
 */
export declare function tryCatch<T, E = Error>(input: PromiseLike<T> | (() => T | PromiseLike<T>)): Promise<[E, undefined] | [null, T]>;
/**
 * Maps over `items` with an async `mapper`, running at most `concurrency` calls at a time.
 * Results keep the input order. Rejects on the first failure and stops starting new work.
 * @param {T[]} items - Items to process.
 * @param {Function} mapper - Async function called with `(item, index)`.
 * @param {number} [concurrency=Infinity] - Maximum number of in-flight calls (>= 1).
 * @example
 * const uploaded = await mapConcurrent(files, (file) => upload(file), 3);
 * @returns {Promise<R[]>} - The mapped results in input order.
 */
export declare function mapConcurrent<T, R>(items: readonly T[], mapper: (item: T, index: number) => R | PromiseLike<R>, concurrency?: number): Promise<R[]>;
export {};
