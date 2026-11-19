import { expect } from "chai"
import * as tskit from "../src/index"

// Snapshot of the public API. Removing or renaming an export is a breaking change for consumers,
// and internal helpers must never leak out, so any change here should be deliberate.
const LEGACY_EXPORTS = [
    "camelCaseKeys",
    "dateAndTimeFormat",
    "dateFormat",
    "dateFormatHHMM",
    "evalBooleanValue",
    "formatDuration",
    "formatTextToCapitalized",
    "formatTimestamp",
    "formatTimestampToDateMonthYearString",
    "formatTimestampToDateString",
    "getArray",
    "getCurrentDate",
    "getCurrentDateTime",
    "getCurrentTimestamp",
    "getDateTimeFromTimestamp",
    "getDayFromDate",
    "getLocalDate",
    "getLocalDateHHMM",
    "getRandomColor",
    "getTextFromHtml",
    "getTwodigitFormat",
    "getUniqueValueFromArray",
    "getUnixConvertedDateTime",
    "getUnixConvertedIsoString",
    "handleCopyToClipboard",
    "isSet",
    "isSetNumber",
    "isSetObject",
    "isValidJsonData",
    "millisToMinutesAndSeconds",
    "strToDate",
    "tweleveHourFormat",
    "underscoreToCapitalizedText",
]

const NEW_EXPORTS: Record<string, string[]> = {
    array: [
        "chunk",
        "compact",
        "difference",
        "groupBy",
        "intersection",
        "keyBy",
        "partition",
        "range",
        "sample",
        "shuffle",
        "sortBy",
        "sum",
        "uniqueBy",
    ],
    async: ["TimeoutError", "debounce", "mapConcurrent", "memoize", "once", "retry", "sleep", "throttle", "tryCatch", "withTimeout"],
    date: [
        "addTime",
        "dateDiff",
        "endOf",
        "formatDate",
        "getAge",
        "getDaysInMonth",
        "getRelativeTime",
        "isLeapYear",
        "isSameDay",
        "isToday",
        "isTomorrow",
        "isValidDate",
        "isWeekend",
        "isYesterday",
        "startOf",
        "toDate",
    ],
    number: ["clamp", "formatBytes", "formatCompactNumber", "formatCurrency", "formatNumber", "ordinal", "randomInt", "roundTo"],
    object: [
        "deepCamelCaseKeys",
        "deepClone",
        "deepMerge",
        "deepSnakeCaseKeys",
        "get",
        "isEmpty",
        "isEqual",
        "isPlainObject",
        "omit",
        "omitNullish",
        "pick",
    ],
    string: [
        "camelCase",
        "escapeHtml",
        "getInitials",
        "kebabCase",
        "mask",
        "maskEmail",
        "pascalCase",
        "pluralize",
        "randomString",
        "slugify",
        "snakeCase",
        "titleCase",
        "truncate",
        "unescapeHtml",
    ],
    url: ["buildUrl", "parseQueryString", "toQueryString"],
    validation: [
        "isAadhaar",
        "isEmail",
        "isGSTIN",
        "isHexColor",
        "isIFSC",
        "isIndianMobileNumber",
        "isNumeric",
        "isPAN",
        "isPincode",
        "isUUID",
        "isUrl",
    ],
}

describe("public API", () => {
    it("keeps every pre-existing export", () => {
        LEGACY_EXPORTS.forEach((name) => expect(tskit, name).to.have.property(name))
    })

    it("exports exactly the documented helpers and nothing internal", () => {
        const expected = LEGACY_EXPORTS.concat(...Object.keys(NEW_EXPORTS).map((module) => NEW_EXPORTS[module])).sort()
        expect(Object.keys(tskit).sort()).to.deep.equal(expected)
    })

    it("exports functions (and the TimeoutError class) only", () => {
        Object.keys(tskit).forEach((name) =>
            expect(typeof (tskit as Record<string, unknown>)[name], name).to.equal("function")
        )
    })
})
