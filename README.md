# AITable MCP Server

![AITable](./images/aitable.jpeg)

Model Context Protocol (MCP) server for integrating with AITable platform.

> **⚠️ Important:** AITable has been discontinued. If you're looking to migrate to Bika (the successor platform), check out the [Bika MCP Server](https://github.com/hamchowderr/bika-mcp).
>
> **AITable LTD Holders:** Claim your free Bika account by filling out [this migration form](https://bika.ai/space/spcND68gdMMZBmGK67gvqNVx/node/fom8XyUsPAmUVwlgpq8bFxPw) (available only for AITable LTD users).

## Overview

This MCP server provides integration with AITable's API, enabling AI assistants to:
- Query and filter datasheet records
- Create, update, and delete records
- Upload and manage attachments
- Work with fields, views, and nodes
- Create embeddable links

## Features

- **Records Management**: Full CRUD operations on AITable records
- **Fields Management**: Create, query, and delete fields
- **Views & Nodes**: Access datasheet views and workspace nodes
- **Attachments**: Upload and manage files
- **Embed Links**: Create and manage embeddable links
- **Formula Resources**: Access AITable formula documentation

## Prerequisites

- Node.js >= 18.0.0
- npm or pnpm
- AITable account with API access token

## Installation

### Option 1: Install via npm (Recommended)

Once published, you can install directly via npx:

```bash
# No installation needed! Run directly with npx
npx aitable-mcp
```

### Option 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/hamchowderr/aitable-mcp.git
cd aitable-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Environment Variables

The server requires the following environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `AITABLE_API_TOKEN` | Yes | Your AITable API access token |
| `SPACE_ID` | Yes | Your AITable space ID |

### Setting Environment Variables

**Option 1: Environment variables**

```bash
# Windows
set AITABLE_API_TOKEN=your-api-token-here
set SPACE_ID=your-space-id

# macOS/Linux
export AITABLE_API_TOKEN="your-api-token-here"
export SPACE_ID="your-space-id"
```

**Option 2: Create a `.env` file**

Create a `.env` file in the project root:

```env
AITABLE_API_TOKEN=your-api-token-here
SPACE_ID=your-space-id
```

## Usage

### Option 1: Claude Desktop (Stdio Transport)

The recommended way to use this MCP server is with Claude Desktop using stdio transport.

#### Configuration File Locations

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### Using npx (Recommended)

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "aitable": {
      "command": "npx",
      "args": ["-y", "aitable-mcp"],
      "env": {
        "AITABLE_API_TOKEN": "your-token-here",
        "SPACE_ID": "your-space-id"
      }
    }
  }
}
```

#### Using Local Installation

For development or local installations:

```json
{
  "mcpServers": {
    "aitable": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\aitable-mcp\\dist\\stdio-server.js"],
      "env": {
        "AITABLE_API_TOKEN": "your-token-here",
        "SPACE_ID": "your-space-id"
      }
    }
  }
}
```

**Important**: Restart Claude Desktop after updating the configuration.

### Option 2: Testing with MCP Inspector

Test your server locally with the official MCP Inspector:

```bash
# Run the inspector
npm run inspector

# Or run directly
npx @modelcontextprotocol/inspector dist/stdio-server.js
```

This will:
1. Start the MCP server
2. Launch the inspector web interface at `http://localhost:6274`
3. Allow you to test tools, resources, and prompts interactively

### Option 3: Running Standalone (Stdio)

Run the server directly for stdio transport:

```bash
# Build and start
npm run build
npm start

# Development mode with watch
npm run dev
```

### Option 4: Custom Connector (HTTP Transport via Vercel)

Deploy as a custom connector for HTTP-based MCP access.

#### Deploy to Vercel

1. **Initial Deployment**:
   ```bash
   # Install Vercel CLI if needed
   npm install -g vercel

   # Deploy to Vercel
   npx vercel@latest
   ```

2. **Production Deployment**:
   ```bash
   npx vercel@latest --prod
   ```

3. **Set Environment Variables**:

   In your Vercel project settings (Settings → Environment Variables), add:
   - `AITABLE_API_TOKEN` - Your AITable API token (required for authenticating with AITable)
   - `SPACE_ID` - Your AITable space ID (required)

4. **Disable Deployment Protection (Required for MCP)**:

   In your Vercel project settings (Settings → Deployment Protection):
   - **Turn OFF "Vercel Authentication"**
   - This is required for Claude Desktop and other MCP clients to connect
   - Your data remains secure through the API token configured in step 3

5. **Configure as Custom Connector in Claude Desktop**:

   **IMPORTANT**: Custom connectors must be configured via the Claude Desktop UI, NOT via `claude_desktop_config.json`.

   **To add the custom connector:**
   1. Open Claude Desktop
   2. Go to **Settings → Connectors**
   3. Click **Add Custom Connector**
   4. Enter your deployment URL: `https://your-project.vercel.app/mcp`
   5. Save and restart Claude Desktop

   **Note**: Make sure to include `/mcp` at the end of the URL!

6. **Test the Deployment**:
   ```bash
   # Test with the test script
   node scripts/test-streamable-http-client.mjs https://your-project.vercel.app
   ```

#### Deployment Options

