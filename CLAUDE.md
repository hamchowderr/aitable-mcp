# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **⚠️ Important:** AITable has been discontinued. If you're looking to migrate to Bika (the successor platform), check out the [Bika MCP Server](https://github.com/hamchowderr/bika-mcp).
>
> **AITable LTD Holders:** Claim your free Bika account by filling out [this migration form](https://bika.ai/space/spcND68gdMMZBmGK67gvqNVx/node/fom8XyUsPAmUVwlgpq8bFxPw) (available only for AITable LTD users).

## Project Overview

This is an AITable MCP (Model Context Protocol) server deployed on Vercel. It provides programmatic access to AITable datasheets, records, fields, views, and more through 16 comprehensive tools and 8 formula reference resources.

The project supports **both local development and Vercel deployment**:
- **Vercel deployment**: Uses `mcp-handler` for HTTP/SSE transports (`api/server.ts`)
- **Local development**: Uses SDK directly for stdio/HTTP servers (`src/stdio-server.ts`, `src/http-server.ts`)

## Development Commands

**Local stdio server (for Claude Desktop local integration):**
```sh
pnpm dev:stdio
```

**Local HTTP server (for testing):**
```sh
pnpm dev:http
```

**Vercel local development:**
```sh
pnpm dev:vercel
# or
vercel dev
```

**Test the deployed Vercel server (HTTP transport):**
```sh
node scripts/test-streamable-http-client.mjs https://YOUR_DEPLOYMENT_URL.vercel.app
```

**Test the deployed Vercel server (SSE transport):**
```sh
node scripts/test-client.mjs https://YOUR_DEPLOYMENT_URL.vercel.app
```

**Build:**
```sh
pnpm build
```

## Architecture

### Dual Transport System

This project supports both **local** and **remote** MCP connections:

#### Vercel Deployment (Remote)
```
Claude Desktop → HTTPS → Vercel → api/server.ts → mcp-handler → AITable API
```

**Configuration (claude_desktop_config.json):**
```json
{
  "mcpServers": {
    "aitable-remote": {
      "url": "https://YOUR_DEPLOYMENT_URL.vercel.app/mcp"
    }
  }
}
```

#### Local stdio (Local)
```
Claude Desktop → stdio → src/stdio-server.ts → @modelcontextprotocol/sdk → AITable API
```

**Configuration (claude_desktop_config.json):**
```json
{
  "mcpServers": {
    "aitable-local": {
      "command": "node",
      "args": ["C:/path/to/aitable-mcp/dist/stdio-server.js"],
      "env": {
        "AITABLE_API_TOKEN": "your-token",
        "SPACE_ID": "your-space-id"
      }
    }
  }
}
```

### File Structure

**Vercel Deployment Files:**
- `api/server.ts` - Main serverless function using `mcp-handler`
- `vercel.json` - Vercel configuration with rewrites
- `public/index.html` - Landing page

**Local Development Files:**
- `src/stdio-server.ts` - stdio transport for local Claude Desktop
- `src/http-server.ts` - Local HTTP server for testing
- `src/aitable-tools.ts` - Tool implementations (used by local servers only)
- `src/formula-resource.ts` - Resource provider (used by local servers only)
- `src/types.ts` - TypeScript types

**Test Scripts:**
- `scripts/test-client.mjs` - SSE transport tester
- `scripts/test-streamable-http-client.mjs` - HTTP transport tester

### Request Flow (Vercel)

```
Client Request
    ↓
Vercel Edge Network
    ↓
vercel.json rewrites all /(.+) → /api/server
    ↓
api/server.ts exports handler as GET/POST/DELETE
    ↓
mcp-handler routes by HTTP method + path
    ↓
- /mcp → Streamable HTTP transport
- /sse → SSE transport
    ↓
Zod validation → Handler execution → AITable API → Response
```

## Core Components (Vercel Deployment)

**`api/server.ts`** - The main MCP server handler using `mcp-handler`. All routes are rewritten to this file via `vercel.json`.

**Pattern:**
```typescript
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler((server) => {
  // Define tools
  server.tool("tool_name", "Description", { schema }, async (params) => {
    // Implementation
    return { content: [{ type: "text", text: "..." }] };
  });

  // Define resources
  server.registerResource(id, uri, { description, mimeType }, async () => {
    return { contents: [{ uri, mimeType, text: "..." }] };
  });
});

// CRITICAL: Export all three HTTP methods
export { handler as GET, handler as POST, handler as DELETE };
```

**Why all three HTTP methods?**
- `GET` - Used for SSE transport connections and listing operations
- `POST` - Primary method for tool invocations and MCP protocol requests
- `DELETE` - Used for cleanup/disconnection operations

**`mcp-handler`** - Wraps `@modelcontextprotocol/sdk` to create a Vercel-compatible serverless MCP server. Internally handles routing, transport negotiation, and protocol operations.

**`vercel.json`** - Rewrites ALL routes to `/api/server`, enabling the MCP server to handle both `/mcp` (HTTP transport) and `/sse` (SSE transport) endpoints from a single serverless function.

## AITable Tools

This server provides 16 tools for interacting with AITable:

### Records
1. **`get_records`** - Query records with filtering, sorting, pagination, and field selection
2. **`create_records`** - Create new records (max 10 per request)
3. **`update_records`** - Update existing records (max 10 per request)
4. **`delete_records`** - Delete records (max 10 per request)

### Fields
5. **`get_fields`** - Get field metadata (id, name, type, properties)
6. **`create_field`** - Create a new field (currently supports SingleText)
7. **`delete_field`** - Delete a field

### Views & Nodes
8. **`get_views`** - Get all views from a datasheet
9. **`get_node_list`** - List nodes in the space working directory
10. **`get_node_detail`** - Get detailed information about a node
11. **`search_nodes`** - Search for nodes by type, permissions, and query

### Datasheets
12. **`create_datasheet`** - Create a new datasheet with optional fields

### Attachments
13. **`upload_attachment`** - Upload files (2-step process: upload → attach to record)

### Embed Links
14. **`create_embed_link`** - Create embeddable links for nodes
15. **`get_embed_links`** - List all embed links for a node
16. **`delete_embed_link`** - Delete/disable an embed link

## Formula Resources

8 formula reference resources available as MCP resources:

1. `formula_overview` - Quick reference guide
2. `formula_operators` - Operators (+, -, *, /, &, &&, ||, etc.)
3. `formula_numeric` - Numeric functions (SUM, AVERAGE, ROUND, etc.)
4. `formula_string` - String functions (CONCATENATE, FIND, REPLACE, etc.)
5. `formula_logical` - Logical functions (IF, SWITCH, AND, OR, etc.)
6. `formula_date` - Date/time functions (TODAY, DATEADD, etc.)
7. `formula_array` - Array functions (COUNT, COUNTIF, etc.)
8. `field_colors` - Field color reference (50 color options)

These are loaded from markdown files in `src/` and included in the Vercel deployment via `vercel.json` (`includeFiles: "src/**/*.md"`).

## Environment Variables

Required for both local and Vercel deployment:

- `AITABLE_API_TOKEN` - Your AITable API token
- `SPACE_ID` - Your AITable space ID

**Vercel:** Set in Vercel dashboard under Settings → Environment Variables
**Local:** Set in `.env` file or shell environment

## Transport Types

The Vercel server supports two transport mechanisms:

**1. Streamable HTTP (`/mcp` endpoint)**
```javascript
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
const transport = new StreamableHTTPClientTransport(new URL(`${origin}/mcp`));
```
- Request-response pattern with streaming support
- Better for serverless/stateless environments like Vercel
- Primary endpoint for MCP client integration

**2. SSE - Server-Sent Events (`/sse` endpoint)**
```javascript
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
const transport = new SSEClientTransport(new URL(`${origin}/sse`));
```
- Real-time, long-lived connections
- Server pushes events as a stream
- Uses HTTP GET for establishing connection

## Response Format

Tool handlers **must** return an object with a `content` array:

```typescript
return {
  content: [
    { type: "text", text: "Response message" },
  ],
};
```

**With error handling:**
```typescript
try {
  // ... implementation
  return {
    content: [{ type: "text", text: "Success message" }],
  };
} catch (error) {
  return {
    content: [{
      type: "text",
      text: `Error: ${error instanceof Error ? error.message : String(error)}`
    }],
    isError: true,
  };
}
```

## Vercel Configuration

**vercel.json structure:**
```json
{
  "rewrites": [{ "source": "/(.+)", "destination": "/api/server" }],
  "functions": {
    "api/server.ts": {
      "maxDuration": 60,
      "includeFiles": "src/**/*.md"
    }
  }
}
```

**Critical settings:**
- **Rewrites**: Routes ALL paths to the single serverless function
- **maxDuration**: 60 seconds (can increase to 800 for Pro/Enterprise)
- **includeFiles**: Include formula markdown files in deployment

**Fluid Compute**: Must be enabled in Vercel dashboard for efficient execution

## Dependencies

**Production (Vercel deployment):**
- `mcp-handler` (^1.0.1) - Serverless MCP handler
- `zod` (^3.24.2) - Schema validation
- `form-data` (^4.0.4) - File upload support

**Development (Local servers):**
- `@modelcontextprotocol/sdk` (^1.22.0) - MCP SDK for stdio/HTTP servers
- `express` (^4.21.2) - HTTP server framework
- `tsx` (^4.19.2) - TypeScript execution
- `typescript` (^5.7.3) - TypeScript compiler

**Package manager:** pnpm

## TypeScript Configuration

**Module system:** NodeNext (ES modules with Node.js resolution)
- `"type": "module"` in package.json
- Use `.mjs` for scripts or ES module syntax in `.ts` files

**Compiler options:**
- Target: ES2022
- Module: NodeNext
- Includes: `src/**/*` and `api/**/*`
- Excludes: test files and local servers from compilation

## Development Workflow

1. **Make changes** to `api/server.ts` for Vercel deployment OR `src/*` for local servers
2. **Test locally** with `pnpm dev:vercel` or `vercel dev`
3. **Test with scripts**: `node scripts/test-streamable-http-client.mjs http://localhost:3000`
4. **Deploy to Vercel**: `vercel --prod`
5. **Test deployed**: `node scripts/test-streamable-http-client.mjs https://YOUR_DEPLOYMENT_URL.vercel.app`

## Common Pitfalls

1. ❌ Forgetting to export all three HTTP methods (GET, POST, DELETE) in `api/server.ts`
2. ❌ Returning raw strings instead of `{ content: [...] }` format
3. ❌ Not wrapping content in an array
4. ❌ Missing environment variables (AITABLE_API_TOKEN, SPACE_ID)
5. ❌ Exceeding maxDuration without upgrading Vercel plan
6. ❌ Not enabling Fluid Compute in Vercel settings
7. ❌ Forgetting to include formula `.md` files in Vercel deployment

## Local vs Vercel Differences

| Feature | Vercel (`api/server.ts`) | Local (`src/*`) |
|---------|--------------------------|-----------------|
| Package | `mcp-handler` | `@modelcontextprotocol/sdk` |
| Transport | HTTP/SSE (automatic) | stdio/HTTP (manual setup) |
| Tools | Inline in `createMcpHandler()` | Separate functions in `src/aitable-tools.ts` |
| Resources | Inline in `createMcpHandler()` | Separate function in `src/formula-resource.ts` |
| Exports | `{ handler as GET, POST, DELETE }` | `server.connect(transport)` |
