import { expect } from 'chai';
import { camelCaseKeys, dateAndTimeFormat, dateFormat, dateFormatHHMM, evalBooleanValue, formatTextToCapitalized, formatTimestamp, formatTimestampToDateMonthYearString, formatTimestampToDateString, getArray, getCurrentDate, getCurrentDateTime, getCurrentTimestamp, getDateTimeFromTimestamp, getDayFromDate, getLocalDate, getLocalDateHHMM, getRandomColor, getTextFromHtml, getTwodigitFormat, getUniqueValueFromArray, getUnixConvertedDateTime, getUnixConvertedIsoString, isSet, isSetNumber, isSetObject, isValidJsonData, millisToMinutesAndSeconds, tweleveHourFormat, underscoreToCapitalizedText } from '../src/index';

describe('isSet', () => {
  it('should return true if the value is set', () => {
    expect(isSet(5)).to.be.true;
    expect(isSet("hello")).to.be.true;
    expect(isSet({})).to.be.true;
    expect(isSet([])).to.be.true;
  });

  it('should return false if the value is not set', () => {
    expect(isSet(null)).to.be.false;
    expect(isSet(undefined)).to.be.false;
    expect(isSet("")).to.be.false;
    expect(isSet("null")).to.be.false;
    expect(isSet("undefined")).to.be.false;
    expect(isSet("[]")).to.be.false;
  });
});

describe('evalBooleanValue', () => {
  it('should return true if the value is "true" or true', () => {
    expect(evalBooleanValue(true)).to.be.true;
    expect(evalBooleanValue("true")).to.be.true;
    
  });

  it('should return false if the value is not "true" or true', () => {
    expect(evalBooleanValue("some value")).to.be.false;
    expect(evalBooleanValue(false)).to.be.false;
    expect(evalBooleanValue("")).to.be.false;
    expect(evalBooleanValue(undefined)).to.be.false;
    expect(evalBooleanValue("")).to.be.false;
  });
});

describe('getCurrentDateTime', () => {
  it('should return the current date and time in YYYY-MM-DD HH:MM:SS format', () => {
    const currentDateTime = getCurrentDateTime();
    expect(currentDateTime).to.be.a('string').that.is.not.empty; // Assert that the result is a non-empty string
  });
});

describe('getCurrentTimestamp', () => {
  it('should return the current timestamp in seconds', () => {
    const currentTimestamp = getCurrentTimestamp();
    const expectedTimestamp = Math.floor(Date.now() / 1000); // Calculating the current timestamp in seconds and storing it in the variable 
    expect(currentTimestamp).to.equal(expectedTimestamp); // Assert that the currentTimestamp matches the expectedTimestamp
  });

  it('should return the timestamp of the provided date in seconds', () => {
    const date = new Date('2023-06-23T12:00:00Z');
    const timestamp = getCurrentTimestamp(date);
    const expectedTimestamp = Math.floor(date.getTime() / 1000); // Calculating the current timestamp in seconds and storing it in the variable 
    expect(timestamp).to.equal(expectedTimestamp); // Assert that the timestamp matches the expectedTimestamp
  });
});

describe('getCurrentDate', () => {
  it('should return the current date in YYYY-MM-DD format', () => {
    const currentDate = getCurrentDate();
    const expectedDate = new Date().toISOString().slice(0, 10); // Generating a string representation of the current date in the format "YYYY-MM-DD" 
    expect(currentDate).to.equal(expectedDate); // Assert that the currentDate matches the expectedDate
  });
});