**Stdio vs HTTP Transport:**
- **Stdio (Recommended)**: Lower latency, direct process communication, best for Claude Desktop
- **HTTP (Custom Connector)**: Centralized deployment, multiple clients, better for cloud deployments

**Which to use?**
- Use **stdio** for local Claude Desktop integration
- Use **HTTP** for centralized deployments, multiple users, or cloud-based AI clients

## Security

### Authentication Overview

This MCP server uses different authentication strategies depending on the transport:

**Stdio Transport (Recommended for Personal Use)**
- Uses environment variables for AITable API authentication
- No client authentication required (local process, no network exposure)
- Most secure for personal use
- Configure via `claude_desktop_config.json`

**HTTP Transport (Custom Connector)**
- Deployed to Vercel as a serverless function
- Requires disabling Vercel Deployment Protection
- CORS-enabled for browser-based access
- Environment variables stored securely in Vercel

### Security Best Practices

**IMPORTANT:**
- ⚠️ Keep your `AITABLE_API_TOKEN` secret - it grants full access to your AITable data
- ⚠️ Keep your deployment URL private - share only with trusted users
- ⚠️ **Disable Vercel Deployment Protection** for MCP clients to connect
- ✅ Use environment variables in Vercel (never commit tokens to git)
- ✅ Rotate your API token periodically
- ✅ Monitor access logs in Vercel dashboard
- ✅ For personal use, prefer stdio transport over HTTP

## Architecture

This MCP server supports **dual transport** following official MCP patterns:

### Stdio Transport (src/stdio-server.ts)
- Primary entry point for Claude Desktop
- Direct process communication via stdin/stdout
- Low latency, perfect for local development
- Executable via `npx` or `node dist/stdio-server.js`

### HTTP Transport (api/server.ts)
- Vercel serverless function with CORS support
- Uses `mcp-handler` library for HTTP transport
- Supports custom connector deployments
- All requests handled at root path with catch-all routing

Both transports share the same core business logic while providing different communication mechanisms.

## Project Structure

```
aitable-mcp/
├── src/
│   ├── stdio-server.ts    # Stdio entry point
│   ├── http-server.ts     # Local HTTP server for testing
│   ├── aitable-tools.ts   # MCP tool implementations
│   ├── formula-resource.ts # Formula documentation provider
│   ├── types.ts           # TypeScript type definitions
│   └── *.md               # Formula documentation files
├── api/
│   └── server.ts          # HTTP entry point (Vercel)
├── public/
│   └── index.html         # Landing page
├── scripts/
│   ├── test-client.mjs                    # SSE transport tester
│   └── test-streamable-http-client.mjs    # HTTP transport tester
├── dist/                  # Compiled output
├── package.json
├── tsconfig.json
├── vercel.json            # Vercel configuration
└── README.md
```

## Available Tools (16)

The MCP server provides comprehensive AITable integration tools:

### Records Management
- `get_records` - Query records with filtering, sorting, and pagination
- `create_records` - Create new records (max 10 per request)
- `update_records` - Update existing records (max 10 per request)
- `delete_records` - Delete records (max 10 per request)

### Fields Management
- `get_fields` - Get field metadata from datasheets
- `create_field` - Create new fields in datasheets
- `delete_field` - Delete fields from datasheets

### Views & Datasheets
- `get_views` - Get views from datasheets
- `create_datasheet` - Create new datasheets with custom fields

### Attachments
- `upload_attachment` - Upload files to datasheets

### Nodes & Workspace
- `get_node_list` - Get list of files in workspace
- `search_nodes` - Search nodes by type, permissions, and keywords
- `get_node_detail` - Get detailed information about specific nodes

### Embed Links
- `create_embed_link` - Create embeddable links for nodes
- `get_embed_links` - List all embed links for a node
- `delete_embed_link` - Delete/disable embed links

## Available Resources (8)

Formula reference documentation:

- `formula_overview` - Quick reference guide to AITable formulas
- `formula_operators` - AITable formula operators
- `formula_numeric` - AITable numeric functions
- `formula_string` - AITable string functions
- `formula_logical` - AITable logical functions
- `formula_date` - AITable date/time functions
- `formula_array` - AITable array functions
- `field_colors` - AITable field color reference

## Development

```bash
# Clean build artifacts
npm run clean

# Build TypeScript
npm run build

# Watch mode for development
npm run dev

# Test HTTP server locally
npm run dev:http

# Test with Vercel dev server
npm run dev:vercel
```

## Contributing

Contributions are welcome! Please ensure your changes maintain the dual-transport architecture.

### For AI-Assisted Development

If you're using Claude Code or other AI assistants to work on this codebase, run `/init` to generate a `CLAUDE.md` file with architectural guidance and development patterns specific to this project.

## License

MIT

## Related Projects

### Bika MCP Server

AITable has been discontinued. For the successor platform, check out the [Bika MCP Server](https://github.com/hamchowderr/bika-mcp). It provides similar MCP integration for Bika.ai, making it easy to migrate your workflows.

## Resources

- [AITable](https://aitable.ai)
- [Bika.ai](https://bika.ai) - AITable successor platform
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Bika MCP Server](https://github.com/hamchowderr/bika-mcp) - MCP server for Bika.ai integration
