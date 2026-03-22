// AITable MCP Apps - Interactive UI Extension
// Registers MCP App tools and resources for interactive data visualization

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type {
  AITableResponse,
  GetRecordsResponse,
  GetFieldsResponse,
  GetNodeListResponse,
} from "./types.js";

const AITABLE_BASE_URL = "https://aitable.ai/fusion/v1";

// Resolve the dist/apps directory for reading built HTML files
function getAppsDir(): string {
  // This file runs from dist/src/aitable-apps.js
  // The apps are built to dist/apps/ (sibling of dist/src/)
  const fromModule = join(dirname(fileURLToPath(import.meta.url)), "..", "apps");
  const fromCwd = join(process.cwd(), "dist", "apps");
  // Prefer module-relative path for portability
  return fromModule || fromCwd;
}

// Helper function for AITable API requests (shared with aitable-tools)
async function aitableFetch<T>(
  apiToken: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<AITableResponse<T>> {
  const response = await fetch(`${AITABLE_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP ${response.status}: ${errorText || response.statusText}`
    );
  }

  const data = (await response.json()) as AITableResponse<T>;

  if (!data.success || data.code !== 200) {
    throw new Error(`AITable API Error (${data.code}): ${data.message}`);
  }

  return data;
}

function readAppHtml(filename: string): string {
  const appsDir = getAppsDir();
  return readFileSync(join(appsDir, filename), "utf-8");
}