describe('getUnixConvertedDateTime', () => {
  it('should convert timestamp to formatted date and time', () => {
    // Choose a specific timestamp
    const timestamp = 1624212000; // Example: June 20, 2021 11:30:00 PM
    const expected = '2021-06-20 11:30:00 PM'; // Set the expected result based on the chosen timestamp Example: June 20, 2021 11:30:00 PM
    const result = getUnixConvertedDateTime({ timestamp }); // Call the getUnixConvertedDateTime function with the timestamp    
    expect(result).to.equal(expected); // Assert that the result matches the expected value
  });

  it('should convert date object to formatted date and time', () => {
    const dateObj = new Date("2023-06-20T13:05:00");
    const expected = '2023-06-20 01:05:00 PM';
    const timestamp = null;
    const result = getUnixConvertedDateTime({ timestamp, dateObj });
    expect(result).to.equal(expected); // Assert that the result matches the expected value
  });

  it('should use current date and time if no timestamp or dateObj is provided', () => {
    const result = getUnixConvertedDateTime(); // Call the getUnixConvertedDateTime function without any arguments
    expect(result).to.be.a('string').that.is.not.empty; // Assert that the result is a non-empty string
  });
});


describe('twelveHourFormat', () => {
  it('should return the twelve-hour format of the provided hours', () => {
    // Test cases with hours that should be formatted in the twelve-hour format
    expect(tweleveHourFormat(1)).to.equal("01");
    expect(tweleveHourFormat(5)).to.equal("05");
    expect(tweleveHourFormat(9)).to.equal("09");
    expect(tweleveHourFormat(11)).to.equal("11");
    expect(tweleveHourFormat(12)).to.equal("12");
    expect(tweleveHourFormat(13)).to.equal("01");
    expect(tweleveHourFormat(17)).to.equal("05");
    expect(tweleveHourFormat(21)).to.equal("09");
    expect(tweleveHourFormat(23)).to.equal("11");
  });

  it('should return "12" for 12 or multiples of 12 hours', () => {
    // Test cases with hours that should be formatted as "12"
    expect(tweleveHourFormat(12)).to.equal("12");
    expect(tweleveHourFormat(24)).to.equal("12");
  });

  it('should return "01" for 0 hours after adjusting', () => {
    // Test case with 0 hours after adjusting
    expect(tweleveHourFormat(0)).to.equal("12");
  });
});

describe('getTwodigitFormat', () => {
  it('should return a two-digit format number by adding a leading zero', () => {
    expect(getTwodigitFormat(1)).to.equal("01");
    expect(getTwodigitFormat(4)).to.equal("04");
    expect(getTwodigitFormat(8)).to.equal("08");
    expect(getTwodigitFormat(9)).to.equal("09");    
  })

  it('should return null if its greater than one digit format', () => {
    expect(getTwodigitFormat(12)).to.equal(12);
    expect(getTwodigitFormat(88)).to.equal(88);
    expect(getTwodigitFormat(99)).to.equal(99);
    expect(getTwodigitFormat(77)).to.equal(77);     
    expect(getTwodigitFormat(787)).to.be.null;  
  })
});

describe('getUnixConvertedIsoString', () => {
  it('should return the ISO string representation of the provided Unix timestamp', () => {
    // Test cases with Unix timestamps that should be converted to ISO strings
    expect(getUnixConvertedIsoString(1624428600)).to.equal('2021-06-23T06:10:00.000Z');
    expect(getUnixConvertedIsoString(0)).to.equal('1970-01-01T00:00:00.000Z');
  });
});


describe('dateAndTimeFormat', () => {
  it('should return the formatted date and time with seconds', () => {
    const dateObject = new Date(2021, 5, 26, 12, 30, 45); // Example date object (June 26, 2021 12:30:45 PM)
    const expectedDateTime = '26-Jun-2021 12:30:45';

    const result = dateAndTimeFormat(dateObject);
    expect(result).to.equal(expectedDateTime); // Assert that the result matches the expectedDateTime
  });

  it('should return the formatted date and time without seconds', () => {
    const dateObject = new Date(2022, 8, 15, 9, 15, 0); // Example date object (September 15, 2022 09:15:00 AM)
    const expectedDateTime = '15-Sep-2022 09:15';

    const result = dateAndTimeFormat(dateObject, false);
    expect(result).to.equal(expectedDateTime); // Assert that the result matches the expectedDateTime
  });
});

