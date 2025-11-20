# AITable Formula Overview

This is a quick reference guide to AITable's formula system. For detailed documentation on specific formula categories, see the links at the bottom.

## What Are AITable Formulas?

AITable formulas allow you to create calculated fields and filter records using expressions. Formulas can be used in two main contexts:

1. **Formula Fields** - Create calculated fields that automatically update based on other field values
2. **Filter Formulas** - Filter records when using the `get_records` tool via the `filterByFormula` parameter

## Basic Syntax

### Field References
Wrap field names in curly braces:
```
{Field Name}
{age}
{Unit Price}
```

### Data Types
- **Strings**: Use double quotes: `"text"`
- **Numbers**: Write directly: `42` or `3.14`
- **Booleans**: `TRUE` or `FALSE`
- **Null**: `BLANK()`

### Parameter Notation

In formula documentation, parameters are described with these indicators:

- **string**: indicates a string value / text type value
- **text**: text type value
- **logical**: the logical value (true/false)
- **number**: the numeric value
- **date**: date value
- **item**: denotes an array value
- **[ ]**: Optional parameters (can be omitted)

## Formula Categories

AITable provides 70+ functions organized into categories:

### Operators
- **Numeric**: `+` `-` `*` `/`
- **String**: `&` (concatenation)
- **Logical**: `>` `>=` `<` `<=` `=` `!=` `&&` `||`

### Numeric Functions (19 functions)
SUM, AVERAGE, MAX, MIN, ROUND, ROUNDUP, ROUNDDOWN, CEILING, FLOOR, EVEN, ODD, INT, ABS, SQRT, MOD, POWER, EXP, LOG, VALUE

### String Functions (15 functions)
CONCATENATE, FIND, SEARCH, MID, REPLACE, SUBSTITUTE, LEN, LEFT, RIGHT, LOWER, UPPER, REPT, T, TRIM, ENCODE_URL_COMPONENT

### Logical Functions (10 functions)
IF, SWITCH, TRUE, FALSE, AND, OR, XOR, BLANK, ERROR, IS_ERROR, NOT

### Date Functions (27 functions)
TODAY, NOW, TONOW, FROMNOW, DATEADD, DATETIME_DIFF, WORKDAY, WORKDAY_DIFF, IS_AFTER, IS_BEFORE, IS_SAME, DATETIME_FORMAT, DATETIME_PARSE, DATESTR, TIMESTR, YEAR, MONTH, WEEKDAY, WEEKNUM, DAY, HOUR, MINUTE, SECOND, SET_LOCALE, SET_TIMEZONE, CREATED_TIME, LAST_MODIFIED_TIME

### Array Functions (8 functions)
COUNT, COUNTA, COUNTALL, COUNTIF, ARRAYCOMPACT, ARRAYFLATTEN, ARRAYJOIN, ARRAYUNIQUE

### Record Function
RECORD_ID

## Quick Examples

### Basic Calculation
```
{Unit Price} * {Quantity}
```

### Text Concatenation
```
{First Name} & " " & {Last Name}
```

### Conditional Logic
```
IF({Score} >= 60, "Pass", "Fail")
```

### Date Calculation
```
DATETIME_DIFF({Due Date}, TODAY(), "days")
```

### Filtering Records
```
{Status} = "Active" && {Priority} = "High"
```

## Tips for Using Formulas

1. **Field References**: Always wrap field names in curly braces `{Field Name}`
2. **Case Sensitivity**: Text comparisons are case-sensitive unless you use LOWER() or UPPER()
3. **Type Matching**: Ensure you're comparing compatible types (text with text, numbers with numbers)
4. **Nested Functions**: You can nest functions, but keep formulas readable
5. **Performance**: Complex formulas in large datasets may slow down queries
6. **Testing**: Test formulas with a small dataset first
7. **Error Handling**: Use IS_ERROR() and ERROR() for robust formulas

## Common Pitfalls

1. **Missing Curly Braces**: Use `{Field Name}` not `Field Name`
2. **Quote Mismatches**: Use consistent quotes for strings
3. **Type Errors**: Can't use text operators on numbers and vice versa
4. **Division by Zero**: Check for zero before dividing
5. **Empty Values**: Remember that empty fields may affect calculations
6. **Date Comparisons**: Use IS_AFTER(), IS_BEFORE(), IS_SAME() instead of comparison operators

## Output Formats

### Boolean Values in Cells
After logical operations, boolean values are displayed as:
- **TRUE**: "✅ checked"
- **FALSE**: "unchecked"

When participating in arithmetic operations:
- **TRUE** = 1
- **FALSE** = 0

## Detailed Documentation

For comprehensive documentation on specific formula types, refer to:

- **Formula Operators** - Detailed guide to +, -, *, /, &, comparison, and logical operators
- **Numeric Functions** - Complete reference for all numeric/math functions
- **String Functions** - Text manipulation and formatting functions
- **Logical Functions** - Conditional logic and decision-making functions
- **Date Functions** - Date/time calculations and formatting (includes reference tables for units, formats, and locales)
- **Array Functions** - Functions for working with multi-select and linked record fields

## Additional Resources

For the most up-to-date formula documentation, refer to:
- AITable Official Documentation: https://aitable.ai/help/
- AITable Formula Guide: https://aitable.ai/help/formulas
