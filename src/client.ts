#!/usr/bin/env node
// AITable MCP Client - for testing the server

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3000/mcp";

async function main() {
  console.log(`Connecting to MCP server at ${SERVER_URL}...`);

  // Create client
  const client = new Client(
    {
      name: "aitable-mcp-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  // Create HTTP transport
  const transport = new StreamableHTTPClientTransport(new URL(SERVER_URL));

  try {
    // Connect to server
    await client.connect(transport);
    console.log("Connected to MCP server!");

    // List available tools
    const toolsResponse = await client.request({ method: "tools/list" } as any, {} as any);
    console.log("\nAvailable tools:");
    console.log(JSON.stringify(toolsResponse, null, 2));

    // Example: Call get_records tool (you'll need to provide a real datasheet ID)
    // Uncomment and modify this once you have a datasheet ID:
    /*
    const result = await client.request(
      {
        method: "tools/call",
        params: {
          name: "get_records",
          arguments: {
            datasheetId: "dstXXXXXXXXXXXXXX",
            pageSize: 10,
          },
        },
      },
      {}
    );
    console.log("\nTool call result:");
    console.log(JSON.stringify(result, null, 2));
    */

    // Close connection
    await transport.close();
    console.log("\nDisconnected from server");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