describe('dateFormat', () => {
  it('should return the formatted date', () => {
    const dateObject = new Date(2021, 5, 26); // Example date object (June 26, 2021)
    const expectedDate = '26-Jun-2021';

    const result = dateFormat(dateObject);
    expect(result).to.equal(expectedDate); // Assert that the result matches the expectedDate
  });
});

describe('dateFormatHHMM', () => {
  it('should return the formatted date with hours and minutes', () => {
    const dateObject = new Date(2021, 5, 26, 9, 30); // Example date object (June 26, 2021, 09:30)
    const expectedDate = '26-Jun-2021, 09:30';

    const result = dateFormatHHMM(dateObject);
    expect(result).to.equal(expectedDate); // Assert that the result matches the expectedDate
  });
});

describe('getDateTime', () => {
  it('should return the formatted date and time with seconds', () => {
    const timestamp = 1624683000; // Example timestamp (June 26, 2021, 09:30:00)
    const expectedDateTime = '26-Jun-2021 10:20:00';

    const result = getDateTimeFromTimestamp(timestamp);
    expect(result).to.equal(expectedDateTime); // Assert that the result matches the expectedDateTime
  });

  it('should return the formatted date and time without seconds', () => {
    const timestamp = 1624683000; // Example timestamp (June 26, 2021, 09:30:00)
    const expectedDateTime = '26-Jun-2021 10:20';

    const result = getDateTimeFromTimestamp(timestamp, false);
    expect(result).to.equal(expectedDateTime); // Assert that the result matches the expectedDateTime
  });
});

describe('isValidJsonData', () => {
  it('should return the parsed JSON data if the input is valid JSON', () => {
    const validJson = '{"name": "John", "age": 30}';
    const expectedData = { name: 'John', age: 30 };
    const result = isValidJsonData(validJson);
    expect(result).to.deep.equal(expectedData); // Assert that the result matches the expectedDate
  });

  it('should return false if the input is not valid JSON', () => {
    const invalidJson = 'invalid json';
    const result = isValidJsonData(invalidJson);
    expect(result).to.be.false;
  });
});

describe('getLocalDate', () => {
  it('should return the formatted local date', () => {
    const dateAndTime = '2023-06-26 10:20:00';
    const expected = '26-Jun-2023';
    const result = getLocalDate(dateAndTime);
    expect(result).to.equal(expected);
  });

  it('should return null for an invalid or unset date and time', () => {
    const dateAndTime = '';
    const invalidDateTime = 'abc'
    const result = getLocalDate(dateAndTime);
    const invalidDateTimeresult = getLocalDate(invalidDateTime);
    expect(result).to.be.null;
    expect(invalidDateTimeresult).to.be.null;
  });
});

describe('getLocalDateHHMM', () => {
  it('should return the formatted local date and time without seconds', () => {
    const dateAndTime = '2023-06-26 10:20:00';
    const expected = '26-Jun-2023, 10:20';
    const result = getLocalDateHHMM(dateAndTime);
    expect(result).to.equal(expected);
  });

  it('should return null for an invalid or unset date and time', () => {
    const dateAndTime = '';
    const invalidDateTime = 'abc'
    const result = getLocalDateHHMM(dateAndTime);
    const invalidDateTimeresult = getLocalDateHHMM(invalidDateTime);
    expect(result).to.be.null;
    expect(invalidDateTimeresult).to.be.null;
  });
});

describe('isSetObject', () => {
  it('should return true if the object is set and has at least one key', () => {
    const obj1 = { key: 'value' }; // Test case with a non-empty object
    expect(isSetObject(obj1)).to.be.true;
  });

  it('should return false if the object is empty', () => {
     const obj2 = {}; // Test case with an empty object
     expect(isSetObject(obj2)).to.be.false;
  })
});

