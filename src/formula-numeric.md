# AITable Numeric Functions

Numeric functions are formula functions that can operate on data of a numeric type. Fields of the numeric type include numbers, currencies, percentages, scores, and ratings.

## Function Index

- [SUM](#sum) - Add all values together
- [AVERAGE](#average) - Calculate arithmetic mean
- [MAX](#max) - Returns largest value
- [MIN](#min) - Returns smallest value
- [ROUND](#round) - Rounds to specified digits
- [ROUNDUP](#roundup) - Rounds away from zero
- [ROUNDDOWN](#rounddown) - Rounds toward zero
- [CEILING](#ceiling) - Rounds up to nearest multiple
- [FLOOR](#floor) - Rounds down to nearest multiple
- [EVEN](#even) - Rounds to nearest even number
- [ODD](#odd) - Rounds to nearest odd number
- [INT](#int) - Rounds down to integer
- [ABS](#abs) - Absolute value
- [SQRT](#sqrt) - Square root
- [MOD](#mod) - Remainder after division
- [POWER](#power) - Raises base to power
- [EXP](#exp) - Exponential (e^power)
- [LOG](#log) - Logarithm with base
- [VALUE](#value) - Converts text to number

---

## SUM()
Add all values together.

**Syntax:** `SUM(number1, [number2, …])`

**Parameters:**
- number: numerical parameter for the operation. Fields of the numeric type include numbers, currencies, percentages, scores.

**Examples:**
```
// Add only numeric values
SUM(1, 2, 3)
=> 6

// Add the numeric value to the text value
SUM(1, 2, "3")
=> 6

// Add numeric values to text
SUM(1, 2, "3 ")
=> 3

// Add numeric fields
SUM({math score}, {English score}, {Chinese score})
=> Number

// Add a field of numeric type to a numeric value
SUM({math score}, {English score}, 60)
=> Number
```

---

## AVERAGE()
Calculate the arithmetic mean of multiple values.

**Syntax:** `AVERAGE(number1, [number2, …])`

**Parameters:**
- number: numerical parameter for the operation.

**Examples:**
```
// Average a pure value
AVERAGE(1, 2, 3)
=> 2

// Average the value with the text value
AVERAGE(1, 2, "3")
=> 2

// Average the value with the text
AVERAGE(1, 2, "3 ")
=> 1

// Find the average value of a numeric field
AVERAGE({math score}, {English score}, {Chinese score})
=> Number

// Average the fields of the numeric type with the numeric value
AVERAGE({math score}, {English score}, 60)
=> Number
```

---

## MAX()
Returns the largest of multiple values. Can also compare dates.

**Syntax:** `MAX(number1, [number2, …])`

**Parameters:**
- number: numerical parameter for the operation. If input values are in date format, returns the latest date.

**Examples:**
```
// Find the maximum value of a pure value
MAX(1, 2, 3)
=> 3

// Maximizes the value with the text value
MAX(1, 2, "3")
=> 3

// Maximizes the value with the text
MAX(1, 2, "3 ")
=> 2

// Maximizes the value of a field of a numeric type
MAX({Math score}, {English score}, {Chinese score})
=> Number

// Maximizes the value of a field of a numeric type
MAX({Math score}, {English score}, 60)
=> Number

// Find the latest date for a field of date type
MAX({time 1}, {time 2})
=> date
```

---

## MIN()
Returns the smallest of multiple values. Can also compare dates.

**Syntax:** `MIN(number1, [number2, …])`

**Parameters:**
- number: numerical parameter for the operation. If input values are in date format, returns the earliest date.

**Examples:**
```
// Find a pure numerical minimum
MIN(1, 2, 3)
=> 1

// Minimize numeric values with text values
MIN("1", 2, 3)
=> 1

// Minimize the value with the text
MIN(" one ", 2, 3)
=> 2

// Minimize the value of a numeric field
MIN({math score}, {English score}, {Chinese score})
=> Number

// Find the minimum value for a field of a numeric type
MIN({math score}, {English score}, 60)
=> Number

// Find the earliest date for a field of date type
MIN({time 1}, {time 2})
=> date
```

---

## ROUND()
Rounds a value to the specified number of digits.

**Syntax:** `ROUND(value, [precision])`

**Parameters:**
- value: the rounded value
- precision: Optional, specifies the number of rounded digits. Default is 0.
  - If precision > 0: round to the specified decimal place
  - If precision = 0: round to the nearest integer
  - If precision < 0: round to the left of the decimal point

**Examples:**
```
// If precision is not specified, it defaults to 0
ROUND(1.55)
=> 2.0

// precision > 0 to round to the specified decimal place
ROUND(1.45, 1)
=> 1.5

// precision = 0, rounded to the nearest integer
ROUND(1.45, 0)
=> 1.0

// precision < 0, rounded to the left of the decimal point
ROUND(321.45, -2)
=> 300.0

// precision > 0. If the value is a decimal, the system automatically rounded down the precision (1.6 >> 1.0)
ROUND(5.45, 1.6)
=> 5.5
```

---

## ROUNDUP()
Rounds the value in the direction of increasing the absolute value (away from 0).

**Syntax:** `ROUNDUP(value, [precision])`

**Parameters:**
- value: the value to be rounded
- precision: Optional, default is 0
  - Direction of absolute value increase: away from 0 direction
- ROUNDUP() is similar to ROUND() except that it always rounds the value in the direction of increasing the absolute value
  - If precision > 0: round to the specified decimal place
  - If precision = 0: round to the nearest integer
  - If precision < 0: rounding to the left of the decimal point

**Examples:**
```
// If precision is not specified, it defaults to 0
ROUNDUP(1.55)
=> 2.0

ROUNDUP(1.11)
=> 2.0

// precision > 0, rounding to the specified decimal place
ROUNDUP(1.11, 1)
=> 1.2

// precision = 0, rounded to the nearest integer
ROUNDUP(1.11, 0)
=> 2.0

// precision < 0, rounding to the left of the decimal point
ROUNDUP(321.45, -2)
=> 400.0

// precision > 0. If the value is a decimal, the system automatically rounded down the precision (1.6 >> 1.0)
ROUNDUP(5.45, 1.6)
=> 5.5
```

---

## ROUNDDOWN()
Rounds the value in the direction of decreasing the absolute value (toward 0).

**Syntax:** `ROUNDDOWN(value, [precision])`

**Parameters:**
- value: the value to be rounded
- precision: Optional, default is 0
  - Direction of absolute value decrease: toward 0 direction
- ROUNDDOWN() is similar to ROUND() except that it always rounds the value in the direction of decreasing the absolute value
  - If precision > 0: round to the specified decimal place
  - If precision = 0: round to the nearest integer
  - If precision < 0: rounding to the left of the decimal point

**Examples:**
```
// If precision is not specified, it defaults to 0
ROUNDDOWN(1.55)
=> 1.0

ROUNDDOWN(1.11)
=> 1.0

// precision > 0 to round to the specified decimal place
ROUNDDOWN(1.11, 1)
=> 1.1

// precision = 0, rounded to the nearest integer
ROUNDDOWN(1.11, 0)
=> 1.0

// precision < 0, rounded to the left of the decimal point
ROUNDDOWN(321.45, -2)
=> 300.0

// precision > 0. If the value is a decimal, the system automatically rounded down the precision (1.6 >> 1.0)
ROUNDDOWN(5.45, 1.6)
=> 5.4
```
---

## CEILING()
Rounds a value up to a multiple of the nearest specified cardinality.

**Syntax:** `CEILING(value, [significance])`

**Parameters:**
- value: the value to be rounded
- significance: Optional, the cardinality used to round up. Default is 1. Return value is a multiple of the cardinality.
- Round up: return value must be greater than or equal to the original value
- If value > 0, significance > 0: value is rounded away from 0
- If value < 0, significance > 0: value is rounded toward 0
- If significance < 0: returns error value NaN

**Examples:**
```
// If significance not specified, defaults to 1
CEILING(1.55)
=> 2.0

CEILING(1.11)
=> 2.0

// If value > 0, significance > 0, rounded away from 0
CEILING(1.11, 1)
=> 2.0

CEILING(1.11, 0.1)
=> 1.2

// If value < 0, significance > 0, rounded toward 0
CEILING(-1.11, 1)
=> -1.0

CEILING(-1.99, 0.1)
=> -1.9

// If significance < 0, the error value NaN is returned
CEILING(1.11, -1)
=> NaN
```

---

## FLOOR()
Rounds the value down to a multiple of the nearest specified cardinality.

**Syntax:** `FLOOR(value, [significance])`

**Parameters:**
- value: the value to be rounded
- significance: Optional, the cardinality used to round down. Default is 1.
- Round down: return value must be less than or equal to the original value
- If value > 0, significance > 0: value is rounded toward 0
- If value < 0, significance > 0: value is rounded away from 0
- If significance < 0: returns error value NaN

**Examples:**
```
// If significance not specified, defaults to 1
FLOOR(1.55)
=> 1.0

FLOOR(1.11)
=> 1.0

// If value > 0, significance > 0, rounded toward 0
FLOOR(1.55, 1)
=> 1.0

FLOOR(1.55, 0.1)
=> 1.5

// If value < 0, significance > 0, rounded away from 0
FLOOR(-1.11, 1)
=> -2.0

FLOOR(-1.99, 0.1)
=> -2.0

// If significance < 0, the error value NaN is returned
FLOOR(1.11, -1)
=> NaN
```

---

## EVEN()
Rounds the value to the nearest even number in the direction of increasing the absolute value.

**Syntax:** `EVEN(value)`

**Parameters:**
- value: the value to be rounded
- Direction of absolute value increase: away from 0 direction

**Examples:**
```
// value > 0
EVEN(1.5)
=> 2.0

EVEN(3)
=> 4.0

// value = 0
EVEN(0)
=> 0.0

// value < 0
EVEN(-1.5)
=> -2.0

EVEN(-3)
=> -4.0
```

---

## ODD()
Rounds the value to the nearest odd number in the direction of increasing the absolute value.

**Syntax:** `ODD(value)`

**Parameters:**
- value: the value to be rounded
- Direction of absolute value increase: away from 0 direction

**Examples:**
```
// value > 0
ODD(1.5)
=> 3.0

ODD(3)
=> 3.0

// value = 0
ODD(0)
=> 1.0

// value < 0
ODD(-1.5)
=> -3.0

ODD(-3)
=> -3.0
```

---

## INT()
Rounds the value down to the nearest integer.

**Syntax:** `INT(value)`

**Parameters:**
- value: the value to be rounded
- Round down: return value must be less than or equal to the original value

**Examples:**
```
// value > 0
INT(1.5)
=> 1.0

INT(3)
=> 3.0

// value = 0
INT(0)
=> 0.0

// value < 0
INT(-1.5)
=> -2.0

INT(-3)
=> -3.0
```

---

## ABS()
Takes the absolute value of the value.

**Syntax:** `ABS(value)`

**Parameters:**
- value: the value to be evaluated in absolute value
- Absolute value: positive number returns itself, negative number removes the negative sign

**Examples:**
```
// value > 0
ABS(1.5)
=> 1.5

ABS(3)
=> 3.0

// value = 0
ABS(0)
=> 0.0

// value < 0
ABS(-1.5)
=> 1.5

ABS(-3)
=> 3.0
```

---

## SQRT()
Computes the arithmetic square root of a value.

**Syntax:** `SQRT(value)`

**Parameters:**
- value: the value to take the square root of. Must be >= 0, otherwise returns NaN
- Arithmetic square root: The square root of 4 is ± 2. 2 is the arithmetic square root.

**Examples:**
```
// value > 0
SQRT(4)
=> 2.0

// value = 0
SQRT(0)
=> 0.0

// value < 0
SQRT(-1.5)
=> NaN
```

---

## MOD()
Divide two values to get the remainder.

**Syntax:** `MOD(value, divisor)`

**Parameters:**
- value: the dividend
- divisor: the divisor
- Remainder: the part of integer division where the dividend is not completely divided
- The return symbol is the same as that of divisor

**Examples:**
```
// Return the remainder if the value is not completely divided
MOD(7, 3)
=> 1.0

MOD(2, 3)
=> 2.0

// Symbol of the result returned is the same as that of the divisor
MOD(7, 3)
=> 1.0

MOD(7, -3)
=> -1.0

MOD(-7, -3)
=> -1.0

// When the value is completely divided, return 0
MOD(6, 3)
=> 0.0
```

---

## POWER()
Computes the power of a value (base).

**Syntax:** `POWER(base, power)`

**Parameters:**
- base: the base
- power: the index
  - Power > 1: return base to the power
  - Power < 1 and power > 0: return base root 1/power
  - Power = 0: returns 1
  - Power < 0: return base inverse to the power

**Examples:**
```
// Power > 1, return base to the power
POWER(2, 3)
=> 8.00

// Power < 1 and power > 0, return base root 1/power
POWER(8, 1/3)
=> 2.00 (8 to the cube root)

// If power = 0, 1 is returned
POWER(2, 0)
=> 1.00

// If power < 0, return the power of base inverse
POWER(2, -2)
=> 0.25 (1/2 to the second power)

// If base < 0 and power is decimal, NaN is returned
POWER(-8, 1/3)
=> NaN
```

---

## EXP()
Compute the power of e (natural number e ≈ 2.718282).

**Syntax:** `EXP(power)`

**Parameters:**
- power: the index
- e: The natural number e is about 2.718282, base of the natural logarithm
  - Power > 1: return e to the power
  - Power < 1 and power > 0: return e to the square root of 1/power
  - Power = 0: returns 1
  - Power < 0: return e inverse to the power

**Examples:**
```
// Power > 1, return e to the power
EXP(2)
=> 7.39

// Power < 1 and power > 0, return e to the square root of 1/power
EXP(1/2)
=> 1.65 (e to the square root of 2)

// If power = 0, 1 is returned
EXP(0)
=> 1.00

// If power < 0, return e inverse to the power
EXP(-2)
=> 0.14 (1/e to the second power)
```

---

## LOG()
Computes the logarithm of a value based on the specified base.

**Syntax:** `LOG(number, [base])`

**Parameters:**
- number: The number used to calculate the logarithm. Must be > 0, otherwise outputs NaN.
- base: Optional, the base of logarithms (base > 0 and base ≠ 1). Default is 10.
- Logarithm: logarithm is the inverse of exponentiation

**Examples:**
```
// number > 0, do not enter base
LOG(100)
=> 2.00

// number > 0, base > 0 and base ≠ 1
LOG(8, 2)
=> 3

LOG(1/8, 1/2)
=> 3

// number <= 0
LOG(-100)
=> NaN

// number > 0, base < 0 or base = 1
LOG(8, -2)
=> NaN

LOG(8, 1)
=> NaN
```

---

## VALUE()
Converts a text value to a numeric value.

**Syntax:** `VALUE(text)`

**Parameters:**
- text: the text value to be converted

**Examples:**
```
// Format the input text value
VALUE("$10")
=> 10.00

VALUE("Ticket: ¥10")
=> 10.00

VALUE("125,000")
=> 125.00
```

---

## Tips for Using Numeric Functions

1. **Type Conversion**: Many functions automatically convert text to numbers when possible
2. **Error Handling**: Functions return NaN for invalid operations (e.g., SQRT of negative number)
3. **Precision**: Be aware of precision parameter behavior in rounding functions
4. **Date Compatibility**: MAX and MIN can also work with date values
5. **Performance**: Complex calculations on large datasets may impact performance
