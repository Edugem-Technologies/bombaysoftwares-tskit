# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

All additions are backwards compatible: every existing export keeps its signature and behaviour (bug fixes aside).

### Added

- **Dates** (`src/date.ts`): `formatDate` (token formatter with IANA `timeZone` support), `getRelativeTime`, `addTime`, `dateDiff` (DST-safe calendar units), `startOf`, `endOf`, `isSameDay`, `isToday`, `isYesterday`, `isTomorrow`, `isWeekend`, `getAge`, `getDaysInMonth`, `isLeapYear`, `isValidDate`, `toDate`.
- **Async** (`src/async.ts`): `debounce` (with `cancel`/`flush`/`pending`), `throttle`, `retry` (exponential backoff), `withTimeout` + `TimeoutError`, `sleep`, `once`, `memoize` (evicts rejected promises), `tryCatch`, `mapConcurrent`.
- **Arrays** (`src/array.ts`): `range`, `chunk`, `groupBy`, `keyBy`, `uniqueBy`, `partition`, `sortBy` (multi-key, stable), `sum`, `shuffle`, `sample`, `difference`, `intersection`, `compact`.
- **Objects** (`src/object.ts`): `pick`, `omit`, `get`, `deepClone`, `deepMerge`, `isEqual`, `isEmpty`, `isPlainObject`, `omitNullish`, `deepCamelCaseKeys`, `deepSnakeCaseKeys`.
- **Strings** (`src/string.ts`): `camelCase`, `pascalCase`, `snakeCase`, `kebabCase`, `titleCase`, `truncate`, `slugify`, `getInitials`, `escapeHtml`, `unescapeHtml`, `mask`, `maskEmail`, `pluralize`, `randomString`.
- **Numbers** (`src/number.ts`): `formatNumber`, `formatCurrency`, `formatCompactNumber` (lakh/crore aware), `formatBytes`, `roundTo`, `clamp`, `randomInt`, `ordinal`.
- **URLs** (`src/url.ts`): `toQueryString`, `parseQueryString`, `buildUrl`.
- **Validation** (`src/validation.ts`): `isEmail`, `isUrl`, `isUUID`, `isHexColor`, `isNumeric`, and India-specific `isIndianMobileNumber`, `isPAN`, `isGSTIN` (check character), `isIFSC`, `isPincode`, `isAadhaar` (Verhoeff checksum).
- `npm run typecheck` script that checks both the `tsconfig` build and the standalone production build.

### Fixed

- `getCurrentDateTime()` produced a three-digit month for October to December (e.g. `2026-011-05`).
- `formatTimestamp()` combined the local year with UTC day/month/time, giving the wrong year around New Year in non-UTC time zones.
- `millisToMinutesAndSeconds()` could round seconds up to `60` (e.g. `59999` → `0:60.999`).
- `handleCopyToClipboard()` threw a `ReferenceError` during SSR / in Node instead of resolving with `{ success: false }`.

### Changed

- Tests: moved Mocha configuration to `.mocharc.js`. It pins the test time zone to `Asia/Kolkata`, which the existing date assertions assume, and stops Node ≥ 22.18's native type-stripping from bypassing ts-node, which had silently disabled type-checking of the tests.
- Tests: `getCurrentDate` test no longer fails between 00:00 and 05:30 IST.
- Added `@sinonjs/fake-timers` (dev dependency) for deterministic timer tests.

## [1.0.10] - 2023-08-17

### Changed

- `formatTimestamp()` Function will return formatted time in the format: DD-MM-YYYY HH:mm . Previously IST was the default Timezone being used.

[Unreleased]: https://github.com/Edugem-Technologies/bombaysoftwares-tskit/compare/v1.0.10...HEAD