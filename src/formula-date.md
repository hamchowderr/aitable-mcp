# AITable Date and Time Functions

Date and time functions are formula functions that can operate on data of date and time types. These functions enable date calculations, formatting, comparisons, and time zone conversions.

## Function Index

### Date Information Functions
- [TODAY](#today) - Returns current date
- [NOW](#now) - Returns current date and time
- [TONOW](#tonow) - Calculate time from date to now
- [FROMNOW](#fromnow) - Calculate time from now to date

### Date Calculation Functions
- [DATEADD](#dateadd) - Add time to a date
- [DATETIME_DIFF](#datetime_diff) - Calculate difference between dates
- [WORKDAY](#workday) - Calculate workdays from date
- [WORKDAY_DIFF](#workday_diff) - Calculate workday difference

### Date Comparison Functions
- [IS_AFTER](#is_after) - Check if date is after another
- [IS_BEFORE](#is_before) - Check if date is before another
- [IS_SAME](#is_same) - Check if dates are the same

### Date Formatting Functions
- [DATETIME_FORMAT](#datetime_format) - Format date with custom pattern
- [DATETIME_PARSE](#datetime_parse) - Parse text to date
- [DATESTR](#datestr) - Format date as string
- [TIMESTR](#timestr) - Format time as string

### Date Component Functions
- [YEAR](#year) - Extract year from date
- [MONTH](#month) - Extract month from date
- [WEEKDAY](#weekday) - Get day of week
- [WEEKNUM](#weeknum) - Get week number of year
- [DAY](#day) - Extract day of month
- [HOUR](#hour) - Extract hour
- [MINUTE](#minute) - Extract minute
- [SECOND](#second) - Extract second

### Locale and Timezone Functions
- [SET_LOCALE](#set_locale) - Set language locale
- [SET_TIMEZONE](#set_timezone) - Set timezone

### Record Timestamp Functions
- [CREATED_TIME](#created_time) - Get record creation time
- [LAST_MODIFIED_TIME](#last_modified_time) - Get last modification time

---

## TODAY()
Returns the current date.

**Syntax:** `TODAY()`

**Parameters:** This function requires no parameters.

**Examples:**
```
// Return today's date
TODAY()
=> Date (example: 2021/4/1)

// Calculate the time interval between two dates
DATETIME_DIFF(TODAY(), {start time}, "day")
=> Number

// The date 10 days later
DATEADD(TODAY(), 10, "day")
=> Date (example: 2021/4/11)
```

---

## NOW()
Returns the current date and time.

**Syntax:** `NOW()`

**Parameters:** This function requires no parameters.

**Examples:**
```
// Returns the current date and time
NOW()
=> Date (example: 2021/4/1 15:30)

// Calculate the time interval between two dates
DATETIME_DIFF(NOW(), {start time}, "hours")
=> Number

// The time is 10 hours later
DATEADD(NOW(), 10, "hours")
=> Date (example: 2021/4/2 1:30)
```

---

## TONOW()
Calculate the time from a specific date to the present. Returns a formatted time string.

**Syntax:** `TONOW(date, [unit])`

**Parameters:**
- date: the specific date
- unit: Optional, the unit of time to return. Defaults to "milliseconds" if not specified.

**Note:** This function is particularly useful for "time to now" displays.

**Examples:**
```
// Calculate the number of days from a specific date to the present. {start time} is date type, 2021/3/1
TONOW({start time}, "days")
=> "31 days"

// Calculate the number of months from a specific date to the present
TONOW({start time}, "months")
=> "1 month"

// Calculate the number of hours from a specific date and time to the present
TONOW({start time}, "hours")
=> "744 hours"
```

---

## FROMNOW()
Calculate the time from the present to a specific date. Returns a formatted time string.

**Syntax:** `FROMNOW(date, [unit])`

**Parameters:**
- date: the specific date
- unit: Optional, the unit of time to return. Defaults to "milliseconds" if not specified.

**Note:** This function is particularly useful for countdown or "time until" displays.

**Examples:**
```
// Calculate the days from now to a specific date. {deadline} is date type, 2021/5/1
FROMNOW({deadline}, "days")
=> "30 days"

// Calculate the months from now to a specific date
FROMNOW({deadline}, "months")
=> "1 month"

// Calculate the hours from now to a specific date and time
FROMNOW({deadline}, "hours")
=> "720 hours"
```

---

## DATEADD()
Adds a specified count of time units to a date.

**Syntax:** `DATEADD(date, count, [unit])`

**Parameters:**
- date: the start date
- count: the number of time units to add
- unit: Optional, the unit of time to add. Defaults to "days" if not specified.

**Examples:**
```
// Add a specific number of days to a date. {start date} is date type, 2021/4/1
DATEADD({start date}, 3, "days")
=> 2021/4/4

// Add a specific number of months to a date
DATEADD({start date}, 2, "months")
=> 2021/6/1

// Add a specific number of hours to a date
DATEADD({start date}, 5, "hours")
=> 2021/4/1 5:00
```

---

## DATETIME_DIFF()
Calculates the difference between two dates in a specified unit.

**Syntax:** `DATETIME_DIFF(date1, date2, [unit])`

**Parameters:**
- date1: the first date
- date2: the second date
- unit: Optional, the unit to measure the difference in. Defaults to "milliseconds" if not specified.

**Returns:** A number representing the difference (date1 - date2).

**Examples:**
```
// Calculate the difference in days. {end time} is 2021/4/10, {start time} is 2021/4/1
DATETIME_DIFF({end time}, {start time}, "days")
=> 9

// Calculate the difference in months
DATETIME_DIFF({end time}, {start time}, "months")
=> 0

// Calculate the difference in hours
DATETIME_DIFF({end time}, {start time}, "hours")
=> 216
```

---

## WORKDAY()
Adds a specified number of workdays to a date, excluding weekends and optional holidays.

**Syntax:** `WORKDAY(startDate, numWorkdays, [holidays])`

**Parameters:**
- startDate: the start date
- numWorkdays: the number of workdays to add (can be negative to go backwards)
- holidays: Optional, a date or array of dates representing holidays to exclude

**Note:** Weekends (Saturday and Sunday) are automatically excluded.

**Examples:**
```
// Add 5 workdays to a date. {start date} is 2021/4/1 (Thursday)
WORKDAY({start date}, 5)
=> 2021/4/8 (Thursday, skipping weekend)

// Subtract workdays (negative number)
WORKDAY({start date}, -3)
=> 2021/3/29 (Monday)

// Add workdays excluding holidays
WORKDAY({start date}, 5, "2021/4/5")
=> 2021/4/9 (one day later due to holiday)
```

---

## WORKDAY_DIFF()
Calculates the number of workdays between two dates, excluding weekends and optional holidays.

**Syntax:** `WORKDAY_DIFF(startDate, endDate, [holidays])`

**Parameters:**
- startDate: the start date
- endDate: the end date
- holidays: Optional, a date or array of dates representing holidays to exclude

**Note:** Weekends (Saturday and Sunday) are automatically excluded.

**Examples:**
```
// Calculate workdays between two dates. {start} is 2021/4/1, {end} is 2021/4/15
WORKDAY_DIFF({start}, {end})
=> 10 (14 days minus 4 weekend days)

// Calculate workdays excluding holidays
WORKDAY_DIFF({start}, {end}, "2021/4/5")
=> 9 (10 workdays minus 1 holiday)

// Multiple holidays
WORKDAY_DIFF({start}, {end}, ["2021/4/5", "2021/4/10"])
=> 8
```

---

## IS_AFTER()
Checks if the first date is after the second date.

**Syntax:** `IS_AFTER(date1, date2, [unit])`

**Parameters:**
- date1: the first date
- date2: the second date
- unit: Optional, the granularity to compare. Defaults to "milliseconds". Can be "year", "month", "day", "hour", etc.

**Returns:** TRUE if date1 is after date2, FALSE otherwise.

**Examples:**
```
// Compare if one date is after another. {deadline} is 2021/5/1, {current} is 2021/4/1
IS_AFTER({deadline}, {current})
=> TRUE

// Compare at day granularity
IS_AFTER({deadline}, {current}, "day")
=> TRUE

// Compare at month granularity
IS_AFTER("2021/4/30", "2021/4/1", "month")
=> FALSE (same month)
```

---

## IS_BEFORE()
Checks if the first date is before the second date.

**Syntax:** `IS_BEFORE(date1, date2, [unit])`

**Parameters:**
- date1: the first date
- date2: the second date
- unit: Optional, the granularity to compare. Defaults to "milliseconds".

**Returns:** TRUE if date1 is before date2, FALSE otherwise.

**Examples:**
```
// Compare if one date is before another. {start} is 2021/3/1, {current} is 2021/4/1
IS_BEFORE({start}, {current})
=> TRUE

// Compare at day granularity
IS_BEFORE({start}, {current}, "day")
=> TRUE

// Compare at month granularity
IS_BEFORE("2021/4/1", "2021/4/30", "month")
=> FALSE (same month)
```

---

## IS_SAME()
Checks if two dates are the same.

**Syntax:** `IS_SAME(date1, date2, [unit])`

**Parameters:**
- date1: the first date
- date2: the second date
- unit: Optional, the granularity to compare. Defaults to "milliseconds". Can be "year", "month", "day", etc.

**Returns:** TRUE if dates are the same at the specified granularity, FALSE otherwise.

**Examples:**
```
// Compare if two dates are exactly the same
IS_SAME("2021/4/1 10:00", "2021/4/1 10:00")
=> TRUE

// Compare at day granularity (ignores time)
IS_SAME("2021/4/1 10:00", "2021/4/1 15:00", "day")
=> TRUE

// Compare at month granularity
IS_SAME("2021/4/1", "2021/4/30", "month")
=> TRUE

// Compare at year granularity
IS_SAME("2021/1/1", "2021/12/31", "year")
=> TRUE
```

---

## DATETIME_FORMAT()
Formats a date according to a specified format string.

**Syntax:** `DATETIME_FORMAT(date, [formatString])`

**Parameters:**
- date: the date to format
- formatString: Optional, the format pattern. Defaults to "YYYY-MM-DD" if not specified. See format descriptors table below.

**Examples:**
```
// Format with default pattern. {date} is 2021/4/1
DATETIME_FORMAT({date})
=> "2021-04-01"

// Custom format pattern
DATETIME_FORMAT({date}, "YYYY/MM/DD")
=> "2021/04/01"

// Format with time
DATETIME_FORMAT({date}, "YYYY-MM-DD HH:mm:ss")
=> "2021-04-01 00:00:00"

// Format with day of week
DATETIME_FORMAT({date}, "YYYY-MM-DD dddd")
=> "2021-04-01 Thursday"
```

---

## DATETIME_PARSE()
Parses a text string into a date using a specified format.

**Syntax:** `DATETIME_PARSE(text, [formatString], [locale])`

**Parameters:**
- text: the text to parse
- formatString: Optional, the format pattern of the input text. Defaults to "YYYY-MM-DD".
- locale: Optional, the language locale for parsing. Defaults to "en".

**Examples:**
```
// Parse with default format
DATETIME_PARSE("2021-04-01")
=> 2021/4/1

// Parse with custom format
DATETIME_PARSE("04/01/2021", "MM/DD/YYYY")
=> 2021/4/1

// Parse with time
DATETIME_PARSE("2021-04-01 15:30:45", "YYYY-MM-DD HH:mm:ss")
=> 2021/4/1 15:30:45

// Parse with locale
DATETIME_PARSE("01 avril 2021", "DD MMMM YYYY", "fr")
=> 2021/4/1
```

---

## DATESTR()
Formats a date as a date string (without time).

**Syntax:** `DATESTR(date)`

**Parameters:**
- date: the date to format

**Returns:** A string in "YYYY-MM-DD" format.

**Examples:**
```
// Format date to string. {datetime} is 2021/4/1 15:30
DATESTR({datetime})
=> "2021-04-01"

// Works with date-only values
DATESTR({date})
=> "2021-04-01"
```

---

## TIMESTR()
Formats a date as a time string (without date).

**Syntax:** `TIMESTR(date)`

**Parameters:**
- date: the date to extract time from

**Returns:** A string in "HH:mm" format.

**Examples:**
```
// Format time to string. {datetime} is 2021/4/1 15:30
TIMESTR({datetime})
=> "15:30"

// Works with full timestamps
TIMESTR({datetime})
=> "15:30"
```

---

## YEAR()
Extracts the year from a date.

**Syntax:** `YEAR(date)`

**Parameters:**
- date: the date to extract the year from

**Returns:** A number representing the year.

**Examples:**
```
// Extract year from date. {date} is 2021/4/1
YEAR({date})
=> 2021

// Works with datetime
YEAR({datetime})
=> 2021
```

---

## MONTH()
Extracts the month from a date.

**Syntax:** `MONTH(date)`

**Parameters:**
- date: the date to extract the month from

**Returns:** A number from 1 to 12 representing the month.

**Examples:**
```
// Extract month from date. {date} is 2021/4/1
MONTH({date})
=> 4

// January returns 1
MONTH("2021/1/15")
=> 1

// December returns 12
MONTH("2021/12/25")
=> 12
```

---

## WEEKDAY()
Gets the day of the week from a date.

**Syntax:** `WEEKDAY(date, [startDay])`

**Parameters:**
- date: the date to get the weekday from
- startDay: Optional, the day to consider as the start of the week. Defaults to "Sunday". Can be "Monday", "Tuesday", etc.

**Returns:** A number representing the day of the week (0-6).

**Examples:**
```
// Get weekday with Sunday as first day. {date} is 2021/4/1 (Thursday)
WEEKDAY({date})
=> 4 (Thursday, 0=Sunday)

// With Monday as first day
WEEKDAY({date}, "Monday")
=> 3 (Thursday, 0=Monday)

// Sunday
WEEKDAY("2021/4/4")
=> 0 (when Sunday is first day)
```

---

## WEEKNUM()
Gets the week number of the year from a date.

**Syntax:** `WEEKNUM(date, [startDay])`

**Parameters:**
- date: the date to get the week number from
- startDay: Optional, the day to consider as the start of the week. Defaults to "Sunday".

**Returns:** A number from 1 to 53 representing the week of the year.

**Examples:**
```
// Get week number. {date} is 2021/4/1
WEEKNUM({date})
=> 14

// With Monday as first day of week
WEEKNUM({date}, "Monday")
=> 13

// First week of year
WEEKNUM("2021/1/1")
=> 1
```

---

## DAY()
Extracts the day of the month from a date.

**Syntax:** `DAY(date)`

**Parameters:**
- date: the date to extract the day from

**Returns:** A number from 1 to 31 representing the day of the month.

**Examples:**
```
// Extract day from date. {date} is 2021/4/1
DAY({date})
=> 1

// Last day of month
DAY("2021/4/30")
=> 30

// Works with datetime
DAY("2021/4/15 15:30")
=> 15
```

---

## HOUR()
Extracts the hour from a datetime.

**Syntax:** `HOUR(datetime)`

**Parameters:**
- datetime: the datetime to extract the hour from

**Returns:** A number from 0 to 23 representing the hour.

**Examples:**
```
// Extract hour from datetime. {datetime} is 2021/4/1 15:30
HOUR({datetime})
=> 15

// Midnight
HOUR("2021/4/1 00:00")
=> 0

// Late evening
HOUR("2021/4/1 23:59")
=> 23
```

---

## MINUTE()
Extracts the minute from a datetime.

**Syntax:** `MINUTE(datetime)`

**Parameters:**
- datetime: the datetime to extract the minute from

**Returns:** A number from 0 to 59 representing the minute.

**Examples:**
```
// Extract minute from datetime. {datetime} is 2021/4/1 15:30
MINUTE({datetime})
=> 30

// Top of hour
MINUTE("2021/4/1 15:00")
=> 0

// End of hour
MINUTE("2021/4/1 15:59")
=> 59
```

---

## SECOND()
Extracts the second from a datetime.

**Syntax:** `SECOND(datetime)`

**Parameters:**
- datetime: the datetime to extract the second from

**Returns:** A number from 0 to 59 representing the second.

**Examples:**
```
// Extract second from datetime. {datetime} is 2021/4/1 15:30:45
SECOND({datetime})
=> 45

// Top of minute
SECOND("2021/4/1 15:30:00")
=> 0

// End of minute
SECOND("2021/4/1 15:30:59")
=> 59
```

---

## SET_LOCALE()
Sets the language locale for date formatting and parsing within a formula.

**Syntax:** `SET_LOCALE(date, locale)`

**Parameters:**
- date: the date expression to apply the locale to
- locale: the language locale code (see locale descriptors table below)

**Examples:**
```
// Format date in French locale
SET_LOCALE(DATETIME_FORMAT({date}, "MMMM DD, YYYY"), "fr")
=> "avril 01, 2021"

// Format date in Chinese locale
SET_LOCALE(DATETIME_FORMAT({date}, "YYYY年M月D日"), "zh-cn")
=> "2021年4月1日"

// Parse date in Spanish locale
SET_LOCALE(DATETIME_PARSE("1 de abril de 2021", "D [de] MMMM [de] YYYY"), "es")
=> 2021/4/1
```

---

## SET_TIMEZONE()
Sets the timezone for date operations within a formula.

**Syntax:** `SET_TIMEZONE(date, timezone)`

**Parameters:**
- date: the date expression to apply the timezone to
- timezone: the timezone identifier (e.g., "America/New_York", "Asia/Shanghai", "Europe/London")

**Examples:**
```
// Convert to New York timezone
SET_TIMEZONE({datetime}, "America/New_York")
=> Adjusted datetime

// Convert to Shanghai timezone
SET_TIMEZONE({datetime}, "Asia/Shanghai")
=> Adjusted datetime

// Convert to UTC
SET_TIMEZONE({datetime}, "UTC")
=> Adjusted datetime
```

---

## CREATED_TIME()
Returns the date and time when the current record was created.

**Syntax:** `CREATED_TIME()`

**Parameters:** This function requires no parameters.

**Examples:**
```
// Get record creation time
CREATED_TIME()
=> Date (example: 2021/4/1 10:30)

// Calculate days since creation
DATETIME_DIFF(TODAY(), CREATED_TIME(), "days")
=> Number

// Format creation time
DATETIME_FORMAT(CREATED_TIME(), "YYYY-MM-DD HH:mm")
=> "2021-04-01 10:30"
```

---

## LAST_MODIFIED_TIME()
Returns the date and time when the current record was last modified.

**Syntax:** `LAST_MODIFIED_TIME()`

**Parameters:** This function requires no parameters.

**Examples:**
```
// Get last modification time
LAST_MODIFIED_TIME()
=> Date (example: 2021/4/5 14:20)

// Calculate time since last update
TONOW(LAST_MODIFIED_TIME(), "hours")
=> "6 hours"

// Check if modified today
IS_SAME(LAST_MODIFIED_TIME(), TODAY(), "day")
=> Boolean
```

---

## Time Unit Descriptors

These unit descriptors are used in date calculation and difference functions (DATEADD, DATETIME_DIFF, TONOW, FROMNOW):

| Unit | Abbreviations | Description |
|------|--------------|-------------|
| milliseconds | ms, millisecond | Milliseconds (1/1000 second) |
| seconds | s, sec, second | Seconds |
| minutes | m, min, minute | Minutes |
| hours | h, hr, hour | Hours |
| days | d, day | Days (24 hours) |
| weeks | w, wk, week | Weeks (7 days) |
| months | M, mon, month | Months (variable length) |
| quarters | Q, qtr, quarter | Quarters (3 months) |
| years | y, yr, year | Years |

**Usage Examples:**
```
DATEADD({date}, 5, "days")        // or "day" or "d"
DATETIME_DIFF({end}, {start}, "hours")  // or "hour" or "h"
TONOW({date}, "months")           // or "month" or "M"
```

---

## Date Format Descriptors

These format descriptors are used in DATETIME_FORMAT and DATETIME_PARSE functions:

### Year
| Format | Output | Description |
|--------|--------|-------------|
| YY | 21 | Two-digit year |
| YYYY | 2021 | Four-digit year |

### Month
| Format | Output | Description |
|--------|--------|-------------|
| M | 1-12 | Month number |
| MM | 01-12 | Month number with leading zero |
| MMM | Jan-Dec | Short month name |
| MMMM | January-December | Full month name |

### Day of Month
| Format | Output | Description |
|--------|--------|-------------|
| D | 1-31 | Day of month |
| DD | 01-31 | Day of month with leading zero |

### Day of Week
| Format | Output | Description |
|--------|--------|-------------|
| d | 0-6 | Day of week (0=Sunday) |
| dd | Su-Sa | Short day name (2 letters) |
| ddd | Sun-Sat | Short day name (3 letters) |
| dddd | Sunday-Saturday | Full day name |

### Hour
| Format | Output | Description |
|--------|--------|-------------|
| H | 0-23 | Hour (24-hour, no leading zero) |
| HH | 00-23 | Hour (24-hour, with leading zero) |
| h | 1-12 | Hour (12-hour, no leading zero) |
| hh | 01-12 | Hour (12-hour, with leading zero) |

### Minute
| Format | Output | Description |
|--------|--------|-------------|
| m | 0-59 | Minute (no leading zero) |
| mm | 00-59 | Minute (with leading zero) |

### Second
| Format | Output | Description |
|--------|--------|-------------|
| s | 0-59 | Second (no leading zero) |
| ss | 00-59 | Second (with leading zero) |

### AM/PM
| Format | Output | Description |
|--------|--------|-------------|
| a | am/pm | Lowercase meridiem |
| A | AM/PM | Uppercase meridiem |

### Timezone
| Format | Output | Description |
|--------|--------|-------------|
| Z | -05:00 | Offset from UTC |
| ZZ | -0500 | Offset from UTC (compact) |

**Usage Examples:**
```
DATETIME_FORMAT({date}, "YYYY-MM-DD")           => "2021-04-01"
DATETIME_FORMAT({date}, "MMM D, YYYY")          => "Apr 1, 2021"
DATETIME_FORMAT({date}, "dddd, MMMM DD, YYYY")  => "Thursday, April 01, 2021"
DATETIME_FORMAT({date}, "YYYY/MM/DD HH:mm:ss")  => "2021/04/01 15:30:45"
DATETIME_FORMAT({date}, "h:mm A")               => "3:30 PM"
```

---

## Language Locale Descriptors

These locale codes are used with SET_LOCALE and DATETIME_PARSE functions:

| Locale Code | Language | Example Month Output |
|-------------|----------|---------------------|
| en | English | January, February, ... |
| zh-cn | Chinese (Simplified) | 一月, 二月, ... |
| zh-tw | Chinese (Traditional) | 一月, 二月, ... |
| fr | French | janvier, février, ... |
| es | Spanish | enero, febrero, ... |
| pt | Portuguese | janeiro, fevereiro, ... |
| ru | Russian | январь, февраль, ... |
| ar | Arabic | يناير, فبراير, ... |
| de | German | Januar, Februar, ... |
| ja | Japanese | 1月, 2月, ... |
| ko | Korean | 1월, 2월, ... |
| hi | Hindi | जनवरी, फ़रवरी, ... |

**Usage Examples:**
```
SET_LOCALE(DATETIME_FORMAT({date}, "MMMM"), "fr")     => "avril"
SET_LOCALE(DATETIME_FORMAT({date}, "MMMM"), "zh-cn")  => "四月"
SET_LOCALE(DATETIME_FORMAT({date}, "dddd"), "es")     => "jueves"
DATETIME_PARSE("avril 2021", "MMMM YYYY", "fr")       => 2021/4/1
```

---

## Practical Guide: Working with Dates

### Getting Current Date/Time
```
TODAY()                          // Current date: 2021/4/1
NOW()                            // Current datetime: 2021/4/1 15:30
```

### Date Arithmetic
```
// Add/subtract time
DATEADD({date}, 7, "days")       // One week later
DATEADD({date}, -1, "months")    // One month ago

// Calculate differences
DATETIME_DIFF({end}, {start}, "days")     // Days between dates
DATETIME_DIFF(NOW(), {created}, "hours")  // Hours since creation
```

### Date Comparisons
```
// Use IS_AFTER, IS_BEFORE, IS_SAME instead of operators
IS_AFTER({deadline}, TODAY())             // Is deadline in future?
IS_BEFORE({start}, {end})                 // Is start before end?
IS_SAME({date1}, {date2}, "month")        // Same month?
```

### Date Formatting
```
// Format for display
DATETIME_FORMAT({date}, "MMM D, YYYY")           // Apr 1, 2021
DATETIME_FORMAT({date}, "YYYY-MM-DD HH:mm:ss")   // 2021-04-01 15:30:00

// Extract components
YEAR({date})        // 2021
MONTH({date})       // 4
DAY({date})         // 1
```

### Workday Calculations
```
// Business days
WORKDAY({start}, 5)                      // 5 business days later
WORKDAY_DIFF({start}, {end})             // Business days between
WORKDAY({start}, 10, {holidays})         // Excluding holidays
```

### Time Tracking
```
// Time since/until
TONOW({created}, "days")                 // "30 days"
FROMNOW({deadline}, "hours")             // "48 hours"

// Record timestamps
CREATED_TIME()                           // When record was created
LAST_MODIFIED_TIME()                     // When last updated
```

---

## Tips for Using Date Functions

1. **Use Specialized Functions**: Prefer IS_AFTER(), IS_BEFORE(), IS_SAME() over comparison operators for clarity
2. **Time Units**: Use abbreviations ("d", "h", "m") or full names ("days", "hours", "minutes") - both work
3. **Format Patterns**: Refer to the format descriptors table for custom date formatting
4. **Locale Awareness**: Use SET_LOCALE for multilingual date displays
5. **Workdays**: WORKDAY and WORKDAY_DIFF automatically exclude weekends
6. **Granularity**: Use the unit parameter in comparison functions to compare at different levels (year, month, day)
7. **Record Timestamps**: CREATED_TIME and LAST_MODIFIED_TIME are automatic - no manual updates needed
8. **Timezone Handling**: Use SET_TIMEZONE when working with dates across time zones
