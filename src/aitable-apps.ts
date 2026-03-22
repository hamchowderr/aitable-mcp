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
}
