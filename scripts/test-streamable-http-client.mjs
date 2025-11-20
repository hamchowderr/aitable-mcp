import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const origin = process.argv[2] || "http://localhost:3000";

async function main() {
  console.log(`Testing MCP server at: ${origin}/mcp`);
  console.log("Transport: Streamable HTTP\n");

  const transport = new StreamableHTTPClientTransport(new URL(`${origin}/mcp`));

  const client = new Client(
    {
      name: "aitable-test-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    }
  );

  try {
    console.log("Connecting to server...");
    await client.connect(transport);
    console.log("✓ Connected successfully!\n");

    console.log("Server capabilities:");
    console.log(JSON.stringify(client.getServerCapabilities(), null, 2));
    console.log();

    console.log("Listing available tools...");
    const tools = await client.listTools();
    console.log(`✓ Found ${tools.tools.length} tools:\n`);
    tools.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   ${tool.description}`);
    });
    console.log();

    console.log("Listing available resources...");
    const resources = await client.listResources();
    console.log(`✓ Found ${resources.resources.length} resources:\n`);
    resources.resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.name}`);
      console.log(`   ${resource.description || '(no description)'}`);
    });

    console.log("\n✓ Test completed successfully!");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