describe('getRandomColor', () => {
  it('should return a random color in the correct format', () => {
    const color = getRandomColor();
    const colorRegex = /^#[0-9A-F]{6}$/i; // Regular expression to match the color format (# followed by 6 hexadecimal characters)
    const isValidColor = colorRegex.test(color);
    expect(isValidColor).to.be.true;
  });
});

describe('getTextFromHtml', () => {
  it('should return the text content without HTML tags', () => {
    const htmlString = '<p>This is a <strong>sample</strong> HTML <em>string</em>.</p>';
    const expectedText = 'This is a sample HTML string.';
    expect(getTextFromHtml(htmlString)).to.equal(expectedText);
  });

  it('should return an empty string if the input is not set', () => {
    const emptyString = '';
    expect(getTextFromHtml(emptyString)).to.equal('');
  });
});

describe('formatTimestamp', () => {
  it('should return the formatted date and time', () => {
    // Choose a specific timestamp
    const timestamp = 1692700267; // August 22, 2023 10:31:07
    const expected = '22-08-2023 10:31 '; // Set the expected result based on the chosen timestamp.
    const result = formatTimestamp(timestamp); // Call the formatTimestamp function with the timestamp
    expect(result).to.equal(expected); // Assert that the result matches the expected value
  });
});

describe('formatTimestampToDateString', () => {
  it('should return the formatted date in IST', () => {
    // Choose a specific timestamp in UTC
    const timestamp = 1624893600; // June 28, 2021 05:30:00 UTC
    const expected = '28/06/2021 '; // Set the expected result based on the chosen timestamp and IST offset
    const result = formatTimestampToDateString(timestamp); // Call the formatTimestampToDateString function with the timestamp
    expect(result).to.equal(expected); // Assert that the result matches the expected value
  });
});

describe('formatTimestampToDateMonthYearString', () => {
  it('should return the formatted date and month in IST', () => {
    // Choose a specific timestamp in UTC
    const timestamp = 1624893600; // June 28, 2021 05:30:00 UTC
    const expected = '28 Jun, 2021 '; // Set the expected result based on the chosen timestamp and IST offset
    const result = formatTimestampToDateMonthYearString(timestamp); // Call the formatTimestampToDateMonthYearString function with the timestamp
    expect(result).to.equal(expected); // Assert that the result matches the expected value
  });
});

describe('millisToMinutesAndSeconds', () => {
  // Test cases for conversion from milliseconds to minutes and seconds format.
  const testCases = [
    { millis: 0, expected: '0:00.000' },
    { millis: 1000, expected: '0:01.000' },
    { millis: 60000, expected: '1:00.000' },
    { millis: 123456, expected: '2:03.456' },
  ];

  testCases.forEach(({ millis, expected }) => {
    it(`should convert ${millis} milliseconds to minutes and seconds format`, () => {
      const result = millisToMinutesAndSeconds(millis);
      expect(result).to.equal(expected); // Asserts that the converted time matches the expected format.
    });
  });
});

describe('getDayFromDate', () => {
  it('should return the correct day of the week for a valid date string', () => {
    const dateStringFormatOne = '07/Jul/2023'; // Valid date string format 1
    const dateStringFormatTwo = "07/07/2023"; // Valid date string format 2
    const dateStringFormatThree = "07-Jul-2023"; // Valid date string format 3
    const dateStringFormatFour = "07-07-2023"; // Valid date string format 4
    const expectedDayOfWeek = 'Friday'; // Expected day of the week

    // Testing with different valid date string formats
    expect(getDayFromDate(dateStringFormatOne)).to.equal(expectedDayOfWeek);
    expect(getDayFromDate(dateStringFormatTwo)).to.equal(expectedDayOfWeek);
    expect(getDayFromDate(dateStringFormatThree)).to.equal(expectedDayOfWeek);
    expect(getDayFromDate(dateStringFormatFour)).to.equal(expectedDayOfWeek);
  });

  it('should return "Invalid date format" for an invalid date string', () => {
    const dateString = '2023-July-07'; // Invalid format
    const expectedErrorMessage = 'Invalid date format';
    const actualResult = getDayFromDate(dateString);
    expect(actualResult).equal(expectedErrorMessage);
  });
});  

