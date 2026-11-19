import { expect } from "chai"
import {
    camelCase,
    escapeHtml,
    getInitials,
    kebabCase,
    mask,
    maskEmail,
    pascalCase,
    pluralize,
    randomString,
    slugify,
    snakeCase,
    titleCase,
    truncate,
    unescapeHtml,
} from "../src/index"

describe("string helpers", () => {
    describe("case conversion", () => {
        const cases: Array<[string, { camel: string; pascal: string; snake: string; kebab: string; title: string }]> = [
            [
                "user_first_name",
                {
                    camel: "userFirstName",
                    pascal: "UserFirstName",
                    snake: "user_first_name",
                    kebab: "user-first-name",
                    title: "User First Name",
                },
            ],
            [
                "userFirstName",
                {
                    camel: "userFirstName",
                    pascal: "UserFirstName",
                    snake: "user_first_name",
                    kebab: "user-first-name",
                    title: "User First Name",
                },
            ],
            [
                "XMLHttpRequest",
                {
                    camel: "xmlHttpRequest",
                    pascal: "XmlHttpRequest",
                    snake: "xml_http_request",
                    kebab: "xml-http-request",
                    title: "Xml Http Request",
                },
            ],
            [
                "  Hello,   World! ",
                { camel: "helloWorld", pascal: "HelloWorld", snake: "hello_world", kebab: "hello-world", title: "Hello World" },
            ],
            [
                "ORDER-STATUS",
                {
                    camel: "orderStatus",
                    pascal: "OrderStatus",
                    snake: "order_status",
                    kebab: "order-status",
                    title: "Order Status",
                },
            ],
            [
                "version2Update",
                {
                    camel: "version2Update",
                    pascal: "Version2Update",
                    snake: "version2_update",
                    kebab: "version2-update",
                    title: "Version2 Update",
                },
            ],
            [
                "don't stop",
                { camel: "dontStop", pascal: "DontStop", snake: "dont_stop", kebab: "dont-stop", title: "Dont Stop" },
            ],
            [
                "crème brûlée",
                {
                    camel: "crèmeBrûlée",
                    pascal: "CrèmeBrûlée",
                    snake: "crème_brûlée",
                    kebab: "crème-brûlée",
                    title: "Crème Brûlée",
                },
            ],
        ]

        cases.forEach(([input, expected]) => {
            it(`converts ${JSON.stringify(input)}`, () => {
                expect(camelCase(input)).to.equal(expected.camel)
                expect(pascalCase(input)).to.equal(expected.pascal)
                expect(snakeCase(input)).to.equal(expected.snake)
                expect(kebabCase(input)).to.equal(expected.kebab)
                expect(titleCase(input)).to.equal(expected.title)
            })
        })

        it("returns an empty string for empty or non-string input", () => {
            for (const fn of [camelCase, pascalCase, snakeCase, kebabCase, titleCase]) {
                expect(fn("")).to.equal("")
                expect(fn("___")).to.equal("")
                expect(fn(undefined as unknown as string)).to.equal("")
                expect(fn(42 as unknown as string)).to.equal("")
            }
        })
    })

    describe("truncate", () => {
        it("leaves short text unchanged", () => {
            expect(truncate("Hello", 5)).to.equal("Hello")
            expect(truncate("Hello", 10)).to.equal("Hello")
        })

        it("truncates including the omission in the max length", () => {
            const result = truncate("The quick brown fox", 12)
            expect(result).to.equal("The quick...")
            expect(result).to.have.length(12)
        })

        it("can avoid cutting words in half", () => {
            expect(truncate("The quick brown fox", 14)).to.equal("The quick b...")
            expect(truncate("The quick brown fox", 14, { wordBoundary: true })).to.equal("The quick...")
            expect(truncate("Supercalifragilistic", 10, { wordBoundary: true })).to.equal("Superca...")
        })

        it("supports a custom omission", () => {
            expect(truncate("The quick brown fox", 10, { omission: "…" })).to.equal("The quick…")
        })

        it("never splits surrogate pairs", () => {
            expect(truncate("😀😀😀😀😀", 4)).to.equal("😀...")
        })

        it("handles a max length shorter than the omission and non-string input", () => {
            expect(truncate("Hello world", 2)).to.equal("..")
            expect(truncate(null as unknown as string, 5)).to.equal("")
        })
    })

    describe("slugify", () => {
        it("creates URL-friendly slugs", () => {
            expect(slugify("  Hello, World! Café 2023 ")).to.equal("hello-world-cafe-2023")
            expect(slugify("Ünïcödé Straße & Æsir")).to.equal("unicode-strasse-aesir")
            expect(slugify("--Already--slugged--")).to.equal("already-slugged")
        })

        it("supports a custom separator, including regex characters", () => {
            expect(slugify("Hello World", "_")).to.equal("hello_world")
            expect(slugify("Hello World", ".")).to.equal("hello.world")
        })

        it("returns an empty string when nothing slug-worthy remains", () => {
            expect(slugify("!!!")).to.equal("")
            expect(slugify(undefined as unknown as string)).to.equal("")
        })
    })

    describe("getInitials", () => {
        it("uses the first letters of the first and last words", () => {
            expect(getInitials("John Ronald Tolkien")).to.equal("JT")
            expect(getInitials("  asha   patel ")).to.equal("AP")
            expect(getInitials("madonna")).to.equal("M")
        })

        it("handles empty and non-string input", () => {
            expect(getInitials("")).to.equal("")
            expect(getInitials("   ")).to.equal("")
            expect(getInitials(null as unknown as string)).to.equal("")
        })
    })

    describe("escapeHtml / unescapeHtml", () => {
        it("escapes the five significant characters", () => {
            expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).to.equal(
                "&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;"
            )
        })

        it("round-trips", () => {
            const html = `<script>alert("x & y")</script>`
            expect(unescapeHtml(escapeHtml(html))).to.equal(html)
        })

        it("does not double-unescape", () => {
            expect(unescapeHtml("&amp;lt;")).to.equal("&lt;")
        })

        it("returns an empty string for non-string input", () => {
            expect(escapeHtml(undefined as unknown as string)).to.equal("")
            expect(unescapeHtml(undefined as unknown as string)).to.equal("")
        })
    })

    describe("mask", () => {
        it("shows the last 4 characters by default", () => {
            expect(mask("9876543210")).to.equal("******3210")
            expect(mask(9876543210)).to.equal("******3210")
        })

        it("supports visible prefix, suffix and mask character", () => {
            expect(mask("4111111111111111", { visibleStart: 4, visibleEnd: 4 })).to.equal("4111********1111")
            expect(mask("secret", { visibleEnd: 0, maskChar: "#" })).to.equal("######")
        })

        it("returns short values unchanged", () => {
            expect(mask("123", { visibleEnd: 4 })).to.equal("123")
            expect(mask(null as unknown as string)).to.equal("")
        })
    })

    describe("maskEmail", () => {
        it("masks the local part but keeps the domain", () => {
            expect(maskEmail("john.doe@gmail.com")).to.equal("j******e@gmail.com")
            expect(maskEmail("ab@x.com")).to.equal("a*@x.com")
            expect(maskEmail("a@x.com")).to.equal("*@x.com")
        })

        it("fully masks values that are not emails", () => {
            expect(maskEmail("nodomain")).to.equal("********")
            expect(maskEmail(undefined as unknown as string)).to.equal("")
        })
    })

    describe("pluralize", () => {
        it("returns the singular form for a count of one", () => {
            expect(pluralize("item", 1)).to.equal("item")
            expect(pluralize("item", -1)).to.equal("item")
        })

        it("applies simple English plural rules", () => {
            expect(pluralize("item", 0)).to.equal("items")
            expect(pluralize("box", 2)).to.equal("boxes")
            expect(pluralize("church", 2)).to.equal("churches")
            expect(pluralize("city", 2)).to.equal("cities")
            expect(pluralize("day", 2)).to.equal("days")
        })

        it("supports irregular plurals and including the count", () => {
            expect(pluralize("person", 2, { plural: "people" })).to.equal("people")
            expect(pluralize("city", 3, { inclusive: true })).to.equal("3 cities")
            expect(pluralize("order", 1, { inclusive: true })).to.equal("1 order")
        })
    })

    describe("randomString", () => {
        it("generates strings of the requested length from the alphabet", () => {
            expect(randomString()).to.match(/^[A-Za-z0-9]{16}$/)
            expect(randomString(6, "0123456789")).to.match(/^\d{6}$/)
            expect(randomString(0)).to.equal("")
        })

        it("produces different values", () => {
            const values = new Set(Array.from({ length: 50 }, () => randomString(12)))
            expect(values.size).to.equal(50)
        })

        it("uses every character of the alphabet", () => {
            const seen = new Set(randomString(2000, "abc").split(""))
            expect(seen.size).to.equal(3)
        })

        it("throws for an empty alphabet", () => {
            expect(() => randomString(4, "")).to.throw(RangeError)
        })
    })
})
