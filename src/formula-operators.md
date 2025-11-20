# AITable Formula Operators

Operators are an important part of formulas that represent the rules of operations between data. This guide covers all operators available in AITable formulas.

## Operator Categories

Operators are classified into three types:
1. **Numeric Operators** - Mathematical operations
2. **String Operators** - Text manipulation
3. **Logical Operators** - Comparisons and conditions

---

## Numeric Operators

### Add (+)
Adds two values together.

**Examples:**
```
// Adding pure values
1 + 2
=> 3

// Text and numerical summation (the plus sign will stitch the value when it encounters the text value)
"1" + 2
=> "12"

"badge" + 2
=> "badge 2"

// Numeric type of {field} and numeric value summation
{age} + 1
=> numeric value

// Numeric type of {field} summed
{language score} + {math score} + {foreign language score}
=> numeric value

// Text type {field} splicing (we recommend the use of "&" for splicing text)
{class} + {name}
=> text (example: "Class 8 Hu")
```

### Minus (-)
Subtracts two values from each other.

**Examples:**
```
// Pure numeric subtraction
3 - 2
=> 1

// Text and numeric subtraction
"2" - 1
=> 1

// Numeric type of {field} and numeric subtraction
{age} - 1
=> numeric value

// Numeric type of {field} subtracted
{sales} - {cost}
=> numeric value
```

### Multiply (*)
Multiply two values together.

**Examples:**
```
// Pure numeric multiplication
3 * 2
=> 6

// Text and numeric multiplication
"3" * 2
=> 6

// {field} of the numeric type multiplied with the numeric value
{hourly wage} * 8
=> numerical value

// {field} of numeric type multiplied by
{unit price} * {quantity}
=> numerical value
```

### Divide (/)
Divides two values.

**Examples:**
```
// Pure numeric division
6 / 3
=> 2

// Division of text and numeric values
"6" / 2
=> 3

// Division of numeric types of {field} and numeric values
{annual interest rate} / 365
=> numeric value

// Division of numeric types of {field}
{sales} / {quantity}
=> numeric value
```

---

## String Operators

### Text Concatenation (&)
Splices two text values together. The effect is equivalent to the CONCATENATE() function.

**Examples:**
```
// Text splice
"Class 8" & "Xiaohu"
=> "Class 8 Xiaohu"

// Text type of {field} with text splicing
{class} & "Xiao Hu"
=> text (example: "Class 8 Xiaohu")

// Text type of {field} splicing
{class} & {name}
=> text (example: "Class 8 Xiaohu")

{class} & "-" & {name}
=> text (example: "Class 8 - Xiao Hu")

// Text and date type of {field} splice
"Project to be completed by:" & {deadline} & "by"
=> text

// Text with a numeric type of {field} splice
"sales this month:" & {sales}
=> text

// Exception: spliced double quotes (use backslash as escape character)
" \" " & "Xiao Hu" & " \" "
=> " "Xiaohu" "
```

---

## Logical Operators

Logical operators perform comparisons and return boolean values (TRUE or FALSE). In cells, these are represented as "checked ✅" (TRUE) or "unchecked" (FALSE).

### Greater Than (>)
Determines if the first value is greater than the second value. Outputs TRUE if greater, otherwise FALSE.

**Examples:**
```
// Determine the size of a pure value
3 > 2
=> TRUE

// Determine the size of text and pure numeric values
"3" > 2
=> TRUE

// Determine the size of the numeric type of {field} with a pure numeric value
{test scores} > 60
=> Boolean

// Determine the size of the numeric type of {field}
{actual income} > {target income}
=> Boolean

// Determine the date 1 later than the date 2 (IS_AFTER() function recommended)
{cut-off time} > {current time}
=> Boolean
```

### Greater Than or Equal To (>=)
Determines if the first value is greater than or equal to the second value. Outputs TRUE if greater or equal, otherwise FALSE.

**Examples:**
```
// Determine the size of a pure value
3 >= 2
=> TRUE

// Determine the size of text and pure values
"3" >= 2
=> TRUE

// Determine the size of the numeric type of {field} with a pure numeric value
{test scores} >= 60
=> Boolean

// Determine the size of the numeric type of {field}
{actual income} >= {target income}
=> Boolean

// Determine the date 1 later than or equal to the date 2 (IS_AFTER() function recommended)
{cut-off time} >= {current time}
=> Boolean
```

### Less Than (<)
Determines whether the first value is less than the second value. Outputs TRUE if less, otherwise FALSE.

**Examples:**
```
// Determine the size of the pure value
2 < 3
=> TRUE

// Determine the size of text versus pure values
"2" < 3
=> TRUE

// Determine the size of the {field} of the numeric type versus the pure value
{test score} < 60
=> Boolean

// Determine the size of the {field} of the numeric type
{actual income} < {target income}
=> Boolean

// Determine that date 1 is earlier than date 2 (IS_BEFORE() function recommended)
{cut-off time} < {current time}
=> Boolean
```

