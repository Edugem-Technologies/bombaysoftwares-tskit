# tskit

The @bombaysoftwares/tskit package provides a comprehensive set of utility functions for various operations in JavaScript and TypeScript: date formatting and arithmetic, timestamp conversion, async control flow (debounce, throttle, retry), array and object manipulation, string case conversion, number and currency formatting, URL query strings, and validation, including Indian identifiers such as PAN, GSTIN, IFSC and Aadhaar.

- Zero runtime dependencies
- Fully typed, works in Node.js, browsers and React Native
- Inputs are never mutated

## Installation

```bash
npm i @bombaysoftwares/tskit
```

## Usage

Import the desired functions from the package:

```ts
import { formatDate, debounce, groupBy, formatCurrency, isGSTIN } from "@bombaysoftwares/tskit";
```

### Conventions

- **Numeric timestamps are Unix timestamps in seconds** everywhere in this package (e.g. `1695193213`), matching `getCurrentTimestamp()`. Date helpers accept a `Date`, a Unix timestamp in seconds, or an ISO string. Date-only strings such as `"2024-03-15"` are read as local midnight.
- **Indian defaults**: number and currency formatters default to the `en-IN` locale and `INR`, so grouping uses lakhs and crores (`12,34,567`). Pass `locale` / `currency` to change this.
- Helpers that receive bad *data* return `null`, `""` or `false`. Helpers that receive bad *arguments* (e.g. a chunk size of `0`, an unknown time zone) throw.

## Contents

