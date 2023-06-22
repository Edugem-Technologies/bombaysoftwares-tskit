# tskit

The @bombaysoftwares/tskit Utils package provides a set of utility functions for working with dates and timestamps in JavaScript. These functions simplify common tasks such as date formatting, timestamp conversion, and JSON validation. This package is designed to enhance the functionality of various operations in your JavaScript projects.

## Installation

To use the Date Utils package, you can install it via npm:

```bash
npm i @bombaysoftwares/tskit
```

## Usage

Import the desired functions from the package:

```bash
import { getCurrentDateTime, getCurrentTimestamp, getDateTime } from '@bombaysoftwares/tskit';
```

## getCurrentDateTime

This function returns the current date and time in the format "YYYY-MM-DD HH:MM:SS".

```bash
const currentDateTime = getCurrentDateTime();
console.log(currentDateTime);
// Output: 2023-06-20 12:22:20
```

## getCurrentTimestamp

This function retrieves the current timestamp in seconds. If a date is provided as an argument, it returns the timestamp of that date.

```bash
const currentTimestamp = getCurrentTimestamp();
console.log(currentTimestamp);
// Output: 1687244441
```

## getDateTime

This function formats a timestamp into a string representation of date and time. You can choose whether to include seconds in the formatted string.

```bash
const timestamp = 1695193213;
const formattedDateTime = getDateTime(timestamp);
console.log(formattedDateTime);
// Output: 20-Sep-2023 12:30:13
```
## Other Functions

The package also includes other useful functions:

- `evalBooleanValue(value: string | boolean | undefined): boolean` : This function checks if the value provided is "true" or true.
- `getUnixConvertedDateTime(options?: { timestamp?: number | null, dateObj?: Date | null }): string ` : Converts a timestamp or Date object to a formatted string representing the date and time.
- `dateAndTimeFormate(dateObject: Date, showSeconds = true): string | null` : Formats a Date object into a string representation of date and time.
- `dateFormate(dateObject: Date): string | null` : Formats a Date object into a string representation of date.
- `dateFormateHHMM(dateObject: Date): string | null` : Formats a Date object into a string representation of date and time in DD-Mmm-YYYY, HH:mm format.
- `getUnixConvertedIsoString(timestamp: number | string): string` :  Converts a timestamp to an ISO string representation.
- `getTwodigitFormate(data: number): string | number` : Converts a number to a two-digit format by adding a leading zero if necessary.
- `isValidJsonData(data: string): object | boolean` : Checks if a string is valid JSON data by attempting to parse it.
- `getLocalDate(dateAndTime: string): string | null` : Retrieves the local date in a specific format from the provided date and time string.
- `getLocalDateTime(dateAndTime: string): string | null` : Retrieves the local date and time in a specific format from the provided date and time string.


For detailed usage and examples, refer to the inline documentation and code samples within each function.

## Author

[Bombay Softwares](https://www.bombaysoftwares.com/)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.