// Register all AITable MCP Apps on the server
export function registerAITableApps(
  server: McpServer,
  apiToken: string,
  spaceId: string
) {
  // ── Record Browser App ──
  // Interactive table view for browsing datasheet records

  const recordBrowserUri = "ui://aitable/record-browser.html";

  registerAppTool(
    server,
    "view_records",
    {
      title: "View Records",
      description:
        "Display AITable datasheet records in an interactive table with sorting, filtering, and search. Returns a visual record browser UI.",
      inputSchema: {
        datasheetId: z
          .string()
          .describe("The ID of the datasheet (e.g., 'dst0Yj5aNeoHldqvf6')"),
        pageSize: z
          .number()
          .int()
          .min(1)
          .max(1000)
          .optional()
          .describe("Records per page (1-1000, default: 100)"),
        viewId: z
          .string()
          .optional()
          .describe("View ID to filter records"),
        fieldKey: z
          .enum(["name", "id"])
          .optional()
          .describe("Use field name or ID"),
      },
      _meta: { ui: { resourceUri: recordBrowserUri } },
    },
    async ({ datasheetId, pageSize, viewId, fieldKey }): Promise<CallToolResult> => {
      try {
        const params = new URLSearchParams();
        if (pageSize) params.append("pageSize", pageSize.toString());
        if (viewId) params.append("viewId", viewId);
        if (fieldKey) params.append("fieldKey", fieldKey);

        const queryString = params.toString();
        const endpoint = `/datasheets/${datasheetId}/records${queryString ? `?${queryString}` : ""}`;

        const result = await aitableFetch<GetRecordsResponse>(
          apiToken,
          endpoint
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching records: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  registerAppResource(
    server,
    "Record Browser",
    recordBrowserUri,
    {
      description:
        "Interactive table UI for browsing AITable datasheet records with sorting and search",
    },
    async () => {
      const html = readAppHtml("record-browser.html");
      return {
        contents: [
          {
            uri: recordBrowserUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
          },
        ],
      };
    }
  );

  // ── Space Overview App ──
  // Visual dashboard showing workspace nodes

  const spaceOverviewUri = "ui://aitable/space-overview.html";

  registerAppTool(
    server,
    "view_space",
    {
      title: "View Space",
      description:
        "Display an interactive visual overview of your AITable workspace showing all nodes (datasheets, folders, forms, dashboards) as a dashboard with stats and search.",
      inputSchema: {},
      _meta: { ui: { resourceUri: spaceOverviewUri } },
    },
    async (): Promise<CallToolResult> => {
      try {
        const endpoint = `/spaces/${spaceId}/nodes`;
        const result = await aitableFetch<GetNodeListResponse>(
          apiToken,
          endpoint
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching space data: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  registerAppResource(
    server,
    "Space Overview",
    spaceOverviewUri,
    {
      description:
        "Interactive dashboard UI showing AITable workspace nodes with stats and search",
    },
    async () => {
      const html = readAppHtml("space-overview.html");
      return {
        contents: [
          {
            uri: spaceOverviewUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
          },
        ],
      };
    }
  );

  // ── Record Editor App ──
  // Form UI for creating and editing records

  const recordEditorUri = "ui://aitable/record-editor.html";

  registerAppTool(
    server,
    "edit_record",
    {
      title: "Edit Record",
      description:
        "Open an interactive form to create or edit an AITable record. Displays field-type-appropriate inputs (text, number, select, date, checkbox). Fetches field metadata and optionally an existing record for editing.",
      inputSchema: {
        datasheetId: z
          .string()
          .describe("The datasheet ID"),
        recordId: z
          .string()
          .optional()
          .describe("Record ID to edit (omit for create mode)"),
      },
      _meta: { ui: { resourceUri: recordEditorUri } },
    },
    async ({ datasheetId, recordId }): Promise<CallToolResult> => {
      try {
        // Fetch field metadata
        const fieldsResult = await aitableFetch<GetFieldsResponse>(
          apiToken,
          `/datasheets/${datasheetId}/fields`
        );

        const responseData: any = {
          fields: fieldsResult.data?.fields || [],
          datasheetId,
          mode: recordId ? "edit" : "create",
        };

        // If editing, fetch the specific record
        if (recordId) {
          const recordResult = await aitableFetch<GetRecordsResponse>(
            apiToken,
            `/datasheets/${datasheetId}/records?recordIds=${recordId}`
          );
          if (recordResult.data?.records?.[0]) {
            responseData.record = recordResult.data.records[0];
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(responseData, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  registerAppResource(
    server,
    "Record Editor",
    recordEditorUri,
    {
      description:
        "Interactive form UI for creating and editing AITable records with field-type-specific inputs",
    },
    async () => ({
      contents: [{ uri: recordEditorUri, mimeType: RESOURCE_MIME_TYPE, text: readAppHtml("record-editor.html") }],
    })
  );

  // ── Datasheet Creator App ──
  // Visual wizard for designing new datasheets

  const datasheetCreatorUri = "ui://aitable/datasheet-creator.html";

  registerAppTool(
    server,
    "design_datasheet",
    {
      title: "Design Datasheet",
      description:
        "Open an interactive wizard to design and create a new AITable datasheet. Provides a visual form for naming, describing, and adding fields with type selection.",
      inputSchema: {},
      _meta: { ui: { resourceUri: datasheetCreatorUri } },
    },
    async (): Promise<CallToolResult> => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ spaceId, ready: true }, null, 2),
          },
        ],
      };
    }
  );

  registerAppResource(
    server,
    "Datasheet Creator",
    datasheetCreatorUri,
    {
      description:
        "Interactive wizard UI for designing and creating new AITable datasheets with custom fields",
    },
    async () => ({
      contents: [{ uri: datasheetCreatorUri, mimeType: RESOURCE_MIME_TYPE, text: readAppHtml("datasheet-creator.html") }],
    })
  );

  // ── Field Manager App ──
  // Visual field list with create/delete

  const fieldManagerUri = "ui://aitable/field-manager.html";

  registerAppTool(
    server,
    "manage_fields",
    {
      title: "Manage Fields",
      description:
        "Open an interactive field manager showing all fields in an AITable datasheet. Displays field types, properties, and allows creating new fields or deleting existing ones.",
      inputSchema: {
        datasheetId: z
          .string()
          .describe("The datasheet ID"),
      },
      _meta: { ui: { resourceUri: fieldManagerUri } },
    },
    async ({ datasheetId }): Promise<CallToolResult> => {
      try {
        const result = await aitableFetch<GetFieldsResponse>(
          apiToken,
          `/datasheets/${datasheetId}/fields`
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching fields: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  registerAppResource(
    server,
    "Field Manager",
    fieldManagerUri,
    {
      description:
        "Interactive field management UI for AITable datasheets with create/delete capabilities",
    },
    async () => ({
      contents: [{ uri: fieldManagerUri, mimeType: RESOURCE_MIME_TYPE, text: readAppHtml("field-manager.html") }],
    })
  );

  // ── Embed Link Previewer App ──
  // Live preview and management of embed links

  const embedPreviewerUri = "ui://aitable/embed-previewer.html";

  registerAppTool(
    server,
    "preview_embeds",
    {
      title: "Preview Embed Links",
      description:
        "Open an interactive embed link manager for an AITable node. Shows all embed links with live iframe previews, copy URL, delete, and create new embed links.",
      inputSchema: {
        nodeId: z
          .string()
          .describe("The node ID (datasheet/dashboard/form)"),
      },
      _meta: { ui: { resourceUri: embedPreviewerUri } },
    },
    async ({ nodeId }): Promise<CallToolResult> => {
      try {
        const response = await fetch(`${AITABLE_BASE_URL}/spaces/${spaceId}/nodes/${nodeId}/embedlinks`, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = (await response.json()) as AITableResponse<any>;
        if (!data.success || data.code !== 200) {
          throw new Error(`AITable API Error (${data.code}): ${data.message}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data.data, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching embed links: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  registerAppResource(
    server,
    "Embed Previewer",
    embedPreviewerUri,
    {
      description:
        "Interactive embed link manager with live previews for AITable nodes",
    },
    async () => ({
      contents: [{ uri: embedPreviewerUri, mimeType: RESOURCE_MIME_TYPE, text: readAppHtml("embed-previewer.html") }],
    })
  );

  // ── Attachment Manager App ──
  // Visual upload UI with file previews

  const attachmentManagerUri = "ui://aitable/attachment-manager.html";

  registerAppTool(
    server,
    "manage_attachments",
    {
      title: "Manage Attachments",
      description:
        "Open an interactive attachment manager for an AITable datasheet. Shows uploaded files with previews, tokens for attaching to records, and the 2-step upload workflow.",
      inputSchema: {
        datasheetId: z
          .string()
          .describe("The datasheet ID to manage attachments for"),
      },
      _meta: { ui: { resourceUri: attachmentManagerUri } },
    },
    async ({ datasheetId }): Promise<CallToolResult> => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ datasheetId, ready: true }, null, 2),
          },
        ],
      };
    }
  );

  registerAppResource(
    server,
    "Attachment Manager",
    attachmentManagerUri,
    {
      description:
        "Interactive attachment upload and management UI for AITable datasheets",
    },
    async () => ({
      contents: [{ uri: attachmentManagerUri, mimeType: RESOURCE_MIME_TYPE, text: readAppHtml("attachment-manager.html") }],
    })
  );

  // ── Node Tree Explorer App ──
  // Expandable folder tree with detail panel

  const nodeExplorerUri = "ui://aitable/node-explorer.html";

  registerAppTool(
    server,
    "explore_nodes",
    {
      title: "Explore Nodes",
      description:
        "Open an interactive tree explorer for the AITable workspace. Shows an expandable folder hierarchy where clicking folders loads children, with a detail panel and search.",
      inputSchema: {},
      _meta: { ui: { resourceUri: nodeExplorerUri } },
    },
    async (): Promise<CallToolResult> => {
      try {
        const endpoint = `/spaces/${spaceId}/nodes`;
        const result = await aitableFetch<GetNodeListResponse>(
          apiToken,
          endpoint
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching nodes: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  registerAppResource(
    server,
    "Node Explorer",
    nodeExplorerUri,
    {
      description:
        "Interactive tree explorer UI for navigating AITable workspace nodes with expandable folders",
    },
    async () => ({
      contents: [{ uri: nodeExplorerUri, mimeType: RESOURCE_MIME_TYPE, text: readAppHtml("node-explorer.html") }],
    })
  );
}
