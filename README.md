# AITable MCP Server

![AITable](./images/aitable.jpeg)

A Model Context Protocol (MCP) server for [AITable](https://aitable.ai) with dual transport support:
- **stdio** - for local use with Claude Desktop
- **HTTP (Streamable)** - for remote use / deployment

> **⚠️ Important:** AITable has been discontinued. If you're looking to migrate to Bika (the successor platform), check out the [Bika MCP Server](https://github.com/hamchowderr/bika-mcp).
>
> **AITable LTD Holders:** Claim your free Bika account by filling out [this migration form](https://bika.ai/space/spcND68gdMMZBmGK67gvqNVx/node/fom8XyUsPAmUVwlgpq8bFxPw) (available only for AITable LTD users).

## Features

### 16 Available Tools

**Records Management:**
- `get_records` - Get records from datasheets (up to 1000 per request, 11 query parameters)
- `create_records` - Create new records (up to 10 per request)
- `update_records` - Update existing records (up to 10 per request)
- `delete_records` - Delete records (up to 10 per request)

**Fields Management:**
- `get_fields` - Get field metadata from datasheets
- `create_field` - Create new fields in datasheets
- `delete_field` - Delete fields from datasheets

**Views & Datasheets:**
- `get_views` - Get views from datasheets
- `create_datasheet` - Create new datasheets with custom fields

**Attachments:**
- `upload_attachment` - Upload files to datasheets

**Nodes & Workspace:**
- `get_node_list` - Get list of files in workspace (Fusion API v3)
- `search_nodes` - Search nodes by type, permissions, and keywords (v2)
- `get_node_detail` - Get detailed information about specific nodes

**Embed Links:**
- `create_embed_link` - Create embeddable links for nodes
- `get_embed_links` - List all embed links for a node (up to 30)
- `delete_embed_link` - Delete/disable embed links

## Important Notes

**Default Field Names:** When creating datasheets without specifying fields, AITable auto-generates 3 default fields with Chinese names (选项, 标题, 附件). To ensure English field names, always specify fields explicitly when using `create_datasheet`.

**File Upload Requirements:**
- Use **absolute file paths** when uploading attachments (e.g., `C:/Users/<YOUR_USERNAME>/Documents/file.pdf`)
- Maximum file size: **1 GB per attachment**
- Only one file can be uploaded per API call
- Supported formats: Images, PDFs, documents, and other common file types

## Setup

1. **Install dependencies:**
```bash
pnpm install
```

2. **Configure environment variables:**

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Then edit `.env` with your credentials:
```bash
# Get your API token from https://aitable.ai workspace settings
AITABLE_API_TOKEN=your_api_token_here

# Get your space ID from your AITable workspace URL (e.g., spcX9P2xUcKst)
SPACE_ID=your_space_id_here
```

3. **Build the project:**
```bash
pnpm build
```

## Usage

### Option 1: stdio Server (for Claude Desktop)

Configure Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

**Production (recommended):**
```json
{
  "mcpServers": {
    "aitable": {
      "command": "node",
      "args": ["C:/Users/<YOUR_USERNAME>/code/aitable-mcp/dist/stdio-server.js"],
      "env": {
        "AITABLE_API_TOKEN": "your_token_here",
        "SPACE_ID": "your_space_id_here"
      }
    }
  }
}
```

**Development mode with tsx:**
```json
{
  "mcpServers": {
    "aitable": {
      "command": "npx",
      "args": ["-y", "tsx", "C:/Users/<YOUR_USERNAME>/code/aitable-mcp/src/stdio-server.ts"],
      "env": {
        "AITABLE_API_TOKEN": "your_token_here",
        "SPACE_ID": "your_space_id_here"
      }
    }
  }
}
```

After configuration:
1. Save the config file
2. Restart Claude Desktop
3. Claude will now have access to all 16 AITable tools

### Option 2: HTTP Server (for remote access)

**Local Development:**
```bash
pnpm dev:http
```

The server will run at `http://localhost:3000/mcp`.

**Test with the client:**
```bash
pnpm client
```

### Option 3: Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Set environment variables in Vercel Dashboard:**
   - Go to your project settings
   - Add `AITABLE_API_TOKEN`
   - Add `SPACE_ID`

4. **Your MCP server will be available at:**
```
https://YOUR_DEPLOYMENT_URL.vercel.app/api/mcp
```

**Health check endpoint:**
```
https://YOUR_DEPLOYMENT_URL.vercel.app/api/health
```

5. **Use as Custom Connector:**
   - The Vercel URL can be added as a custom MCP connector in ChatGPT and Claude Desktop
   - Use your deployment URL: `https://YOUR_DEPLOYMENT_URL.vercel.app/api/mcp`

## Development

Build TypeScript:
```bash
pnpm build
```

Run stdio server (development):
```bash
pnpm dev:stdio
```

Run HTTP server (development):
```bash
pnpm dev:http
```

Test with client:
```bash
pnpm client
```

## Project Structure

```
aitable-mcp/
├── src/
│   ├── types.ts           # AITable API type definitions
│   ├── aitable-tools.ts   # Shared tool implementations (16 tools)
│   ├── stdio-server.ts    # stdio transport server (Claude Desktop)
│   ├── http-server.ts     # HTTP transport server (local/remote)
│   └── client.ts          # Test client
├── api/
│   └── mcp.ts             # Vercel serverless function
├── dist/                  # Compiled JavaScript (not committed)
├── .env                   # Your credentials (not committed)
├── .env.example           # Example environment file
├── .gitignore             # Git ignore rules
├── vercel.json            # Vercel deployment config
└── package.json
```

## API Rate Limits

AITable has different rate limits based on your plan:
- Free: 2 QPS
- Plus: 5 QPS
- Pro: 10 QPS
- Enterprise: 20 QPS

## License

MIT