describe('camelCaseKeys', () => {
  it('should return the new object with camelCased keys', () => {
    const inputObject = { first_name: "John", last_name: "Doe"}
    const expected = { firstName: "John", lastName: "Doe"}; // Set the expected result based on the chosen snakeCaseData
    const result = camelCaseKeys(inputObject); // Call the camelCaseKeys function with the inputObject
    expect(result).to.eql(expected); // Assert that the result matches the expected value
  });
  it('should not modify keys for non-snake_case input', () => {
    const inputObject = { firstName: "John", lastName: "Doe"};
    const expected = { firstName: "John", lastName: "Doe"};
    const result = camelCaseKeys(inputObject);
    expect(result).to.eql(expected);
  });
  it('should return an empty object if input object is empty', () => {
    const inputObject = {};
    const expected = {};
    const result = camelCaseKeys(inputObject);
    expect(result).to.eql(expected);
  });
  it('should not modify keys that are already in camelCase format', () => {
    const inputObject = { firstName: "John", last_name: "Doe"};
    const expected = {firstName: "John", lastName: "Doe"};
    const result = camelCaseKeys(inputObject);
    expect(result).to.eql(expected);
  });
})
describe('isSetNumber', () => {
  it('should return true if the value is not undefined or null', () => {
    expect(isSetNumber(5)).to.be.true;
    expect(isSetNumber(0)).to.be.true;
  });

  it('should return false if the value is undefined or null', () => {
    expect(isSetNumber(null)).to.be.false;
    expect(isSetNumber(undefined)).to.be.false;
  });
});

describe('getArray', () => {
  it('should return an array of numbers from 1 to the specified length', () => {
    const result1 = getArray(5);
    const expected1 = [1, 2, 3, 4, 5];
    expect(result1).to.deep.equal(expected1);

    const result2 = getArray(10);
    const expected2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(result2).to.deep.equal(expected2);
  });

  it('should return an array with single element when length is 1', () => {
    const result = getArray(1);
    const expected = [1];
    expect(result).to.deep.equal(expected);
  });

  it('should return an empty array when length is 0', () => {
    const result = getArray(0);
    const expected: number[] = [];
    expect(result).to.deep.equal(expected);
  });

  it('should return an array with correct length', () => {
    const length = 7;
    const result = getArray(length);
    expect(result).to.have.length(length);
  });

  it('should return an array with consecutive numbers starting from 1', () => {
    const result = getArray(6);
    expect(result[0]).to.equal(1);
    expect(result[1]).to.equal(2);
    expect(result[2]).to.equal(3);
    expect(result[3]).to.equal(4);
    expect(result[4]).to.equal(5);
    expect(result[5]).to.equal(6);
  });
});

