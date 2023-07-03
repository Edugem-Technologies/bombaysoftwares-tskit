# tskit

The @bombaysoftwares/tskit package provides a comprehensive set of utility functions for various operations in JavaScript. These functions simplify common tasks such as date formatting, timestamp conversion, JSON validation,manipulating strings, and working with HTML content. This package is designed to enhance the functionality of various operations in your JavaScript projects.

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

## isSet

This function checks if the value provided is none of this - null,undefined,empty string,"undefined",empty array as string.

```bash
console.log(isSet("null"));
// Output: false
```

## isSetObject

This function checks if an object is set and not empty.

```bash
console.log(isSetObject({ key1: "value1", key2: "value2" }));
// Output: true
```

## getRandomColor

This function generates a random color in hexadecimal format.

```bash
console.log(getRandomColor());
// Output: #62C5B9
```

## getTextFromHtml

Extracts text from an HTML string by removing HTML tags.

```bash
console.log(getTextFromHtml("<h1>Title</h1><p>This is a paragraph.</p>"); returns TitleThis is a paragraph.);
// Output: The extracted text without HTML tags.
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
- `isSet = (obj: any): boolean` : This function checks if the value provided is none of this - null,undefined,empty string,"undefined",empty array as string.
- `isSetObject = (obj: object): boolean` : This function checks if an object is set and not empty.
- `getRandomColor = (): string` : This function generates a random color in hexadecimal format.
- `getTextFromHtml = (htmlString: string): string` : This function extracts text from an HTML string by removing HTML tags.
- `evalBooleanValue(value: string | boolean | undefined): boolean` : This function checks if the value provided is "true" or true.
- `dateAndTimeFormat(dateObject: Date, showSeconds = true): string | null` : Formats a Date object into a string representation of date and time.
- `dateFormat(dateObject: Date): string | null` : Formats a Date object into a string representation of date in DD-Mmm-YYYY format.
- `dateFormatHHMM(dateObject: Date): string | null` : Formats a Date object into a string representation of date and time in DD-Mmm-YYYY, HH:mm format.
- `getTwodigitFormat(data: number): string | number | null` : Converts a number to a two-digit format by adding a leading zero if necessary.
- `isValidJsonData(data: string): object | boolean` : Checks if a string is valid JSON data by attempting to parse it.
- `getLocalDate(dateAndTime: string): string | null` : Retrieves the local date in a specific format from the provided date and time string.


For detailed usage and examples, refer to the inline documentation and code samples within each function.

## Author

[Bombay Softwares](https://www.bombaysoftwares.com/)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.