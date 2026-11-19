"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.TimeoutError = void 0;
exports.debounce = debounce;
exports.throttle = throttle;
exports.retry = retry;
exports.withTimeout = withTimeout;
exports.once = once;
exports.memoize = memoize;
exports.tryCatch = tryCatch;
exports.mapConcurrent = mapConcurrent;
/**
 * Error thrown by {@link withTimeout} when the wrapped promise does not settle in time.
 * Use `error instanceof TimeoutError` to distinguish timeouts from other failures.
 */
class TimeoutError extends Error {
    constructor(message = "Operation timed out") {
        super(message);
        this.name = "TimeoutError";
        // Restore the prototype chain when compiled to ES5 so `instanceof` keeps working.
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Returns a promise that resolves after the given number of milliseconds.
 * @param {number} ms - Milliseconds to wait.
 * @example
 * await sleep(500); // pauses for half a second
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
exports.sleep = sleep;
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
function debounce(fn, wait, { leading = false, trailing = true } = {}) {
    let timer;
    let pendingArgs;
    let pendingThis;
    const invoke = () => {
        const args = pendingArgs;
        const context = pendingThis;
        pendingArgs = undefined;
        pendingThis = undefined;
        fn.apply(context, args);
    };
    const debounced = function (...args) {
        const isFirstCallInWindow = timer === undefined;
        pendingArgs = args;
        pendingThis = this;
        if (timer !== undefined)
            clearTimeout(timer);
        timer = setTimeout(() => {
            timer = undefined;
            // With leading+trailing, the trailing call only happens if there were calls after the leading one.
            if (trailing && pendingArgs)
                invoke();
            pendingArgs = undefined;
            pendingThis = undefined;
        }, wait);
        if (leading && isFirstCallInWindow)
            invoke();
    };
    debounced.cancel = () => {
        if (timer !== undefined)
            clearTimeout(timer);
        timer = undefined;
        pendingArgs = undefined;
        pendingThis = undefined;
    };
    debounced.flush = () => {
        if (timer === undefined)
            return;
        clearTimeout(timer);
        timer = undefined;
        if (trailing && pendingArgs)
            invoke();
    };
    debounced.pending = () => timer !== undefined;
    return debounced;
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
function throttle(fn, wait, { leading = true, trailing = true } = {}) {
    let timer;
    let pendingArgs;
    let pendingThis;
    const invoke = () => {
        const args = pendingArgs;
        const context = pendingThis;
        pendingArgs = undefined;
        pendingThis = undefined;
        fn.apply(context, args);
    };
    const startWindow = () => {
        timer = setTimeout(() => {
            timer = undefined;
            if (trailing && pendingArgs) {
                invoke();
                // Keep throttling relative to the trailing invocation.
                startWindow();
            }
            else {
                pendingArgs = undefined;
                pendingThis = undefined;
            }
        }, wait);
    };
    const throttled = function (...args) {
        pendingArgs = args;
        pendingThis = this;
        if (timer === undefined) {
            if (leading)
                invoke();
            startWindow();
        }
    };
    throttled.cancel = () => {
        if (timer !== undefined)
            clearTimeout(timer);
        timer = undefined;
        pendingArgs = undefined;
        pendingThis = undefined;
    };
    return throttled;
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
async function retry(fn, options = {}) {
    const { retries = 3, delay = 1000, factor = 2, maxDelay = 30000, shouldRetry = () => true, onRetry, } = options;
    let attempt = 0;
    for (;;) {
        attempt++;
        try {
            return await fn(attempt);
        }
        catch (error) {
            if (attempt > retries || !shouldRetry(error, attempt))
                throw error;
            if (onRetry)
                onRetry(error, attempt);
            const wait = Math.min(delay * Math.pow(factor, attempt - 1), maxDelay);
            if (wait > 0)
                await (0, exports.sleep)(wait);
        }
    }
}
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
function withTimeout(promise, ms, message) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new TimeoutError(message !== undefined ? message : `Operation timed out after ${ms}ms`)), ms);
        Promise.resolve(promise).then((value) => {
            clearTimeout(timer);
            resolve(value);
        }, (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}
/**
 * Creates a function that runs `fn` only on its first call and returns that result on every later call.
 * @param {Function} fn - The function to wrap.
 * @example
 * const init = once(() => setupAnalytics());
 * init(); init(); // setupAnalytics runs once
 * @returns {Function} - The wrapped function.
 */
function once(fn) {
    let called = false;
    let result;
    return function (...args) {
        if (!called) {
            called = true;
            result = fn.apply(this, args);
        }
        return result;
    };
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
function memoize(fn, resolver) {
    const cache = new Map();
    const memoized = function (...args) {
        const key = resolver ? resolver.apply(this, args) : args[0];
        if (cache.has(key))
            return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        if (result && typeof result.then === "function") {
            ;
            result.then(undefined, () => {
                if (cache.get(key) === result)
                    cache.delete(key);
            });
        }
        return result;
    };
    memoized.cache = cache;
    return memoized;
}
/**
 * Go-style error handling: resolves to `[error, undefined]` on failure or `[null, data]` on success,
 * so callers can avoid nested try/catch blocks.
 * @param {Promise<T> | Function} input - A promise, or a (sync or async) function to call.
 * @example
 * const [error, user] = await tryCatch(api.getUser(id));
 * if (error) return showToast(error.message);
 * @returns {Promise<[E, undefined] | [null, T]>} - The error/data tuple.
 */
async function tryCatch(input) {
    try {
        const data = await (typeof input === "function" ? input() : input);
        return [null, data];
    }
    catch (error) {
        return [error, undefined];
    }
}
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
async function mapConcurrent(items, mapper, concurrency = Infinity) {
    if (!(concurrency >= 1)) {
        throw new RangeError("concurrency must be a number >= 1");
    }
    const results = new Array(items.length);
    let nextIndex = 0;
    let failed = false;
    const worker = async () => {
        while (!failed && nextIndex < items.length) {
            const index = nextIndex++;
            try {
                results[index] = await mapper(items[index], index);
            }
            catch (error) {
                failed = true;
                throw error;
            }
        }
    };
    const workerCount = Math.min(Math.floor(concurrency), items.length);
    const workers = [];
    for (let i = 0; i < workerCount; i++)
        workers.push(worker());
    await Promise.all(workers);
    return results;
}
