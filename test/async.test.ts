import { expect } from "chai"
import { install, InstalledClock } from "@sinonjs/fake-timers"
import {
    debounce,
    mapConcurrent,
    memoize,
    once,
    retry,
    sleep,
    throttle,
    TimeoutError,
    tryCatch,
    withTimeout,
} from "../src/index"

describe("async helpers", () => {
    let clock: InstalledClock

    beforeEach(() => {
        clock = install()
    })

    afterEach(() => {
        clock.uninstall()
    })

    describe("sleep", () => {
        it("resolves only after the given delay", async () => {
            let resolved = false
            const promise = sleep(100).then(() => {
                resolved = true
            })
            await clock.tickAsync(99)
            expect(resolved).to.be.false
            await clock.tickAsync(1)
            await promise
            expect(resolved).to.be.true
        })
    })

    describe("debounce", () => {
        it("invokes once with the latest arguments after the wait", () => {
            const calls: string[] = []
            const debounced = debounce((value: string) => calls.push(value), 100)
            debounced("a")
            clock.tick(50)
            debounced("b")
            clock.tick(50)
            debounced("c")
            expect(calls).to.deep.equal([])
            clock.tick(100)
            expect(calls).to.deep.equal(["c"])
        })

        it("preserves `this`", () => {
            const target = {
                value: 42,
                seen: 0,
                read: debounce(function (this: { value: number; seen: number }) {
                    this.seen = this.value
                }, 10),
            }
            target.read()
            clock.tick(10)
            expect(target.seen).to.equal(42)
        })

        it("supports leading-edge invocation without a duplicate trailing call", () => {
            const calls: number[] = []
            const debounced = debounce((n: number) => calls.push(n), 100, { leading: true })
            debounced(1)
            expect(calls).to.deep.equal([1])
            clock.tick(100)
            expect(calls).to.deep.equal([1])
        })

        it("with leading and trailing, calls on both edges when called repeatedly", () => {
            const calls: number[] = []
            const debounced = debounce((n: number) => calls.push(n), 100, { leading: true, trailing: true })
            debounced(1)
            debounced(2)
            debounced(3)
            clock.tick(100)
            expect(calls).to.deep.equal([1, 3])
        })

        it("leading-only ignores calls inside the window", () => {
            const calls: number[] = []
            const debounced = debounce((n: number) => calls.push(n), 100, { leading: true, trailing: false })
            debounced(1)
            debounced(2)
            clock.tick(100)
            debounced(3)
            expect(calls).to.deep.equal([1, 3])
        })

        it("cancel drops the pending call", () => {
            const calls: number[] = []
            const debounced = debounce((n: number) => calls.push(n), 100)
            debounced(1)
            expect(debounced.pending()).to.be.true
            debounced.cancel()
            expect(debounced.pending()).to.be.false
            clock.tick(200)
            expect(calls).to.deep.equal([])
        })

        it("flush runs the pending call immediately, once", () => {
            const calls: number[] = []
            const debounced = debounce((n: number) => calls.push(n), 100)
            debounced(7)
            debounced.flush()
            expect(calls).to.deep.equal([7])
            clock.tick(200)
            expect(calls).to.deep.equal([7])
            debounced.flush() // nothing pending: no-op
            expect(calls).to.deep.equal([7])
        })
    })

    describe("throttle", () => {
        it("invokes immediately, then at most once per window with the latest args", () => {
            const calls: Array<[number, number]> = []
            const throttled = throttle((n: number) => calls.push([n, Date.now()]), 100)
            throttled(1) // t=0, leading
            clock.tick(10)
            throttled(2)
            clock.tick(40)
            throttled(3) // t=50
            clock.tick(50) // t=100: trailing call with 3
            throttled(4) // t=100, inside the new window
            clock.tick(100) // t=200: trailing call with 4
            clock.tick(100) // t=300: window closes
            throttled(5) // t=300: leading again
            expect(calls).to.deep.equal([
                [1, 0],
                [3, 100],
                [4, 200],
                [5, 300],
            ])
        })

        it("never invokes more often than the wait", () => {
            const times: number[] = []
            const throttled = throttle(() => times.push(Date.now()), 100)
            for (let t = 0; t < 1000; t += 10) {
                throttled()
                clock.tick(10)
            }
            clock.tick(500)
            for (let i = 1; i < times.length; i++) {
                expect(times[i] - times[i - 1]).to.be.at.least(100)
            }
            expect(times.length).to.be.within(10, 11)
        })

        it("respects leading: false", () => {
            const calls: number[] = []
            const throttled = throttle((n: number) => calls.push(n), 100, { leading: false })
            throttled(1)
            throttled(2)
            expect(calls).to.deep.equal([])
            clock.tick(100)
            expect(calls).to.deep.equal([2])
        })

        it("respects trailing: false", () => {
            const calls: number[] = []
            const throttled = throttle((n: number) => calls.push(n), 100, { trailing: false })
            throttled(1)
            throttled(2)
            clock.tick(100)
            throttled(3)
            expect(calls).to.deep.equal([1, 3])
        })

        it("cancel drops the trailing call and resets the window", () => {
            const calls: number[] = []
            const throttled = throttle((n: number) => calls.push(n), 100)
            throttled(1)
            throttled(2)
            throttled.cancel()
            clock.tick(100)
            expect(calls).to.deep.equal([1])
            throttled(3)
            expect(calls).to.deep.equal([1, 3])
        })
    })

    describe("retry", () => {
        it("returns the first successful result and passes the attempt number", async () => {
            const attempts: number[] = []
            const result = await retry(
                (attempt) => {
                    attempts.push(attempt)
                    if (attempt < 3) throw new Error("fail")
                    return "ok"
                },
                { delay: 0 }
            )
            expect(result).to.equal("ok")
            expect(attempts).to.deep.equal([1, 2, 3])
        })

        it("rejects with the last error after exhausting retries", async () => {
            let calls = 0
            const [error] = await tryCatch(
                retry(
                    () => {
                        calls++
                        return Promise.reject(new Error(`fail ${calls}`))
                    },
                    { retries: 2, delay: 0 }
                )
            )
            expect(calls).to.equal(3)
            expect(error).to.be.instanceOf(Error)
            expect((error as Error).message).to.equal("fail 3")
        })

        it("waits with exponential backoff capped at maxDelay", async () => {
            const startedAt: number[] = []
            const promise = retry(
                () => {
                    startedAt.push(Date.now())
                    throw new Error("fail")
                },
                { retries: 4, delay: 100, factor: 2, maxDelay: 300 }
            ).catch((e) => e)
            await clock.runAllAsync()
            await promise
            const gaps = startedAt.slice(1).map((t, i) => t - startedAt[i])
            expect(gaps).to.deep.equal([100, 200, 300, 300])
        })

        it("stops early when shouldRetry returns false and reports retries via onRetry", async () => {
            const retried: number[] = []
            let calls = 0
            const [error] = await tryCatch(
                retry(
                    () => {
                        calls++
                        throw new Error(calls === 1 ? "transient" : "fatal")
                    },
                    {
                        delay: 0,
                        shouldRetry: (err) => (err as Error).message === "transient",
                        onRetry: (_, attempt) => retried.push(attempt),
                    }
                )
            )
            expect(calls).to.equal(2)
            expect(retried).to.deep.equal([1])
            expect((error as Error).message).to.equal("fatal")
        })
    })

    describe("withTimeout", () => {
        it("resolves when the promise settles in time", async () => {
            const promise = withTimeout(sleep(50).then(() => "done"), 100)
            await clock.tickAsync(50)
            expect(await promise).to.equal("done")
        })

        it("rejects with a TimeoutError when the promise is too slow", async () => {
            const promise = withTimeout(sleep(500), 100).catch((e) => e)
            await clock.tickAsync(100)
            const error = await promise
            expect(error).to.be.instanceOf(TimeoutError)
            expect(error).to.be.instanceOf(Error)
            expect(error.name).to.equal("TimeoutError")
            expect(error.message).to.equal("Operation timed out after 100ms")
        })

        it("uses a custom message and propagates the original rejection", async () => {
            const timedOut = withTimeout(sleep(500), 10, "Too slow").catch((e) => e)
            await clock.tickAsync(10)
            expect((await timedOut).message).to.equal("Too slow")

            const original = new Error("boom")
            const failed = await withTimeout(Promise.reject(original), 10).catch((e) => e)
            expect(failed).to.equal(original)
        })

        it("clears its timer once the promise settles", async () => {
            await withTimeout(Promise.resolve(1), 1000)
            expect(clock.countTimers()).to.equal(0)
        })
    })

    describe("once", () => {
        it("calls the function only once and caches the result", () => {
            let calls = 0
            const init = once((n: number) => {
                calls++
                return n * 2
            })
            expect(init(2)).to.equal(4)
            expect(init(5)).to.equal(4)
            expect(calls).to.equal(1)
        })
    })

    describe("memoize", () => {
        it("caches by first argument by default", () => {
            let calls = 0
            const square = memoize((n: number) => {
                calls++
                return n * n
            })
            expect(square(3)).to.equal(9)
            expect(square(3)).to.equal(9)
            expect(square(4)).to.equal(16)
            expect(calls).to.equal(2)
            expect(square.cache.size).to.equal(2)
        })

        it("uses the resolver to build cache keys", () => {
            let calls = 0
            const area = memoize(
                (w: number, h: number) => {
                    calls++
                    return w * h
                },
                (w, h) => `${w}x${h}`
            )
            expect(area(2, 3)).to.equal(6)
            expect(area(2, 4)).to.equal(8)
            expect(area(2, 3)).to.equal(6)
            expect(calls).to.equal(2)
        })

        it("allows manual invalidation through the cache", () => {
            let calls = 0
            const fn = memoize((n: number) => ++calls + n)
            fn(1)
            fn.cache.clear()
            fn(1)
            expect(calls).to.equal(2)
        })

        it("evicts rejected promises so the call can be retried", async () => {
            let calls = 0
            const load = memoize((id: number) => {
                calls++
                return calls === 1 ? Promise.reject(new Error("network")) : Promise.resolve(`user-${id}`)
            })
            const [error] = await tryCatch(load(1))
            expect(error).to.be.instanceOf(Error)
            expect(load.cache.has(1)).to.be.false
            expect(await load(1)).to.equal("user-1")
            expect(await load(1)).to.equal("user-1")
            expect(calls).to.equal(2)
        })
    })

    describe("tryCatch", () => {
        it("returns [null, data] on success", async () => {
            expect(await tryCatch(Promise.resolve(5))).to.deep.equal([null, 5])
            expect(await tryCatch(() => "sync")).to.deep.equal([null, "sync"])
            expect(await tryCatch(async () => "async")).to.deep.equal([null, "async"])
        })

        it("returns [error, undefined] for rejections and synchronous throws", async () => {
            const error = new Error("nope")
            expect(await tryCatch(Promise.reject(error))).to.deep.equal([error, undefined])
            expect(
                await tryCatch(() => {
                    throw error
                })
            ).to.deep.equal([error, undefined])
        })
    })

    describe("mapConcurrent", () => {
        it("maps in input order while limiting concurrency", async () => {
            let active = 0
            let maxActive = 0
            const promise = mapConcurrent(
                [30, 10, 20, 5, 15],
                async (ms, index) => {
                    active++
                    maxActive = Math.max(maxActive, active)
                    await sleep(ms)
                    active--
                    return `${index}:${ms}`
                },
                2
            )
            await clock.runAllAsync()
            expect(await promise).to.deep.equal(["0:30", "1:10", "2:20", "3:5", "4:15"])
            expect(maxActive).to.equal(2)
        })

        it("runs everything at once by default and handles empty input", async () => {
            let active = 0
            let maxActive = 0
            const promise = mapConcurrent([1, 2, 3], async (n) => {
                active++
                maxActive = Math.max(maxActive, active)
                await sleep(10)
                active--
                return n * 2
            })
            await clock.runAllAsync()
            expect(await promise).to.deep.equal([2, 4, 6])
            expect(maxActive).to.equal(3)
            expect(await mapConcurrent([], async (n) => n)).to.deep.equal([])
        })

        it("rejects on the first failure and stops starting new work", async () => {
            const started: number[] = []
            const promise = mapConcurrent(
                [1, 2, 3, 4, 5],
                async (n) => {
                    started.push(n)
                    await sleep(10)
                    if (n === 2) throw new Error("item 2 failed")
                    return n
                },
                2
            ).catch((e) => e)
            await clock.runAllAsync()
            const error = await promise
            expect(error.message).to.equal("item 2 failed")
            expect(started).to.deep.equal([1, 2, 3])
        })

        it("throws a RangeError for invalid concurrency", async () => {
            const [error] = await tryCatch(mapConcurrent([1], async (n) => n, 0))
            expect(error).to.be.instanceOf(RangeError)
        })
    })
})