describe('getUniqueValueFromArray', () => {
  it('should return unique string values preserving order', () => {
    const input = ["a", "b", "a", "c", "b"];
    const expected = ["a", "b", "c"];
    const result = getUniqueValueFromArray(input);
    expect(result).to.deep.equal(expected);
  });

  it('should return unique number values preserving order', () => {
    const input = [1, 2, 2, 3, 1, 4];
    const expected = [1, 2, 3, 4];
    const result = getUniqueValueFromArray(input);
    expect(result).to.deep.equal(expected);
  });

  it('should return unique boolean values preserving order', () => {
    const input = [true, false, true, true, false];
    const expected = [true, false];
    const result = getUniqueValueFromArray(input);
    expect(result).to.deep.equal(expected);
  });

  it('should return unique object values preserving order', () => {
    const obj1 = { id: 1, name: "John" };
    const obj2 = { id: 2, name: "Jane" };
    const obj3 = { id: 1, name: "John" }; // Different object instance with same properties
    const input = [obj1, obj2, obj3, obj2];
    const expected = [obj1, obj2, obj3]; // Set treats obj1 and obj3 as different objects
    const result = getUniqueValueFromArray(input);
    expect(result).to.deep.equal(expected);
  });

  it('should return empty array for empty input', () => {
    const input: string[] = [];
    const expected: string[] = [];
    const result = getUniqueValueFromArray(input);
    expect(result).to.deep.equal(expected);
  });

  it('should return single element array for array with one element', () => {
    const input = ["single"];
    const expected = ["single"];
    const result = getUniqueValueFromArray(input);
    expect(result).to.deep.equal(expected);
  });

  it('should return same array for array with all unique values', () => {
    const input = ["a", "b", "c"];
    const expected = ["a", "b", "c"];
    const result = getUniqueValueFromArray(input);
    expect(result).to.deep.equal(expected);
  });

  it('should throw TypeError for non-array input', () => {
    expect(() => getUniqueValueFromArray("not an array" as any)).to.throw(TypeError, "Input must be an array");
    expect(() => getUniqueValueFromArray(123 as any)).to.throw(TypeError, "Input must be an array");
    expect(() => getUniqueValueFromArray(null as any)).to.throw(TypeError, "Input must be an array");
    expect(() => getUniqueValueFromArray(undefined as any)).to.throw(TypeError, "Input must be an array");
  });

  it('should throw TypeError for array with mixed data types', () => {
    const mixedArray = ["string", 123, true];
    expect(() => getUniqueValueFromArray(mixedArray)).to.throw(TypeError, "Array contains mixed data types. Only one data type is allowed.");
  });

  it('should throw TypeError for array with mixed data types starting with number', () => {
    const mixedArray = [1, "string", 2];
    expect(() => getUniqueValueFromArray(mixedArray)).to.throw(TypeError, "Array contains mixed data types. Only one data type is allowed.");
  });

  it('should throw TypeError for array with mixed data types starting with boolean', () => {
    const mixedArray = [true, "string", false];
    expect(() => getUniqueValueFromArray(mixedArray)).to.throw(TypeError, "Array contains mixed data types. Only one data type is allowed.");
  });
});

describe('formatTextToCapitalized', () => {
  it('should capitalize first letter and convert rest to lowercase', () => {
    const result1 = formatTextToCapitalized("hello world");
    expect(result1).to.equal("Hello world");

    const result2 = formatTextToCapitalized("JAVASCRIPT");
    expect(result2).to.equal("Javascript");

    const result3 = formatTextToCapitalized("mIXeD cAsE");
    expect(result3).to.equal("Mixed case");
  });

  it('should handle single character strings', () => {
    const result1 = formatTextToCapitalized("a");
    expect(result1).to.equal("A");

    const result2 = formatTextToCapitalized("Z");
    expect(result2).to.equal("Z");
  });

  it('should return empty string for empty or falsy inputs', () => {
    expect(formatTextToCapitalized("")).to.equal("");
    expect(formatTextToCapitalized(undefined)).to.equal("");
    expect(formatTextToCapitalized(null as any)).to.equal("");
  });

  it('should return empty string for non-string inputs', () => {
    expect(formatTextToCapitalized(123 as any)).to.equal("");
    expect(formatTextToCapitalized(true as any)).to.equal("");
    expect(formatTextToCapitalized({} as any)).to.equal("");
    expect(formatTextToCapitalized([] as any)).to.equal("");
  });

  it('should handle strings with special characters and numbers', () => {
    const result1 = formatTextToCapitalized("hello123");
    expect(result1).to.equal("Hello123");

    const result2 = formatTextToCapitalized("WORLD!");
    expect(result2).to.equal("World!");

    const result3 = formatTextToCapitalized("test@email.com");
    expect(result3).to.equal("Test@email.com");
  });

  it('should handle already capitalized strings', () => {
    const result1 = formatTextToCapitalized("Hello World");
    expect(result1).to.equal("Hello world");

    const result2 = formatTextToCapitalized("JavaScript");
    expect(result2).to.equal("Javascript");
  });

  it('should handle strings with only lowercase letters', () => {
    const result = formatTextToCapitalized("lowercase");
    expect(result).to.equal("Lowercase");
  });

  it('should handle strings with only uppercase letters', () => {
    const result = formatTextToCapitalized("UPPERCASE");
    expect(result).to.equal("Uppercase");
  });
});

