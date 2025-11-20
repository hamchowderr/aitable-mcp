#!/usr/bin/env node
// AITable MCP Server - stdio transport (for local use with Claude Desktop)

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAITableTools } from "./aitable-tools.js";
import { registerFormulaResource } from "./formula-resource.js";

const API_TOKEN = process.env.AITABLE_API_TOKEN;
const SPACE_ID = process.env.SPACE_ID;

if (!API_TOKEN) {
  console.error("Error: AITABLE_API_TOKEN environment variable is not set");
  process.exit(1);
}

if (!SPACE_ID) {
  console.error("Error: SPACE_ID environment variable is not set");
  process.exit(1);
}

async function main() {
  // Create MCP server
  const server = new McpServer({
    name: "aitable-mcp",
    version: "1.0.0",
  });

  // Register AITable tools
  registerAITableTools(server, API_TOKEN!, SPACE_ID!);

  // Register formula reference resource
  registerFormulaResource(server);

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  console.error("AITable MCP Server running on stdio transport");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
