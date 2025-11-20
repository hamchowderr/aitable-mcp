// Formula Reference Resources
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Register all reference resources with the MCP server
 * Each resource is a separate markdown file for efficient context usage
 */
export function registerFormulaResource(server: McpServer) {
  // Resource definitions: [id, uri, filename, description]
  const resources = [
    [
      "formula_overview",
      "aitable://formulas/overview",
      "formula-overview.md",
      "Quick reference guide to AITable formulas including syntax rules, parameter notation, function categories, and tips"
    ],
    [
      "formula_operators",
      "aitable://formulas/operators",
      "formula-operators.md",
      "AITable formula operators including numeric (+, -, *, /), string (&), and logical (>, <, =, !=, &&, ||) operators with examples"
    ],
    [
      "formula_numeric",
      "aitable://formulas/numeric",
      "formula-numeric.md",
      "AITable numeric functions including SUM, AVERAGE, MAX, MIN, ROUND, ABS, SQRT, POWER, LOG, and more with detailed examples"
    ],
    [
      "formula_string",
      "aitable://formulas/string",
      "formula-string.md",
      "AITable string functions including CONCATENATE, FIND, SEARCH, REPLACE, LEN, UPPER, LOWER, TRIM, and more with examples"
    ],
    [
      "formula_logical",
      "aitable://formulas/logical",
      "formula-logical.md",
      "AITable logical functions including IF, SWITCH, AND, OR, XOR, NOT, BLANK, ERROR, TRUE, FALSE with practical examples"
    ],
    [
      "formula_date",
      "aitable://formulas/date",
      "formula-date.md",
      "AITable date/time functions including TODAY, NOW, DATEADD, DATETIME_DIFF, IS_AFTER, DATETIME_FORMAT, and more with format/locale tables"
    ],
    [
      "formula_array",
      "aitable://formulas/array",
      "formula-array.md",
      "AITable array functions including COUNT, COUNTA, COUNTIF, ARRAYCOMPACT, ARRAYJOIN, ARRAYUNIQUE, RECORD_ID with examples"
    ],
    [
      "field_colors",
      "aitable://reference/field-colors",
      "field-colors.md",
      "AITable field color reference showing all 50 color options (10 families × 5 shades) for single-select and multi-select field options"
    ]
  ];

  // Register each resource
  resources.forEach(([id, uri, filename, description]) => {
    server.registerResource(
      id,
      uri,
      {
        description,
        mimeType: "text/markdown",
      },
      async () => {
        try {
          // Read the formula reference markdown file
          const filePath = join(process.cwd(), "src", filename);
          const content = readFileSync(filePath, "utf-8");

          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        } catch (error) {
          // Fallback if file cannot be read
          return {
            contents: [
              {
                uri,
                mimeType: "text/plain",
                text: `Error loading ${filename}: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }
    );
  });
}