### Less Than or Equal To (<=)
Determines whether the first value is less than or equal to the second value. Outputs TRUE if less or equal, otherwise FALSE.

**Examples:**
```
// Determine the size of the pure value
2 <= 3
=> TRUE

// Determine the size of text versus pure values
"2" <= 3
=> TRUE

// Determine the size of the {field} of the numeric type versus the pure value
{test score} <= 60
=> Boolean

// Determine the size of the {field} of the numeric type
{actual income} <= {target income}
=> Boolean

// If date 1 is earlier than or equal to date 2 (IS_BEFORE() function recommended)
{cut-off time} <= {current time}
=> Boolean
```

### Equal To (=)
Determines whether the first value is equal to the second value. Outputs TRUE if equal, otherwise FALSE.

**Examples:**
```
// Determine the size of the pure value
2 = 2
=> TRUE

// Determine the size of text versus pure values
"2" = 2
=> TRUE

// Determine the size of the {field} of the numeric type versus the pure value
{test score} = 60
=> Boolean

// Determine the size of the {field} of the numeric type
{actual income} = {target income}
=> Boolean

// To determine that date 1 equals date 2 (IS_SAME() function recommended)
{cut-off time} = {current time}
=> Boolean
```

### Not Equal To (!=)
Determines whether the first value is not equal to the second value. Outputs TRUE if not equal, otherwise FALSE.

**Examples:**
```
// Determine the size of the pure value
3 != 2
=> TRUE

// Determine the size of text versus pure values
"2" != 2
=> FALSE

// Determine the size of the {field} of the numeric type versus the pure value
{test score} != 60
=> Boolean

// Determine the size of the {field} of the numeric type
{actual income} != {target revenue}
=> Boolean

// Determine that date 1 is not equal to date 2
{deadline} != {Current time}
=> Boolean
```

### And (&&)
Represents the AND operation of two logical conditions. Outputs TRUE if both of the logical conditions are TRUE; otherwise, outputs FALSE.

**Examples:**
```
// The two logical conditions are true
3 > 2 && 2 > 1
=> TRUE

// One logical condition is true and one condition is false
3 > 2 && 1 > 2
=> FALSE

// The two logical conditions are false
0 > 2 && 1 > 2
=> FALSE

// Check whether the value is in a certain range
IF({test score} > 80 && {test score} < 100, "Excellent", "other")
=> text

// Determine whether the project is complete. If deadline is not met and is marked as completed, output completed on time
IF(IS_AFTER({to the deadline}, TODAY()) && {completion status} = "completed", "✅ finish", "other states")
=> text

// Check whether multiple selected fields are true. {rent}, {electricity}, {water} are all tick fields (AND() function recommended)
IF({the rent} = TRUE() && {electricity charge} = TRUE() && {water} = TRUE(), "paid out this month, water and electricity", "did not pay for this month hydropower")
=> text
```

### Or (||)
Represents the OR operation of two logical conditions. Outputs TRUE if one of the logical conditions is TRUE; if both are FALSE, outputs FALSE.

**Examples:**
```
// The two logical conditions are true
3 > 2 || 2 > 1
=> TRUE

// One logical condition is true and one condition is false
3 > 2 || 1 > 2
=> TRUE

// The two logical conditions are false
0 > 2 || 1 > 2
=> FALSE

// Check whether the value is not in a certain range
IF({exam} > 100 || {exam} < 0, "achievements recorded wrong", "normal entry")
=> text
```

---

## Practical Examples

### Order Management: Check Profitability
```
// Check if profit per item is positive
{unit price} > {cost price}
=> Boolean (checked if true, unchecked if false)

// Or directly check profit
{profit per product} >= 0
=> Boolean
```

### Order Management: Promotion Status
```
// If gross margin is less than 30%, it's promotional
{gross margin} < 0.3
=> Boolean

// If equal to 30%, it's also promotional
{gross profit margin} <= 0.3
=> Boolean
```

### Order Management: Shipping Status
```
// Check if order has been shipped
{logistics} = "confirm delivery"
=> Boolean

// Check if order needs shipping
{logistics} != "shipment confirmed"
=> Boolean
```

### Combined Logical Conditions
```
// Check if value is in range
{test score} > 80 && {test score} <= 100
=> Boolean

// Check if any condition is met
{grade} > 80 || {title} = "A"
=> Boolean
```

---

## Tips

1. **Type Coercion**: AITable automatically converts between text and numbers in many operations
2. **Recommend Functions**: For date comparisons, use IS_AFTER(), IS_BEFORE(), IS_SAME() instead of comparison operators
3. **Text Operators**: Use `&` for text concatenation instead of `+` for clarity
4. **Boolean Output**: Remember that TRUE/FALSE are displayed as checked/unchecked in cells
5. **Arithmetic with Booleans**: TRUE = 1, FALSE = 0 when used in calculations
