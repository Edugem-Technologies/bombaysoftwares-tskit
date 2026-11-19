/**
 * Runs `fn` with `process.env.TZ` temporarily set to `timeZone` (Node re-reads TZ on assignment).
 * Used to exercise DST transitions, which IST (the suite's default zone) does not have.
 */
export const withTimeZone = <T>(timeZone: string, fn: () => T): T => {
    const previous = process.env.TZ
    process.env.TZ = timeZone
    try {
        return fn()
    } finally {
        process.env.TZ = previous
    }
}
