import { expect } from "chai"
import { buildUrl, parseQueryString, toQueryString } from "../src/index"

describe("url helpers", () => {
    describe("toQueryString", () => {
        it("encodes values and skips null/undefined", () => {
            expect(toQueryString({ q: "red shoes", page: 2, active: true, sort: undefined, filter: null })).to.equal(
                "q=red%20shoes&page=2&active=true"
            )
        })

        it("keeps empty strings and zero", () => {
            expect(toQueryString({ q: "", page: 0 })).to.equal("q=&page=0")
        })

        it("encodes special characters in keys and values", () => {
            expect(toQueryString({ "a&b": "c=d/é" })).to.equal("a%26b=c%3Dd%2F%C3%A9")
        })

        it("serialises dates as ISO strings and objects as JSON", () => {
            expect(toQueryString({ from: new Date(Date.UTC(2024, 0, 1)) })).to.equal(
                "from=2024-01-01T00%3A00%3A00.000Z"
            )
            expect(toQueryString({ filter: { status: "open" } })).to.equal(
                "filter=%7B%22status%22%3A%22open%22%7D"
            )
        })

        it("supports array formats", () => {
            const params = { tag: ["a", null, "b"] }
            expect(toQueryString(params)).to.equal("tag=a&tag=b")
            expect(toQueryString(params, { arrayFormat: "brackets" })).to.equal("tag%5B%5D=a&tag%5B%5D=b")
            expect(toQueryString(params, { arrayFormat: "comma" })).to.equal("tag=a%2Cb")
            expect(toQueryString({ tag: [] }, { arrayFormat: "comma" })).to.equal("")
        })
    })

    describe("parseQueryString", () => {
        it("parses keys and values, with or without a leading ?", () => {
            expect(parseQueryString("?q=red+shoes&page=2")).to.deep.equal({ q: "red shoes", page: "2" })
            expect(parseQueryString("q=tea")).to.deep.equal({ q: "tea" })
        })

        it("collects repeated and bracketed keys into arrays", () => {
            expect(parseQueryString("tag=a&tag=b&tag=c")).to.deep.equal({ tag: ["a", "b", "c"] })
            expect(parseQueryString("tag[]=a")).to.deep.equal({ tag: ["a"] })
            expect(parseQueryString("tag%5B%5D=a&tag%5B%5D=b")).to.deep.equal({ tag: ["a", "b"] })
        })

        it("handles flags, empty values and malformed encoding", () => {
            expect(parseQueryString("debug&q=&x=%E0%A4%A")).to.deep.equal({ debug: "", q: "", x: "%E0%A4%A" })
        })

        it("returns an empty object for empty or non-string input", () => {
            expect(parseQueryString("")).to.deep.equal({})
            expect(parseQueryString("?")).to.deep.equal({})
            expect(parseQueryString(undefined as unknown as string)).to.deep.equal({})
        })

        it("is safe against prototype pollution", () => {
            const parsed = parseQueryString("__proto__=x&__proto__=y&constructor=z")
            expect(Object.getPrototypeOf(parsed)).to.equal(Object.prototype)
            expect(Object.prototype.hasOwnProperty.call(parsed, "__proto__")).to.be.true
            expect(parsed["__proto__"]).to.deep.equal(["x", "y"])
            expect(({} as Record<string, unknown>)[0]).to.be.undefined
        })

        it("round-trips with toQueryString", () => {
            const params = { q: "chai & samosa", tag: ["hot", "spicy"], page: "3" }
            expect(parseQueryString(toQueryString(params))).to.deep.equal(params)
        })
    })

    describe("buildUrl", () => {
        it("appends a query string", () => {
            expect(buildUrl("/api/users", { page: 2, q: "asha" })).to.equal("/api/users?page=2&q=asha")
        })

        it("merges with an existing query and preserves the hash", () => {
            expect(buildUrl("/search?lang=en#top", { q: "tea" })).to.equal("/search?lang=en&q=tea#top")
            expect(buildUrl("https://x.com/a?", { b: 1 })).to.equal("https://x.com/a?b=1")
            expect(buildUrl("https://x.com/a?c=1&", { b: 1 })).to.equal("https://x.com/a?c=1&b=1")
        })

        it("returns the URL unchanged when there are no params", () => {
            expect(buildUrl("/api/users")).to.equal("/api/users")
            expect(buildUrl("/api/users", { q: undefined })).to.equal("/api/users")
        })
    })
})
