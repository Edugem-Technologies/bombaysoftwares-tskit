import { expect } from "chai"
import {
    deepCamelCaseKeys,
    deepClone,
    deepMerge,
    deepSnakeCaseKeys,
    get,
    isEmpty,
    isEqual,
    isPlainObject,
    omit,
    omitNullish,
    pick,
} from "../src/index"

class Point {
    constructor(public x: number, public y: number) {}
    norm() {
        return Math.hypot(this.x, this.y)
    }
}

describe("object helpers", () => {
    describe("isPlainObject", () => {
        it("accepts object literals and null-prototype objects only", () => {
            expect(isPlainObject({})).to.be.true
            expect(isPlainObject({ a: 1 })).to.be.true
            expect(isPlainObject(Object.create(null))).to.be.true
            expect(isPlainObject([])).to.be.false
            expect(isPlainObject(new Date())).to.be.false
            expect(isPlainObject(new Point(1, 2))).to.be.false
            expect(isPlainObject(null)).to.be.false
            expect(isPlainObject("x")).to.be.false
        })
    })

    describe("pick / omit", () => {
        const user = { id: 1, name: "Asha", password: "secret" }

        it("pick keeps only the listed keys", () => {
            expect(pick(user, ["id", "name"])).to.deep.equal({ id: 1, name: "Asha" })
        })

        it("pick ignores keys missing from the object", () => {
            const partial: { a?: number; b?: number } = { a: 1 }
            expect(pick(partial, ["a", "b"])).to.deep.equal({ a: 1 })
        })

        it("omit removes the listed keys without mutating the input", () => {
            expect(omit(user, ["password"])).to.deep.equal({ id: 1, name: "Asha" })
            expect(user).to.have.property("password", "secret")
        })
    })

    describe("get", () => {
        const data = {
            user: { name: "Asha", tags: ["a", "b"], "dotted.key": 1, address: null as null | { city: string } },
            list: [{ id: 7 }],
        }

        it("reads nested values with dot and bracket notation", () => {
            expect(get(data, "user.name")).to.equal("Asha")
            expect(get(data, "user.tags[1]")).to.equal("b")
            expect(get(data, "list[0].id")).to.equal(7)
            expect(get(data, "user['dotted.key']")).to.equal(1)
            expect(get(data, ["user", "tags", 0])).to.equal("a")
        })

        it("returns the default for missing paths or null intermediates", () => {
            expect(get(data, "user.address.city", "Unknown")).to.equal("Unknown")
            expect(get(data, "nope.deeper", 0)).to.equal(0)
            expect(get(null, "a")).to.be.undefined
        })

        it("does not use the default for falsy but defined values", () => {
            expect(get({ a: 0 }, "a", 5)).to.equal(0)
            expect(get({ a: null }, "a", 5)).to.equal(null)
        })
    })

    describe("deepClone", () => {
        it("clones nested structures without sharing references", () => {
            const source = { a: [1, { b: 2 }], d: new Date(0), m: new Map([["k", { v: 1 }]]), s: new Set([1, 2]) }
            const copy = deepClone(source)
            expect(copy).to.deep.equal(source)
            expect(copy.a).to.not.equal(source.a)
            expect(copy.a[1]).to.not.equal(source.a[1])
            expect(copy.d).to.not.equal(source.d)
            expect(copy.d.getTime()).to.equal(0)
            expect(copy.m.get("k")).to.not.equal(source.m.get("k"))
            expect(copy.s).to.not.equal(source.s)
        })

        it("handles circular references", () => {
            const source: { self?: unknown; list: unknown[] } = { list: [] }
            source.self = source
            source.list.push(source)
            const copy = deepClone(source)
            expect(copy).to.not.equal(source)
            expect(copy.self).to.equal(copy)
            expect(copy.list[0]).to.equal(copy)
        })

        it("preserves class prototypes, regexes and typed arrays", () => {
            const point = deepClone(new Point(3, 4))
            expect(point).to.be.instanceOf(Point)
            expect(point.norm()).to.equal(5)

            const regex = /ab+c/gi
            regex.lastIndex = 2
            const regexCopy = deepClone(regex)
            expect(regexCopy).to.not.equal(regex)
            expect(regexCopy.source).to.equal("ab+c")
            expect(regexCopy.flags).to.equal("gi")
            expect(regexCopy.lastIndex).to.equal(2)

            const bytes = new Uint8Array([1, 2, 3])
            const bytesCopy = deepClone(bytes)
            bytesCopy[0] = 9
            expect(bytes[0]).to.equal(1)

            const buffer = Buffer.from("hi")
            const bufferCopy = deepClone(buffer)
            bufferCopy[0] = 0
            expect(buffer.toString()).to.equal("hi")
        })

        it("returns primitives and functions as-is", () => {
            const fn = () => 1
            expect(deepClone(5)).to.equal(5)
            expect(deepClone(null)).to.equal(null)
            expect(deepClone(fn)).to.equal(fn)
        })
    })

    describe("deepMerge", () => {
        it("merges nested objects without mutating inputs", () => {
            const defaults = { api: { timeout: 5000, retries: 3 }, theme: "light", features: ["a"] }
            const overrides = { api: { timeout: 10000 }, features: ["b", "c"] }
            const merged = deepMerge(defaults, overrides)
            expect(merged).to.deep.equal({ api: { timeout: 10000, retries: 3 }, theme: "light", features: ["b", "c"] })
            expect(defaults.api.timeout).to.equal(5000)
            expect(merged.api).to.not.equal(defaults.api)
        })

        it("applies multiple sources left to right and ignores undefined/null sources", () => {
            const merged = deepMerge<{ a: number; b: number; c: { d: number; e?: number } }>(
                { a: 1, b: 1, c: { d: 1 } },
                { b: 2 },
                null,
                undefined,
                { c: { e: 3 } }
            )
            expect(merged).to.deep.equal({ a: 1, b: 2, c: { d: 1, e: 3 } })
        })

        it("does not overwrite with undefined values", () => {
            expect(deepMerge({ a: 1, b: 2 }, { a: undefined })).to.deep.equal({ a: 1, b: 2 })
        })

        it("replaces non-plain values instead of merging them", () => {
            const date = new Date(0)
            const merged = deepMerge<{ when: Date | { x: number } }>({ when: { x: 1 } }, { when: date })
            expect(merged.when).to.equal(date)
        })

        it("is safe against prototype pollution", () => {
            const payload = JSON.parse('{"__proto__": {"polluted": true}, "constructor": {"prototype": {"bad": 1}}}')
            const merged = deepMerge({}, payload) as Record<string, unknown>
            expect(({} as Record<string, unknown>).polluted).to.be.undefined
            expect(merged.polluted).to.be.undefined
            expect(Object.getPrototypeOf(merged)).to.equal(Object.prototype)
        })
    })

    describe("isEqual", () => {
        it("compares primitives with SameValueZero", () => {
            expect(isEqual(1, 1)).to.be.true
            expect(isEqual(NaN, NaN)).to.be.true
            expect(isEqual(0, -0)).to.be.true
            expect(isEqual("1", 1)).to.be.false
            expect(isEqual(null, undefined)).to.be.false
        })

        it("compares nested objects and arrays structurally", () => {
            expect(isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).to.be.true
            expect(isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] })).to.be.false
            expect(isEqual({ a: 1 }, { a: 1, b: undefined })).to.be.false
            expect(isEqual([1, 2], [2, 1])).to.be.false
            expect(isEqual([], {})).to.be.false
        })

        it("compares dates, regexes, maps, sets and typed arrays", () => {
            expect(isEqual(new Date(5), new Date(5))).to.be.true
            expect(isEqual(new Date(5), new Date(6))).to.be.false
            expect(isEqual(/a/g, /a/g)).to.be.true
            expect(isEqual(/a/g, /a/i)).to.be.false
            expect(isEqual(new Map([["a", { x: 1 }]]), new Map([["a", { x: 1 }]]))).to.be.true
            expect(isEqual(new Map([["a", 1]]), new Map([["b", 1]]))).to.be.false
            expect(isEqual(new Set([1, { x: 1 }]), new Set([{ x: 1 }, 1]))).to.be.true
            expect(isEqual(new Set([1, 2]), new Set([1, 3]))).to.be.false
            expect(isEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).to.be.true
            expect(isEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).to.be.false
        })

        it("requires matching prototypes", () => {
            expect(isEqual(new Point(1, 2), new Point(1, 2))).to.be.true
            expect(isEqual(new Point(1, 2), { x: 1, y: 2 })).to.be.false
        })

        it("handles circular references", () => {
            const a: Record<string, unknown> = { v: 1 }
            const b: Record<string, unknown> = { v: 1 }
            a.self = a
            b.self = b
            expect(isEqual(a, b)).to.be.true
        })
    })

    describe("isEmpty", () => {
        it("treats nullish, empty strings, arrays, maps, sets and objects as empty", () => {
            const values = [null, undefined, "", [], {}, new Map(), new Set(), Object.create(null)]
            values.forEach((value, index) => expect(isEmpty(value), `values[${index}]`).to.be.true)
        })

        it("treats values with content, numbers, booleans and dates as non-empty", () => {
            const values = [" ", [0], { a: undefined }, new Map([[1, 1]]), 0, false, new Date(), () => 1]
            values.forEach((value, index) => expect(isEmpty(value), `values[${index}]`).to.be.false)
        })
    })

    describe("omitNullish", () => {
        it("removes null and undefined but keeps other falsy values", () => {
            expect(omitNullish({ a: 1, b: null, c: undefined, d: 0, e: false, f: "" })).to.deep.equal({
                a: 1,
                d: 0,
                e: false,
                f: "",
            })
        })

        it("optionally removes empty strings", () => {
            expect(omitNullish({ q: "", page: 1, sort: null }, { emptyStrings: true })).to.deep.equal({ page: 1 })
        })
    })

    describe("deepCamelCaseKeys / deepSnakeCaseKeys", () => {
        const apiResponse = {
            user_id: 1,
            first_name: "Asha",
            home_address: { zip_code: "400001", geo_location: { lat_value: 19.07 } },
            order_items: [{ item_id: 9, unit_price: 100 }],
            created_at: new Date(0),
            _id: "abc",
            __typename: "User",
            tags: ["keep_this_value"],
        }

        it("camelCases keys at every depth, including inside arrays", () => {
            expect(deepCamelCaseKeys(apiResponse)).to.deep.equal({
                userId: 1,
                firstName: "Asha",
                homeAddress: { zipCode: "400001", geoLocation: { latValue: 19.07 } },
                orderItems: [{ itemId: 9, unitPrice: 100 }],
                createdAt: new Date(0),
                _id: "abc",
                __typename: "User",
                tags: ["keep_this_value"],
            })
        })

        it("leaves values (strings, dates) untouched", () => {
            const result = deepCamelCaseKeys<{ createdAt: Date; tags: string[] }>(apiResponse)
            expect(result.createdAt).to.equal(apiResponse.created_at)
            expect(result.tags[0]).to.equal("keep_this_value")
        })

        it("handles kebab-case keys and already camelCased keys", () => {
            expect(deepCamelCaseKeys({ "content-type": "json", alreadyCamel: 1, userID: 2 })).to.deep.equal({
                contentType: "json",
                alreadyCamel: 1,
                userID: 2,
            })
        })

        it("snake_cases keys at every depth", () => {
            expect(
                deepSnakeCaseKeys({
                    userId: 1,
                    homeAddress: { zipCode: "400001" },
                    orderItems: [{ itemId: 9 }],
                    XMLHttpRequest: 3,
                    addressLine1: "x",
                    _id: "x",
                })
            ).to.deep.equal({
                user_id: 1,
                home_address: { zip_code: "400001" },
                order_items: [{ item_id: 9 }],
                xml_http_request: 3,
                address_line1: "x",
                _id: "x",
            })
        })

        it("treats acronyms as a single word", () => {
            expect(deepSnakeCaseKeys({ userID: 2, apiURL: "u" })).to.deep.equal({ user_id: 2, api_url: "u" })
        })

        it("round-trips typical snake_case payloads", () => {
            const payload = { user_id: 1, address: { street_name: "MG Road" }, items: [{ sku_code: "A" }] }
            expect(deepSnakeCaseKeys(deepCamelCaseKeys(payload))).to.deep.equal(payload)
        })

        it("passes primitives and arrays of primitives through", () => {
            expect(deepCamelCaseKeys(5)).to.equal(5)
            expect(deepCamelCaseKeys(["a_b"])).to.deep.equal(["a_b"])
            expect(deepCamelCaseKeys(null)).to.equal(null)
        })
    })
})
