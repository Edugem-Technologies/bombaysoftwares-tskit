import { expect } from "chai"
import {
    chunk,
    compact,
    difference,
    groupBy,
    intersection,
    keyBy,
    partition,
    range,
    sample,
    shuffle,
    sortBy,
    sum,
    uniqueBy,
} from "../src/index"

describe("array helpers", () => {
    describe("range", () => {
        it("counts from 0 with a single argument", () => {
            expect(range(4)).to.deep.equal([0, 1, 2, 3])
            expect(range(0)).to.deep.equal([])
        })

        it("supports start, end and step", () => {
            expect(range(1, 5)).to.deep.equal([1, 2, 3, 4])
            expect(range(0, 20, 5)).to.deep.equal([0, 5, 10, 15])
            expect(range(0, 1, 0.25)).to.deep.equal([0, 0.25, 0.5, 0.75])
        })

        it("counts down when end < start", () => {
            expect(range(5, 0)).to.deep.equal([5, 4, 3, 2, 1])
            expect(range(0, -6, -2)).to.deep.equal([0, -2, -4])
        })

        it("returns an empty array when the step points away from end, or for NaN", () => {
            expect(range(0, 5, -1)).to.deep.equal([])
            expect(range(NaN)).to.deep.equal([])
        })

        it("does not accumulate floating point error", () => {
            const values = range(0, 1, 0.1)
            expect(values).to.have.length(10)
            expect(values[3]).to.equal(0.30000000000000004) // 3 * 0.1, not 0.1 + 0.1 + 0.1
        })

        it("throws for a zero step", () => {
            expect(() => range(0, 5, 0)).to.throw(RangeError)
        })
    })

    describe("chunk", () => {
        it("splits into chunks with a shorter final chunk", () => {
            expect(chunk([1, 2, 3, 4, 5], 2)).to.deep.equal([[1, 2], [3, 4], [5]])
            expect(chunk([1, 2, 3, 4], 2)).to.deep.equal([
                [1, 2],
                [3, 4],
            ])
            expect(chunk([1, 2], 5)).to.deep.equal([[1, 2]])
            expect(chunk([], 3)).to.deep.equal([])
        })

        it("throws for a non-positive or non-integer size", () => {
            expect(() => chunk([1], 0)).to.throw(RangeError)
            expect(() => chunk([1], -1)).to.throw(RangeError)
            expect(() => chunk([1], 1.5)).to.throw(RangeError)
        })
    })

    describe("groupBy", () => {
        const people = [
            { name: "Asha", role: "admin" },
            { name: "Ravi", role: "member" },
            { name: "Meera", role: "admin" },
        ]

        it("groups items by key in first-occurrence order", () => {
            const grouped = groupBy(people, (p) => p.role)
            expect(Object.keys(grouped)).to.deep.equal(["admin", "member"])
            expect(grouped.admin.map((p) => p.name)).to.deep.equal(["Asha", "Meera"])
            expect(grouped.member.map((p) => p.name)).to.deep.equal(["Ravi"])
        })

        it("supports numeric keys and passes the index", () => {
            expect(groupBy([10, 11, 12, 13], (n) => n % 2)).to.deep.equal({ 0: [10, 12], 1: [11, 13] })
            expect(groupBy(["a", "b", "c"], (_, index) => (index < 2 ? "first" : "rest"))).to.deep.equal({
                first: ["a", "b"],
                rest: ["c"],
            })
        })

        it("is safe against prototype pollution keys", () => {
            const grouped = groupBy(["x", "y"], () => "__proto__")
            expect(Object.prototype.hasOwnProperty.call(grouped, "__proto__")).to.be.true
            expect((grouped as Record<string, string[]>)["__proto__"]).to.deep.equal(["x", "y"])
            expect(Object.getPrototypeOf(grouped)).to.equal(Object.prototype)
            expect(({} as Record<string, unknown>).x).to.be.undefined
        })
    })

    describe("keyBy", () => {
        it("indexes items by key; later items win", () => {
            const users = [
                { id: 1, name: "A" },
                { id: 2, name: "B" },
                { id: 1, name: "C" },
            ]
            expect(keyBy(users, (u) => u.id)).to.deep.equal({ 1: { id: 1, name: "C" }, 2: { id: 2, name: "B" } })
        })
    })

    describe("uniqueBy", () => {
        it("keeps the first occurrence of each key", () => {
            const items = [
                { id: 1, v: "a" },
                { id: 2, v: "b" },
                { id: 1, v: "c" },
            ]
            expect(uniqueBy(items, (i) => i.id)).to.deep.equal([
                { id: 1, v: "a" },
                { id: 2, v: "b" },
            ])
        })

        it("handles mixed types and NaN (SameValueZero)", () => {
            expect(uniqueBy([1, "1", 1, NaN, NaN], (x) => x)).to.deep.equal([1, "1", NaN])
        })
    })

    describe("partition", () => {
        it("splits into passing and failing groups", () => {
            expect(partition([1, 2, 3, 4, 5], (n) => n % 2 === 0)).to.deep.equal([
                [2, 4],
                [1, 3, 5],
            ])
            expect(partition([], () => true)).to.deep.equal([[], []])
        })

        it("narrows types with a type guard", () => {
            const [strings, numbers] = partition<string | number, string>(
                ["a", 1, "b", 2],
                (v): v is string => typeof v === "string"
            )
            const upper: string[] = strings.map((s) => s.toUpperCase())
            const doubled: number[] = numbers.map((n) => n * 2)
            expect(upper).to.deep.equal(["A", "B"])
            expect(doubled).to.deep.equal([2, 4])
        })
    })

    describe("sortBy", () => {
        const users = [
            { name: "Ravi", age: 30, joined: new Date(2021, 0, 1) },
            { name: "Asha", age: 25, joined: new Date(2020, 0, 1) },
            { name: "Meera", age: 30, joined: new Date(2019, 0, 1) },
            { name: "Dev", age: 25, joined: new Date(2022, 0, 1) },
        ]

        it("sorts ascending by a selector without mutating the input", () => {
            const original = users.slice()
            expect(sortBy(users, (u) => u.name).map((u) => u.name)).to.deep.equal(["Asha", "Dev", "Meera", "Ravi"])
            expect(users).to.deep.equal(original)
        })

        it("supports multiple criteria and descending order", () => {
            const sorted = sortBy(users, (u) => u.age, { by: (u) => u.joined, order: "desc" })
            expect(sorted.map((u) => u.name)).to.deep.equal(["Dev", "Asha", "Ravi", "Meera"])
        })

        it("is stable for equal keys", () => {
            expect(sortBy(users, (u) => u.age).map((u) => u.name)).to.deep.equal(["Asha", "Dev", "Ravi", "Meera"])
        })

        it("sorts primitives by identity when no criteria are given", () => {
            expect(sortBy([3, 1, 10, 2])).to.deep.equal([1, 2, 3, 10])
            expect(sortBy(["b", "a", "C"])).to.deep.equal(["C", "a", "b"])
        })

        it("places null, undefined and NaN last in both directions", () => {
            const values = [{ v: 2 }, { v: null }, { v: 1 }, { v: undefined }, { v: NaN }, { v: 3 }]
            expect(sortBy(values, (x) => x.v).map((x) => x.v)).to.deep.equal([1, 2, 3, null, undefined, NaN])
            expect(sortBy(values, { by: (x) => x.v, order: "desc" }).map((x) => x.v)).to.deep.equal([
                3,
                2,
                1,
                null,
                undefined,
                NaN,
            ])
        })
    })

    describe("sum", () => {
        it("sums numbers or selected values", () => {
            expect(sum([1, 2, 3])).to.equal(6)
            expect(sum([])).to.equal(0)
            const cart = [
                { price: 100, qty: 2 },
                { price: 50, qty: 1 },
            ]
            expect(sum(cart, (item) => item.price * item.qty)).to.equal(250)
        })
    })

    describe("shuffle", () => {
        it("returns a permutation without mutating the input", () => {
            const input = range(50)
            const shuffled = shuffle(input)
            expect(input).to.deep.equal(range(50))
            expect(shuffled).to.have.length(50)
            expect(sortBy(shuffled)).to.deep.equal(input)
        })

        it("produces different orders across calls", () => {
            const input = range(20)
            const orders = new Set(range(10).map(() => shuffle(input).join(",")))
            expect(orders.size).to.be.greaterThan(1)
        })

        it("handles empty and single-element arrays", () => {
            expect(shuffle([])).to.deep.equal([])
            expect(shuffle([1])).to.deep.equal([1])
        })
    })

    describe("sample", () => {
        it("returns an element of the array, or undefined when empty", () => {
            const input = ["a", "b", "c"]
            for (let i = 0; i < 20; i++) expect(input).to.include(sample(input))
            expect(sample([])).to.be.undefined
        })
    })

    describe("difference / intersection", () => {
        it("difference keeps items not in values, preserving order and duplicates", () => {
            expect(difference([1, 2, 3, 4, 2], [2, 4])).to.deep.equal([1, 3])
            expect(difference([1, 1, 3], [])).to.deep.equal([1, 1, 3])
        })

        it("intersection returns unique shared items in the order of the first array", () => {
            expect(intersection([3, 1, 2, 2, 3], [2, 3, 4])).to.deep.equal([3, 2])
            expect(intersection([1, 2], [3])).to.deep.equal([])
        })
    })

    describe("compact", () => {
        it("removes all falsy values", () => {
            expect(compact([0, 1, false, 2, "", 3, null, undefined, NaN, "a"])).to.deep.equal([1, 2, 3, "a"])
        })

        it("narrows the element type", () => {
            const names: string[] = compact(["a", null, "b", undefined])
            expect(names).to.deep.equal(["a", "b"])
        })
    })
})
