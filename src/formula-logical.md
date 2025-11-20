# AITable Logical Functions

Logical functions are formula functions that perform logical operations on data. These functions enable conditional logic, decision-making, and boolean operations in formulas.

## Function Index

- [IF](#if) - Conditional branching
- [SWITCH](#switch) - Multi-branch selection
- [TRUE](#true) - Returns logical true
- [FALSE](#false) - Returns logical false
- [AND](#and) - Returns true if all conditions are true
- [OR](#or) - Returns true if any condition is true
- [XOR](#xor) - Returns true if odd number of conditions are true
- [BLANK](#blank) - Represents null value
- [ERROR](#error) - Display error messages
- [IS_ERROR](#is_error) - Check if expression has error
- [NOT](#not) - Reverses logical condition

---

## IF()
Determines whether a condition is met. If yes, the first value is returned. If not, the second value is returned.

**Syntax:** `IF(logical, value1, value2)`

**Parameters:**
- logical: a judgment condition whose expression outputs both true and false values
- value1: The value returned when the condition is true
- value2: the value returned when the condition is false

**Note:** IF() supports nesting and can be used to check if the cell is empty.

**Examples:**
```
// Compare values. Example: {grade} field is type number and cell value is 80
IF({grade} > 60, "pass", "fail")
=> "Pass"

// Compare the text. Example: {task progress} field is radio type and cell value is "completed"
IF({task progress} = "done", "done", "in progress")
=> "done"

// Compare dates. Example: {deadline} field is date type and cell value is later than today
IF(IS_AFTER({deadline}, TODAY()), "not expired", "expired")
=> "Not expired"

// Determine null values. Example: {article content} field is text type and cell value is null
IF({text} = BLANK(), "blank", "written")
=> "Null"

// Nested multiple levels of criteria. Example: {grade} field is type number and cell value is 70
IF({grades} > 60, IF({results} < 80, "medium", "excellent"), "fail")
=> "medium"

// If multiple criteria hold simultaneously, print true. Example: {grade} field is type number and cell value is 90
IF({grade} > 80 && {grade} <= 100, "Excellent", "other")
=> "Excellent"

// Output true if any of the criteria is true. Example: {grade} is 70, {talent} is "A"
IF({grades} > 80 || {title} = "A", "excellent", "other")
=> "Excellent"
```

---

## SWITCH()
This function is a multi-branch selection function, consisting of an expression + multiple (branches + return values). If the expression equals a branch value, the function outputs the corresponding return value for that branch.

**Syntax:** `SWITCH(expression, [pattern, result…], [default])`

**Parameters:**
- expression: an expression whose result is matched to each branch
- pattern: branches. Each branch represents the possible result of the expression
- result: the return value. If the result of the expression matches a branch, the corresponding return value is printed
- default: Optional, the default value. If the operation result does not match any branch, outputs the default value. If default value is not filled, this is null.

**Note:** [pattern, result...] indicates that multiple combinations of branches and return values can be filled.

**Examples:**
```
// Matches the text value. "C" is expression. "A" and "excellent" are pattern and result
SWITCH("C", "A", "excellent", "B", "medium", "C", "general", "D", "poor", "no results")
=> "Normal"

// Matches the value in the text type field {score}. When the value in the cell is "C"
SWITCH({scale}, "A", "excellent", "B", "medium", "C", "general", "D", "poor", "no results")
=> "Normal"

// Used with the IF() function. When {country} is "China" and {region} is "Guangdong"
SWITCH({country}, "China", IF({in} = "guangdong province", "cantonese", "other"), "Russia", "Russian", "French", "French", "other")
=> "Cantonese"
```

---

## TRUE()
Returns the logical value true.

**Syntax:** `TRUE()`

**Parameters:** This function requires no parameters.

**Note:** Can determine whether the column of the selected type is "selected". Used with FALSE(), can print both true and false Boolean values.

**Examples:**
```
// Determine the status of the fields of the selected type. {done} field is checked and cell value is "unchecked"
IF({completed} = FALSE(), "not completed", "completed")
=> "Not completed"

// TRUE() and FALSE() are used together as output boolean values. {grade} field is numeric and cell value is 50
IF({score} > 60, TRUE(), FALSE())
=> false
```

---

## FALSE()
Returns the logical value false.

**Syntax:** `FALSE()`

**Parameters:** This function requires no parameters.

**Note:** Can determine whether the column of the selected type is "not selected". Used with TRUE() to print both true and false Boolean values.

**Examples:**
```
// Determine the status of the fields of the selected type. {done} field is checked and cell value is "checked"
IF({done} = TRUE(), "done", "not done")
=> "Done"

// TRUE() and FALSE() are used together as output Boolean values. {grade} is numeric and cell value is 70
IF({score} > 60, TRUE(), FALSE())
=> true
```

---

## AND()
Returns true if all arguments are true, false otherwise.

**Syntax:** `AND(logical1, [logical2, …])`

**Parameters:**
- logical: one or more logical conditions

**Examples:**
```
// Outputs true if more than one logical condition is true
AND(3 > 2, 4 > 3)
=> true

// Output false if one of the logical conditions is not true
AND(3 > 2, 4 < 3)
=> false

// Determine whether all fields of the numeric type meet the logical conditions. {mathematics score} and {Chinese score} are 70 and 80
AND({math score} > 60, {Chinese score} > 60)
=> true

// Used as a criterion for the IF() function. {mathematics score} and {Chinese score} are 70 and 80
IF(AND({math score} > 60, {Chinese score} > 60), "pass", "fail")
=> "pass"
```

---

## OR()
Returns true if either argument is true, false otherwise.

**Syntax:** `OR(logical1, [logical2, …])`

**Parameters:**
- logical: one or more logical conditions

**Examples:**
```
// Outputs true if more than one logical condition is true
OR(3 > 2, 4 > 3)
=> true

// Output true if one of the logical conditions is not true
OR(3 > 2, 4 < 3)
=> true

// Output false if none of the logical conditions are true
OR(3 < 2, 4 < 3)
=> false

// Determine whether a numeric field satisfies any of the logical conditions. {math score} is 50, {Chinese score} is 80
OR({math score} > 60, {Chinese score} > 60)
=> true

// Used as a criterion for the IF() function. {math score} is 50, {Chinese score} is 80
IF(OR({math score} > 60, {Chinese score} > 60), "pass", "fail")
=> "pass"
```

---

## XOR()
Returns true if an odd number of arguments are true, false otherwise.

**Syntax:** `XOR(logical1, [logical2, …])`

**Parameters:**
- logical: one or more logical conditions

**Examples:**
```
// Outputs true if an odd number of logical conditions are true
XOR(3 > 2, 4 < 3)
=> true

// Output false if an even number of logical conditions are true
XOR(3 > 2, 4 > 3)
=> false

// Check whether a field satisfies an odd number of logical conditions. {math score} is 50, {Chinese score} is 80
XOR({math score} > 60, {Chinese score} > 60)
=> true

// Used as a criterion for the IF() function. {math score} is 50, {Chinese score} is 80
IF(XOR({math score} > 60, {Chinese score} > 60), "pass", "fail")
=> "pass"
```

---

## BLANK()
Indicates a null value.

**Syntax:** `BLANK()`

**Parameters:** This function requires no parameters.

**Note:** Can be used to determine whether a cell is null, or replace the contents of a cell with a null value. Null value is not zero value (0).

**Examples:**
```
// Determine if the cell is null. {start time} field is date type and cell value is null
IF({start time} = BLANK(), "start time not determined", "start time determined")
=> "Time not yet determined"

// Replace the original contents of the cell with null values. {price} field is numeric and cell value is 0
IF({price} = 0, BLANK(), {price})
=> Null
```

---

## ERROR()
Displays error messages and messages within cells.

**Syntax:** `ERROR([message])`

**Parameters:**
- message: Optional, Error message to be printed. Default value is "#Error!"

**Examples:**
```
// Directly output the error message without filling in the error message. {age} is numeric and cell value is -1
IF({age} < 0, ERROR(), "normal")
=> #Error!

// Enter the error information and display the error message. {age} is numeric and cell value is -1
IF({age} < 0, ERROR("statistical error"), "normal")
=> #Error: statistical error
```

---

## IS_ERROR()
Checks if an expression is running incorrectly and returns true if it is.

**Syntax:** `IS_ERROR(expression)`

**Parameters:**
- expression: the expression to be checked. Expressions can be arithmetic operations, logical judgments, etc.

**Examples:**
```
// There is an error in the arithmetic
IS_ERROR(2 / 0)
=> true

// There is an error mixing text with numbers
IS_ERROR("ha ha" * 2)
=> true
```

---

## NOT()
Reverses the logic condition.

**Syntax:** `NOT(logical)`

**Parameters:**
- logical: the logical condition to reverse

**Note:** This function inverts the logical condition. For example: NOT(2 > 3) is actually judged 2 <= 3 after inversion.

**Examples:**
```
// Reverse the logical condition. After inversion, the actual judgment is 2 <= 3
NOT(2 > 3)
=> true

// Invert the logical condition by introducing a numeric field {age}. After reversal, actual judgment {age} ≤ 18. When value is 12
NOT({age} > 18)
=> true
```

---

## Practical Guide: Using Formulas for Basic Logical Judgment

When designing tables, we need to use logic in many cases. Is "income" greater than "expenditure"? Is "age" less than "18"? Does "progress" equal "100%"?

### Output Result

After the logical operation of the formula, when the output result is "true" or "false", it is represented as "checked ✅" (true) and "not checked" (false) in the cell.

When participating in arithmetic operations:
- "✅ checked" (true) represents 1
- "Unchecked" (false) represents 0

### Example: Order Management - Greater Than and Greater Than or Equal To

In an Order Management table, we can check whether the "profit per item" is greater than 0 by comparing whether the "unit price" is greater than the "cost price". If it is greater, it will return "checked" (true); if less, it will return "unchecked" (false).

**Formula:** `{unit price} > {cost price}`

We can also directly judge whether "profit per product" is greater than or equal to 0:

**Formula:** `{profit per product} >= 0`

### Example: Order Management - Less Than or Equal To

In the Order Management table, if "gross margin" is less than 30%, it is "promotion":

**Formula:** `{gross margin} < 0.3`

If it is equal to 30%, it is also promotional:

**Formula:** `{gross profit margin} <= 0.3`

### Example: Order Management - Equal or Not Equal

In the Order Management table, if the value of Logistics is "Confirm Shipment", the order has been shipped successfully:

**Formula:** `{logistics} = "confirm delivery"`

If "Logistics" is not equivalent to "Confirm shipment", it indicates that the order needs to be shipped:

**Formula:** `{logistics} != "shipment confirmed"`

### Example: Order Management - IF() Function Usage

`IF(logical, value1, value2)` function can define the output value based on the logical judgment:
- If true, the output value is value1
- For false, the output value is value2

In the Order Management table, IF "logistics" is "shipment confirmed", it indicates that the order has been successfully shipped, otherwise, it prompts for shipment:

**Formula:** `IF({logistics} = "shipment confirmed", "✅ shipped", "⏰ to be shipped")`

---

## Tips for Using Logical Functions

1. **Boolean Display**: TRUE/FALSE are displayed as checked/unchecked in cells
2. **Arithmetic Values**: TRUE = 1, FALSE = 0 when used in calculations
3. **Nesting**: IF() can be nested for complex decision trees
4. **SWITCH vs IF**: Use SWITCH for multiple specific value matches, IF for range conditions
5. **Error Handling**: Use ERROR() and IS_ERROR() for robust formula design
6. **Null Checks**: Use BLANK() to check for empty cells
7. **Combining Conditions**: Use AND, OR, XOR, or operators (&&, ||) for multiple conditions