| Category | Helpers |
|---|---|
| [Dates](#dates) | `formatDate`, `getRelativeTime`, `addTime`, `dateDiff`, `startOf`, `endOf`, `isSameDay`, `isToday`, `isYesterday`, `isTomorrow`, `isWeekend`, `getAge`, `getDaysInMonth`, `isLeapYear`, `isValidDate`, `toDate` + [existing date helpers](#existing-date-helpers) |
| [Async](#async) | `debounce`, `throttle`, `retry`, `withTimeout`, `TimeoutError`, `sleep`, `once`, `memoize`, `tryCatch`, `mapConcurrent` |
| [Arrays](#arrays) | `range`, `chunk`, `groupBy`, `keyBy`, `uniqueBy`, `partition`, `sortBy`, `sum`, `shuffle`, `sample`, `difference`, `intersection`, `compact`, `getArray`, `getUniqueValueFromArray` |
| [Objects](#objects) | `pick`, `omit`, `get`, `deepClone`, `deepMerge`, `isEqual`, `isEmpty`, `isPlainObject`, `omitNullish`, `deepCamelCaseKeys`, `deepSnakeCaseKeys`, `camelCaseKeys` |
| [Strings](#strings) | `camelCase`, `pascalCase`, `snakeCase`, `kebabCase`, `titleCase`, `truncate`, `slugify`, `getInitials`, `escapeHtml`, `unescapeHtml`, `mask`, `maskEmail`, `pluralize`, `randomString`, `formatTextToCapitalized`, `underscoreToCapitalizedText`, `getTextFromHtml` |
| [Numbers](#numbers) | `formatNumber`, `formatCurrency`, `formatCompactNumber`, `formatBytes`, `roundTo`, `clamp`, `randomInt`, `ordinal` |
| [URLs](#urls) | `toQueryString`, `parseQueryString`, `buildUrl` |
| [Validation](#validation) | `isEmail`, `isUrl`, `isUUID`, `isHexColor`, `isNumeric`, `isIndianMobileNumber`, `isPAN`, `isGSTIN`, `isIFSC`, `isPincode`, `isAadhaar`, `isSet`, `isSetNumber`, `isSetObject`, `isValidJsonData`, `evalBooleanValue` |

---

## Dates

### formatDate

Formats a date using tokens, optionally in a specific IANA time zone. Text inside `[brackets]` is output literally. Returns `null` for invalid dates.

| Token | Output | Token | Output |
|---|---|---|---|
| `YYYY` / `YY` | 2024 / 24 | `HH` / `H` | 09 / 9 (24-hour) |
| `MMMM` / `MMM` | March / Mar | `hh` / `h` | 09 / 9 (12-hour) |
| `MM` / `M` | 03 / 3 | `mm` / `m` | 05 / 5 |
| `DD` / `D` | 05 / 5 | `ss` / `s` | 07 / 7 |
| `dddd` / `ddd` | Tuesday / Tue | `SSS` | 042 |
| `A` / `a` | PM / pm | `Z` | +05:30 |

```ts
formatDate(new Date(2024, 2, 5, 14, 7), "DD-MMM-YYYY hh:mm A"); // "05-Mar-2024 02:07 PM"
formatDate(1695193213, "YYYY-MM-DD HH:mm", { timeZone: "Asia/Kolkata" }); // "2023-09-20 12:30"
formatDate("2024-03-05", "dddd, D MMMM [at] h a"); // "Tuesday, 5 March at 12 am"
```

### getRelativeTime

```ts
getRelativeTime(addTime(new Date(), -5, "minutes")); // "5 minutes ago"
getRelativeTime(addTime(new Date(), 2, "days"));     // "in 2 days"
getRelativeTime(1695193213, { now: someDate });      // relative to a custom reference
```

### Date arithmetic

`addTime` and `dateDiff` support `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `weeks`, `months` and `years`. Calendar units are DST-safe, and month arithmetic clamps to the end of the month.

```ts
addTime(new Date(2024, 0, 31), 1, "months");                 // 29 Feb 2024
addTime(new Date(), -7, "days");                             // one week ago
dateDiff(new Date(2024, 0, 10), new Date(2024, 0, 1));       // 9 (full days)
dateDiff("2024-06-15", "2000-06-16", "years");               // 23
startOf(new Date(), "week");                                 // Monday 00:00 (pass { weekStartsOn: 0 } for Sunday)
endOf(new Date(2024, 1, 10), "month");                       // 29 Feb 2024 23:59:59.999
```

### Date predicates and info

```ts
isToday(date); isYesterday(date); isTomorrow(date); isWeekend(date);
isSameDay(new Date(2024, 0, 1, 9), new Date(2024, 0, 1, 23)); // true
getAge("1990-06-15");          // age in full years (null if invalid or in the future)
getDaysInMonth(new Date(2024, 1, 1)); // 29
isLeapYear(2024);              // true
isValidDate(new Date("x"));    // false
toDate(1695193213);            // Date (seconds → Date)
```

### Existing date helpers

#### getCurrentDateTime

Returns the current date and time in the format "YYYY-MM-DD HH:MM:SS".

```ts
getCurrentDateTime(); // "2023-06-20 12:22:20"
```

#### getDateTimeFromTimestamp

Formats a timestamp into a string representation of date and time. You can choose whether to include seconds in the formatted string.

```ts
getDateTimeFromTimestamp(1695193213); // "20-Sep-2023 12:30:13"
```

#### Other date functions

- `getCurrentTimestamp(date?: Date | null): number`: the current (or given) time as a Unix timestamp in seconds.
- `getCurrentDate(): string`: the current date in `YYYY-MM-DD` format.
- `dateAndTimeFormat(dateObject: Date, showSeconds = true): string | null`: formats a Date as `DD-Mmm-YYYY HH:mm[:ss]`.
- `dateFormat(dateObject: Date): string | null`: formats a Date as `DD-Mmm-YYYY`.
- `dateFormatHHMM(dateObject: Date): string | null`: formats a Date as `DD-Mmm-YYYY, HH:mm`.
- `getLocalDate(dateAndTime: string)` / `getLocalDateHHMM(dateAndTime: string)`: parse a date string and format it as `DD-Mmm-YYYY` / `DD-Mmm-YYYY, HH:mm`.
- `getUnixConvertedDateTime({ timestamp?, dateObj? })`: `YYYY-MM-DD hh:mm:ss AM/PM`.
- `getUnixConvertedIsoString(timestamp: number): string`: ISO string for a Unix timestamp.
- `formatTimestamp(timestamp: number): string`: `DD-MM-YYYY HH:mm` in UTC.
- `formatTimestampToDateString(timestamp)` / `formatTimestampToDateMonthYearString(timestamp)`: `DD/MM/YYYY` / `DD Mmm, YYYY` in IST.
- `getDayFromDate(dateString: string): string`: weekday name from a `DD-MMM-YYYY`, `DD/MM/YYYY` or `DD/MMM/YYYY` string.
- `strToDate(dateString: string, format: string): Date | null`: parses a date string using a `DD`/`MM`/`MMM`/`YYYY` format.
- `getTwodigitFormat(data: number)`, `tweleveHourFormat(hours: number)`: formatting helpers.
- `formatDuration(totalSeconds: number | null): string`: `"1hr 1min 1sec"`.
- `millisToMinutesAndSeconds(millis: number): string`: `"2:03.456"`.

---

## Async

```ts
// Debounce: run once the user stops typing for 300ms
const onSearch = debounce((query: string) => fetchResults(query), 300);
onSearch.cancel(); onSearch.flush(); onSearch.pending();

// Throttle: run at most once every 100ms
const onScroll = throttle(() => updatePosition(), 100);

// Retry with exponential backoff (defaults: 3 retries, 1s delay, factor 2, max 30s)
const user = await retry(() => api.getUser(id), {
  retries: 3,
  delay: 500,
  shouldRetry: (error) => error.status >= 500,
  onRetry: (error, attempt) => console.warn(`attempt ${attempt} failed`),
});

// Timeouts
try {
  await withTimeout(fetch(url), 5000);
} catch (error) {
  if (error instanceof TimeoutError) showToast("Request timed out");
}

// Go-style error handling
const [error, data] = await tryCatch(api.getUser(id));

// Limit concurrency (results keep input order)
const uploaded = await mapConcurrent(files, (file) => upload(file), 3);

// Misc
await sleep(500);
const init = once(() => setupAnalytics());
const getUser = memoize((id: number) => api.getUser(id)); // failed promises are evicted from the cache
```

---

## Arrays

```ts
range(5);                                  // [0, 1, 2, 3, 4]
range(1, 10, 3);                           // [1, 4, 7]
chunk([1, 2, 3, 4, 5], 2);                 // [[1, 2], [3, 4], [5]]
groupBy(users, (u) => u.role);             // { admin: [...], member: [...] }
keyBy(users, (u) => u.id);                 // { 1: {...}, 2: {...} }
uniqueBy(items, (item) => item.id);        // first occurrence of each id
partition([1, 2, 3, 4], (n) => n % 2 === 0); // [[2, 4], [1, 3]]
sortBy(users, (u) => u.role, { by: (u) => u.createdAt, order: "desc" }); // stable, nullish last
sum(cart, (item) => item.price * item.qty);
shuffle(array); sample(array);
difference([1, 2, 3], [2]);                // [1, 3]
intersection([1, 2, 3], [2, 3, 4]);        // [2, 3]
compact([0, 1, null, 2, "", undefined]);   // [1, 2]
```

### getArray

Generates an array of numbers from 1 to the specified length.

```ts
getArray(5); // [1, 2, 3, 4, 5]
```

### getUniqueValueFromArray

Returns unique values from an array of a single data type, preserving order. Use `uniqueBy` for objects or mixed types.

```ts
getUniqueValueFromArray(["a", "b", "a", "c", "b"]); // ["a", "b", "c"]
```

---

## Objects

```ts
pick(user, ["id", "name"]);
omit(user, ["password"]);
get(response, "data.items[0].title", "Untitled");
deepClone(value);           // Date, Map, Set, RegExp, typed arrays, circular refs; works without structuredClone
deepMerge(defaults, overrides); // nested merge, arrays replaced, undefined ignored, prototype-pollution safe
isEqual(a, b);              // deep equality
isEmpty(value);             // null/undefined, "", [], {}, empty Map/Set
isPlainObject(value);
omitNullish({ name: "A", email: null, age: 0 });   // { name: "A", age: 0 }
omitNullish(formValues, { emptyStrings: true });    // also drops ""

// API payload key conversion (deep, including arrays)
const user = deepCamelCaseKeys<User>({ user_id: 1, home_address: { zip_code: "400001" } });
// { userId: 1, homeAddress: { zipCode: "400001" } }
deepSnakeCaseKeys({ userId: 1 }); // { user_id: 1 }
```

`camelCaseKeys(obj)` (shallow, snake_case only) is still available. Prefer `deepCamelCaseKeys` for nested payloads.

---

## Strings

```ts
camelCase("user_first_name");     // "userFirstName"
pascalCase("user first name");    // "UserFirstName"
snakeCase("userFirstName");       // "user_first_name"
kebabCase("XMLHttpRequest");      // "xml-http-request"
titleCase("order_status");        // "Order Status"
truncate("The quick brown fox", 12);                        // "The quick..."
truncate("The quick brown fox", 14, { wordBoundary: true }); // "The quick..."
slugify("Hello, World! Café");    // "hello-world-cafe"
getInitials("Asha Patel");        // "AP"
escapeHtml("<b>Tom & Jerry</b>"); // "&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;"
mask("9876543210");               // "******3210"
mask("4111111111111111", { visibleStart: 4, visibleEnd: 4 }); // "4111********1111"
maskEmail("john.doe@gmail.com");  // "j******e@gmail.com"
pluralize("city", 3, { inclusive: true }); // "3 cities"
randomString(8);                  // e.g. "aZ3kQ9xB" (uses Web Crypto when available)
```

### formatTextToCapitalized

```ts
formatTextToCapitalized("JAVASCRIPT"); // "Javascript"
```

### underscoreToCapitalizedText

```ts
underscoreToCapitalizedText("hello_world_example"); // "Hello World Example"
```

### getTextFromHtml

Extracts text from an HTML string by removing HTML tags.

```ts
getTextFromHtml("<h1>Title</h1><p>This is a paragraph.</p>"); // "TitleThis is a paragraph."
```

### getRandomColor

```ts
getRandomColor(); // e.g. "#62C5B9"
```

---

## Numbers

```ts
formatNumber(1234567.891);                     // "12,34,567.891"
formatNumber(1234567.891, { locale: "en-US", maximumFractionDigits: 1 }); // "1,234,567.9"
formatCurrency(1234567.5);                     // "₹12,34,567.50"
formatCurrency(999, { maximumFractionDigits: 0 }); // "₹999"
formatCurrency(1234.5, { currency: "USD", locale: "en-US" }); // "$1,234.50"
formatCompactNumber(123456);                   // "1.2L"
formatCompactNumber(12345678);                 // "1.2Cr"
formatCompactNumber(1500000, { locale: "en-US" }); // "1.5M"
formatBytes(1536);                             // "1.5 KB"
roundTo(1.005, 2);                             // 1.01 (Math.round gives 1)
clamp(150, 0, 100);                            // 100
randomInt(1, 6);                               // 1–6 inclusive
ordinal(22);                                   // "22nd"
```

`formatNumber` and `formatCurrency` accept numeric strings and return `""` for non-numeric input. `formatCompactNumber` needs an engine with `Intl` compact notation (Node 12.11+, modern browsers). Older engines print the full number instead.

---

## URLs

```ts
toQueryString({ q: "red shoes", page: 2, sort: undefined }); // "q=red%20shoes&page=2"
toQueryString({ tag: ["a", "b"] });                          // "tag=a&tag=b"
toQueryString({ tag: ["a", "b"] }, { arrayFormat: "comma" }); // "tag=a%2Cb"
parseQueryString("?q=red+shoes&tag=a&tag=b");                // { q: "red shoes", tag: ["a", "b"] }
buildUrl("/search?lang=en#top", { q: "tea" });               // "/search?lang=en&q=tea#top"
```

---

## Validation

All validators return `false` (never throw) for non-string or malformed input.

```ts
isEmail("john@example.com");              // true (domain must contain a dot)
isUrl("https://example.com");             // true (http/https by default)
isUrl("javascript:alert(1)");             // false
isUUID("123e4567-e89b-42d3-a456-426614174000"); // true
isHexColor("#1a2b3c");                    // true
isNumeric("42.5");                        // true

// India
isIndianMobileNumber("+91 98765 43210");  // true
isPAN("ABCPE1234F");                      // true
isGSTIN("27AAPFU0939F1ZV");               // true (validates the check character)
isIFSC("SBIN0005943");                    // true
isPincode("400001");                      // true
isAadhaar("2341 2341 2346");              // true (Verhoeff checksum; format only)
```

### isSet

Checks that the value is none of: null, undefined, empty string, `"undefined"`, `"null"`, `"[]"`.

```ts
isSet("null"); // false
```

### Other validation functions

- `isSetNumber(value?: number | null): boolean`: true unless the value is null or undefined (0 is set).
- `isSetObject(obj: object): boolean`: true if the object is set and has at least one key.
- `isValidJsonData(data: string): object | boolean`: the parsed JSON, or `false` if invalid.
- `evalBooleanValue(value: string | boolean | undefined): boolean`: true for `true` or `"true"`.
- `handleCopyToClipboard(text: string)`: copies text to the clipboard (browser, secure context only).

---

## Development

```bash
npm test           # mocha + ts-node, runs in the Asia/Kolkata time zone for deterministic date tests
npm run typecheck  # type-checks the tsconfig build and the standalone production build
npm run build      # emits lib/
```

## Author

[Bombay Softwares](https://www.bombaysoftwares.com/)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