describe('underscoreToCapitalizedText', () => {
  it('should convert underscore-separated strings to capitalized words', () => {
    const result1 = underscoreToCapitalizedText("hello_world_example");
    expect(result1).to.equal("Hello World Example");

    const result2 = underscoreToCapitalizedText("user_name_email");
    expect(result2).to.equal("User Name Email");

    const result3 = underscoreToCapitalizedText("first_name_last_name");
    expect(result3).to.equal("First Name Last Name");
  });

  it('should handle single word strings', () => {
    const result1 = underscoreToCapitalizedText("hello");
    expect(result1).to.equal("Hello");

    const result2 = underscoreToCapitalizedText("WORLD");
    expect(result2).to.equal("World");
  });

  it('should handle strings with mixed case', () => {
    const result1 = underscoreToCapitalizedText("hello_WORLD_example");
    expect(result1).to.equal("Hello World Example");

    const result2 = underscoreToCapitalizedText("USER_name_EMAIL");
    expect(result2).to.equal("User Name Email");
  });

  it('should handle strings with numbers and special characters', () => {
    const result1 = underscoreToCapitalizedText("user_123_email");
    expect(result1).to.equal("User 123 Email");

    const result2 = underscoreToCapitalizedText("test_email@domain");
    expect(result2).to.equal("Test Email@domain");
  });

  it('should return empty string for empty or falsy inputs', () => {
    expect(underscoreToCapitalizedText("")).to.equal("");
    expect(underscoreToCapitalizedText("   ")).to.equal("");
    expect(underscoreToCapitalizedText(undefined as any)).to.equal("");
    expect(underscoreToCapitalizedText(null as any)).to.equal("");
  });

  it('should return empty string for non-string inputs', () => {
    expect(underscoreToCapitalizedText(123 as any)).to.equal("");
    expect(underscoreToCapitalizedText(true as any)).to.equal("");
    expect(underscoreToCapitalizedText({} as any)).to.equal("");
    expect(underscoreToCapitalizedText([] as any)).to.equal("");
  });

  it('should handle strings with consecutive underscores', () => {
    const result1 = underscoreToCapitalizedText("hello__world");
    expect(result1).to.equal("Hello  World");

    const result2 = underscoreToCapitalizedText("user___name");
    expect(result2).to.equal("User   Name");
  });

  it('should handle strings with leading and trailing underscores', () => {
    const result1 = underscoreToCapitalizedText("_hello_world_");
    expect(result1).to.equal(" Hello World ");

    const result2 = underscoreToCapitalizedText("__user_name__");
    expect(result2).to.equal("  User Name  ");
  });

  it('should handle strings with only underscores', () => {
    const result1 = underscoreToCapitalizedText("___");
    expect(result1).to.equal("   ");

    const result2 = underscoreToCapitalizedText("_");
    expect(result2).to.equal(" ");
  });

  it('should handle already capitalized strings', () => {
    const result1 = underscoreToCapitalizedText("Hello_World_Example");
    expect(result1).to.equal("Hello World Example");

    const result2 = underscoreToCapitalizedText("USER_NAME_EMAIL");
    expect(result2).to.equal("User Name Email");
  });
});