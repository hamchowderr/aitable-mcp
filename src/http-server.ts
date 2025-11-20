#!/usr/bin/env node
// AITable MCP Server - HTTP transport (for remote use / Vercel deployment)

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { registerAITableTools } from "./aitable-tools.js";
import { registerFormulaResource } from "./formula-resource.js";

const API_TOKEN = process.env.AITABLE_API_TOKEN;
const SPACE_ID = process.env.SPACE_ID;
const PORT = process.env.PORT || 3000;

if (!API_TOKEN) {
  console.error("Error: AITABLE_API_TOKEN environment variable is not set");
  process.exit(1);
}

if (!SPACE_ID) {
  console.error("Error: SPACE_ID environment variable is not set");
  process.exit(1);
}

// Create Express app
const app = express();
app.use(express.json());

// Helper to create a new server instance (stateless mode)
function getServer(): McpServer {
  const server = new McpServer({
    name: "aitable-mcp",
    version: "1.0.0",
  });

  // Register AITable tools
  registerAITableTools(server, API_TOKEN!, SPACE_ID!);
  // Register formula reference resource
  registerFormulaResource(server);


  return server;
}

// Handle MCP requests (stateless mode - new server per request)
app.post("/mcp", async (req: Request, res: Response) => {
  const server = getServer();

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => {
      transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", server: "aitable-mcp" });
});

// Start server
app.listen(PORT, () => {
  console.log(`AITable MCP Server running on http://localhost:${PORT}/mcp`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Handle server shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  process.exit(0);
});
