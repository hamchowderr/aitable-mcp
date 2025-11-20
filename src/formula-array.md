# AITable Array and Record Functions

Array functions are formula functions that can operate on data of the array type. Fields such as Multi-select, One-way Link, Two-way Link, Member, Attachment, and Magic lookup can all output array-type data.

## Function Index

### Array Functions
- [COUNT](#count) - Count numeric values
- [COUNTA](#counta) - Count non-null values
- [COUNTALL](#countall) - Count all values including nulls
- [COUNTIF](#countif) - Count keyword occurrences
- [ARRAYCOMPACT](#arraycompact) - Remove empty strings and nulls
- [ARRAYFLATTEN](#arrayflatten) - Concatenate arrays
- [ARRAYJOIN](#arrayjoin) - Join array elements with separator
- [ARRAYUNIQUE](#arrayunique) - Return unique values

### Record Function
- [RECORD_ID](#record_id) - Get current record ID

---

## COUNT()
Counts the number of numeric types in the parameter.

**Syntax:** `COUNT(number1, [number2, ...])`

**Parameters:**
- number: parameter of any type. Supports multiple arguments and counts how many of them are value type (Number, Currency, Percent, and Rating are values).

**Examples:**
```
// Count the number of values included in the input parameter
COUNT(1, 3, 5, "", "7")
=> 3
```

---

## COUNTA()
Counts the number of non-null values in a parameter.

**Syntax:** `COUNTA(textOrNumber1, [textOrNumber2, …])`

**Parameters:**
- textOrNumber: Any type of Parameter. Supports multiple parameters and calculates how many parameters there are in total for non-null values.

**Examples:**
```
// Count how many non-null values are included in the input parameter
COUNTA(1, 3, 5, "", "seven")
=> 4
```

---

## COUNTALL()
Counts the number of all values in the parameter, including null values.

**Syntax:** `COUNTALL(textOrNumber1, [textOrNumber2, …])`

**Parameters:**
- textOrNumber: Any type of parameter. Calculates how many values are contained within the input parameters, including null values.

**Examples:**
```
// Count how many values the input parameter contains, including null values
COUNTALL(1, 3, 5, "", "seven")
=> 5
```

---

## COUNTIF()
Count the keyword occurrences in values.

**Syntax:** `COUNTIF(values, keyword, [operator])`

**Parameters:**
- values: where to look for the data. Support for data of array type or text type.
- keyword: A keyword to look up and count.
- operator: Optional comparator. Support ">", "<", "=", "!=". If not filled, defaults to "=" or "contains".

**Examples:**
```
// Count the number of occurrences of the character "A" in a string of text arrays [A, B, C, D, A]. {rating} is a field of the "magic lookup" type
COUNTIF({rating}, "A")
=> 2

// Count the number of occurrences of numbers greater than 3 in an array of numbers [1, 2, 3, 4, 5]. {score} is a field of type "magic lookup"
COUNTIF({score}, 3, ">")
=> 2

// Count the number of times "grape" appears in a string of text "eat grapes, not spit grape skin". {rhymes} is a field of type "text"
COUNTIF({rhymes}, "grape")
=> 2
```

---

## ARRAYCOMPACT()
Removes empty strings and null values from the array.

**Syntax:** `ARRAYCOMPACT([item1, item2, item3])`

**Parameters:**
- item: array type values, such as values within fields such as Multiple select, Attachment, Magical link, and magical lookup.

**Note:** This function retains the "false" value and the blank string.

**Examples:**
```
// Clear the empty string and empty value in the parameter, the output will still be the array value
ARRAYCOMPACT([1, 2, "", 3, false, " ", null])
=> [1, 2, 3, false, " "]
```

---

## ARRAYFLATTEN()
Concatenates multiple arrays into one array.

**Syntax:** `ARRAYFLATTEN([item1, item2, item3])`

**Parameters:**
- item: values of array types, for example, values within fields such as Multi-select, Attachment, One-way Link, Two-way Link, and Magic lookup.

**Examples:**
```
// Combine two arrays into one array
ARRAYFLATTEN([1, 2, 3], [false])
=> [1, 2, 3, false]
```

---

## ARRAYJOIN()
Concatenates elements in an array with a specific delimiter.

**Syntax:** `ARRAYJOIN([item1, item2, item3], separator)`

**Parameters:**
- item: values of array types
- separator: the separator used for the connection

**Examples:**
```
// Concatenate the elements in the array with ";"
ARRAYJOIN([1, 2, 3], ";")
=> "1; 2; 3"
```

---

## ARRAYUNIQUE()
Filters the array for duplicate elements and returns an array of unique values.

**Syntax:** `ARRAYUNIQUE([item1, item2, item3])`

**Parameters:**
- item: values of array types

**Examples:**
```
// Returns the unique item in the array
ARRAYUNIQUE([1, 2, 3, 3, 2, 1])
=> [1, 2, 3]
```

---

## RECORD_ID()
Returns the ID of the current record.

**Syntax:** `RECORD_ID()`

**Parameters:** This function requires no parameters.

**Examples:**
```
// Return the current record ID
"Record ID:" & RECORD_ID()
=> "Record ID: recXXXXXX"
```

---

## Field Types That Support Arrays

The following field types can output array-type data that can be used with array functions:

- **Multi-select**: Multiple selections from a list
- **One-way Link**: Links to records in another table
- **Two-way Link**: Bidirectional links between tables
- **Member**: User/member selections
- **Attachment**: Multiple file attachments
- **Magic lookup**: Lookup fields that return multiple values

## Tips for Using Array Functions

1. **Array Fields**: Use array functions with Multi-select, Link, Attachment, and Magic lookup fields
2. **COUNT vs COUNTA**: COUNT counts only numeric values, COUNTA counts all non-null values
3. **COUNTALL**: Includes null values in the count, unlike COUNT and COUNTA
4. **ARRAYCOMPACT**: Useful for cleaning up arrays before processing
5. **ARRAYJOIN**: Converts arrays to text for display or concatenation
6. **ARRAYUNIQUE**: Removes duplicates from linked records or multi-select fields
7. **RECORD_ID**: Useful for creating unique identifiers or referencing specific records
