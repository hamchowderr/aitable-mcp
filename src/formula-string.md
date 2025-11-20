# AITable String Functions

String functions are formula functions that can operate on data of text type. These functions allow you to manipulate, search, format, and analyze text values.

## Function Index

- [CONCATENATE](#concatenate) - Join multiple text values
- [FIND](#find) - Find position of text (case-sensitive, returns 0 if not found)
- [SEARCH](#search) - Find position of text (returns null if not found)
- [MID](#mid) - Extract text from specific position
- [REPLACE](#replace) - Replace text at specific position
- [SUBSTITUTE](#substitute) - Replace all occurrences of text
- [LEN](#len) - Count character length
- [LEFT](#left) - Extract characters from beginning
- [RIGHT](#right) - Extract characters from end
- [LOWER](#lower) - Convert to lowercase
- [UPPER](#upper) - Convert to uppercase
- [REPT](#rept) - Repeat text specified times
- [T](#t) - Check if value is text
- [TRIM](#trim) - Remove leading/trailing spaces
- [ENCODE_URL_COMPONENT](#encode_url_component) - Encode text for URLs

---

## CONCATENATE()
Concatenates multiple text values into a single text value (equivalent to the operator "&").

**Syntax:** `CONCATENATE(text1, [text2, …])`

**Parameters:**
- text: the text value to concatenate. Enter at least one text value.

**Note:** To concatenate double quotes, use the backslash (\) as the escape character.

**Examples:**
```
// Text concatenation
CONCATENATE("Class 8", "Little Hu")
=> "Class 8 Little Hu"

// Concatenate {fields} of text types with text
CONCATENATE({class}, "Hu")
=> text (example: "Class 8 Xiao Hu")

// Concatenate {fields} with text types
CONCATENATE({class}, {name})
=> text (example: "Class 8 Lane")

CONCATENATE({class}, "- ", {name})
=> text (example: "Class 8 -- Xiao Hu")

// Concatenate the text with {field} of the date type
CONCATENATE("Project to be completed by: ", {deadline})
=> text (example: "Project to be completed by 2021/4/1")

// Concatenate text with {field} of numeric type
CONCATENATE("Sales this month: ", {sales})
=> text (example: "Sales this month: 100")

// Special case: concatenate double quotes
CONCATENATE(" \" ", "Xiao Hu", " \" ")
=> "Xiao Hu"
```

---

## FIND()
Finds the first place in the text where a particular item appears (case-sensitive).

**Syntax:** `FIND(stringToFind, whereToSearch, [startFromPosition])`

**Parameters:**
- stringToFind: the specific content to find
- whereToSearch: which text to look in
- startFromPosition: Optional, where in the text to start the search (number representing the first character)

**Returns:** Number indicating position (starts at 1), or 0 if not found.

**Note:** Similar to SEARCH(), but when no match is found, SEARCH() returns null and FIND() returns 0.

**Examples:**
```
// If a match is found, return the location where the content first appeared
FIND("API", "Intelligent multidimensional table with API support")
=> 3

FIND("Support", "Support API smart multidimensional tables")
=> 1

FIND("API", "intelligent multidimensional tables that support apis. Support API, unlimited DIY")
=> 3

// No match found, return 0
FIND("Vig table", "Intelligent multidimensional table with API support")
=> 0

// Specifies that the search starts somewhere in the text
FIND("API", "Intelligent multidimensional table with API support", 4)
=> 0

FIND("API", "intelligent multidimensional tables that support apis. Support API, unlimited DIY", 4)
=> 16

// Look up the contents from a column {field}
FIND("API", {text}, 4)
=> Number
```

---

## SEARCH()
Finds the first place in the text where a particular item appears.

**Syntax:** `SEARCH(stringToFind, whereToSearch, [startFromPosition])`

**Parameters:**
- stringToFind: the specific content to find
- whereToSearch: which text to look in
- startFromPosition: Optional, where in the text to start the search

**Returns:** Number indicating position, or null if not found.

**Note:** Similar to FIND(), but when no match is found, SEARCH() returns null and FIND() returns 0.

**Examples:**
```
// If a match is found, return the location where the content first appeared
SEARCH("API", "API-enabled smart multidimensional Table")
=> 3

SEARCH("Support", "Intelligent multidimensional tables with API support")
=> 1

// No match found, return null
SEARCH("Vig table", "Intelligent multidimensional Table with API support")
=> Null

// Specifies that the search starts somewhere in the text
SEARCH("API", "intelligent multidimensional table that supports API. Support API, unlimited DIY", 4)
=> 16

// Look up the contents from a column {field}
SEARCH("API", {article content}, 4)
=> Number
```

---

## MID()
Extract a fixed length piece of content from a specific location in the text.

**Syntax:** `MID(string, whereToStart, count)`

**Parameters:**
- string: a piece of text to extract specific content from
- whereToStart: where to start extracting content, represented as a number (3 means extract from the third character)
- count: the length of the extracted content, expressed as a number (2 means extract two characters)

**Examples:**
```
// Extract the contents to the specified location
MID("Intelligent multidimensional table with API support", 3, 3)
=> "API"

// The length of the extracted content exceeds the length of the text
MID("Intelligent multidimensional table with API support", 3, 99)
=> "API's Intelligent Multidimensional Table"

// No content was extracted at the specified location
MID("Intelligent multidimensional table with API support", 99, 3)
=> Null

// Extract the contents of a column {field} at the specified position
MID({article content}, 3, 3)
=> text
```

---

## REPLACE()
Replaces a paragraph of content at a specific location in the text with new content.

**Syntax:** `REPLACE(string, start_character, number_of_characters, replacement)`

**Parameters:**
- string: a piece of text that you want to replace with something specific
- start_character: where to start the replacement, represented as a number
- number_of_characters: the length of the replacement content
- replacement: the new content that replaces the original content

**Note:** To replace all specific items in the text with new items, see SUBSTITUTE().

**Examples:**
```
// Replaces the contents of the specified position
REPLACE("Wiggle table", 3, 1, "Planet")
=> "Planet Vige"

// The length of the replacement exceeds the length of the text itself
REPLACE("Wiggle Table", 3, 99, "Planet")
=> "Planet Vige"

// The specified position is longer than the text itself
REPLACE("Wiggle Table", 99, 1, "Planet")
=> "Planet of the dimension table"

// Replaces the contents of a column {field} at the specified position
REPLACE({article content}, 3, 1, "planet")
=> text
```

---

## SUBSTITUTE()
Replaces all text specific content with new content.

**Syntax:** `SUBSTITUTE(string, old_text, new_text, [index])`

**Parameters:**
- string: a piece of text that you want to replace with something specific
- old_text: the original content to be replaced
- new_text: new content that replaces the original content
- index: Optional, specifies the index number. After specified, only replaces content in a specific position. If not filled, replaces all matching content.

**Note:** To REPLACE something between specified start and end positions, see REPLACE().

**Examples:**
```
// Replace all matches in the text
SUBSTITUTE("Xiao Hu, Xiao Zhang, Xiao Wang", "xiao", "Lao")
=> "Lao Hu, Lao Zhang, Lao Wang"

// No replacement was found
SUBSTITUTE("Xiao Hu, Xiao Zhang, Xiao Wang", "Lao", "Da")
=> "Xiao Hu, Xiao Zhang, Xiao Wang"

// Replace all matches in a column {field}
SUBSTITUTE({article}, "table", "planet")
=> text
```

---

## LEN()
Counts the character length of a piece of text.

**Syntax:** `LEN(string)`

**Parameters:**
- string: the length of the text to be computed
- Punctuation marks, spaces, etc., also take up a character

**Examples:**
```
// Statistics the length of text characters
LEN("Guess how long I am?")
=> 8

// Null values do not occupy characters
LEN("")
=> 0

// Space takes one character (there is a space between quotes)
LEN(" ")
=> 1

// Count the length of characters in a cell for a column {field}
LEN({article content})
=> number
```

---

## LEFT()
Extracts a specified number of characters from the beginning of the text.

**Syntax:** `LEFT(string, howMany)`

**Parameters:**
- string: the text of the character to be extracted
- howMany: the number of characters extracted (e.g., "5" extracts five characters from left to right)

**Examples:**
```
// Extract the characters inside the text
LEFT("Support API, feel free to DIY", 11)
=> "Support API"

// Space takes one character
LEFT("Support API, feel free to DIY", 10)
=> "Support AP"

// Extract the characters in the cell of a column {field}
LEFT({article content}, 99)
=> text
```

---

## RIGHT()
Extracts a specified number of characters from the end of the text.

**Syntax:** `RIGHT(string, howMany)`

**Parameters:**
- string: the text of the character to be extracted
- howMany: the number of characters extracted (e.g., "5" represents five characters from right to left)

**Examples:**
```
// Extract the characters inside the text
RIGHT("Support API, feel free to DIY", 14)
=> "feel free to DIY"

// Space takes one character
RIGHT("Support API, feel free to DIY", 11)
=> "free to DIY"

// Extract the characters in the cell of a column {field}
RIGHT({text}, 99)
=> text
```

---

## LOWER()
Converts all uppercase letters to lowercase letters.

**Syntax:** `LOWER(string)`

**Parameters:**
- string: the text to be converted

**Examples:**
```
// Converts uppercase letters in text to lowercase letters
LOWER("HELLO!")
=> "hello!"

// Convert text in {field}
LOWER({article content})
=> text
```

---

## UPPER()
Converts all lowercase letters to uppercase letters.

**Syntax:** `UPPER(string)`

**Parameters:**
- string: the text to be converted

**Examples:**
```
// Converts lowercase letters in text to uppercase letters
UPPER("hello!")
=> "HELLO!"

// Convert text in {field}
UPPER({article content})
=> text
```

---

## REPT()
Copies the text contents as many times as specified.

**Syntax:** `REPT(string, number)`

**Parameters:**
- string: the text to be copied
- number: the specified number of times of replication (e.g., "2" to repeat twice)

**Examples:**
```
// Repeat the text twice
REPT("ha", 2)
=> "haha"

// Repeat the number twice, and the output is the text number
REPT(5, 2)
=> "55"

// Repeat the text in the cell of a column {field} twice
REPT({article content}, 2)
=> text
```

---

## T()
Determines if the content is a text value.

**Syntax:** `T(value)`

**Parameters:**
- value: whether the value is a text value

**Returns:** If input value is text type, returns the original text; if input value is non-text type, returns null value.

**Examples:**
```
// If the input value is text, the original text is returned
T("AITable")
=> "AITable"

// If the input value is a text number, return the original text
T("2")
=> "2"

// If the input value is a number, null is returned
T(2)
=> Null

// Determines whether text is in the cells of a column {field}
T({article content})
=> text
```

---

## TRIM()
Clears the space at the beginning and end of the text.

**Syntax:** `TRIM(string)`

**Parameters:**
- string: the text to be processed

**Examples:**
```
// The space on either side of the text will be cleared
TRIM("  Spaces will be cleared!  ")
=> "Spaces will be cleared!"

// The space in the middle of the text is not cleared
TRIM("  Middle space won't be cleared!  ")
=> "Middle space won't be cleared!"

// Clear the space before and after the cell text in a column {field}
TRIM({text})
=> text
```

---

## ENCODE_URL_COMPONENT()
Encodes the text into the format of a URL.

**Syntax:** `ENCODE_URL_COMPONENT(component_string)`

**Parameters:**
- component_string: the text to be encoded
- The following characters are not encoded: - . ~

**Examples:**
```
// Encode "apple" in URL format. The URL equivalent of searching for "Apple" on Baidu.
"https://www.baidu.com/s?wd=" & ENCODE_URL_COMPONENT("apple")
=> URL

// Encode the text content in the {search term} cell into URL format
"https://www.baidu.com/s?wd=" & ENCODE_URL_COMPONENT({search keyword})
=> URL
```

---

## Tips for Using String Functions

1. **Character Position**: String positions start at 1, not 0
2. **Spaces Count**: Spaces and punctuation count as characters
3. **Case Sensitivity**: FIND() is case-sensitive, SEARCH() behavior may vary
4. **Empty Strings**: Empty strings ("") have length 0
5. **Escape Characters**: Use backslash (\) to escape special characters like quotes
6. **Field References**: Can be used with {field} references for dynamic text manipulation
7. **Type Conversion**: Many functions work with numeric input by converting to text
