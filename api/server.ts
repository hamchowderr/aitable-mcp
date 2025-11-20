// Vercel Serverless Function for AITable MCP using mcp-handler
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";
import { basename } from "path";
import type {
  AITableResponse,
  GetRecordsResponse,
  CreateRecordsResponse,
  UpdateRecordsResponse,
  DeleteRecordsResponse,
  GetFieldsResponse,
  CreateFieldResponse,
  DeleteFieldResponse,
  GetViewsResponse,
  CreateDatasheetResponse,
  UploadAttachmentResponse,
  GetNodeListResponse,
  SearchNodesResponse,
  CreateEmbedLinkResponse,
  GetNodeDetailResponse,
} from "../src/types.js";

const API_TOKEN = process.env.AITABLE_API_TOKEN;
const SPACE_ID = process.env.SPACE_ID;

if (!API_TOKEN || !SPACE_ID) {
  throw new Error("Missing required environment variables: AITABLE_API_TOKEN and/or SPACE_ID");
}

const AITABLE_BASE_URL = "https://aitable.ai/fusion/v1";

// Helper function for AITable API requests
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
      ...(options.headers as Record<string, string> || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  const data = await response.json() as AITableResponse<T>;

  if (!data.success || data.code !== 200) {
    throw new Error(`AITable API Error (${data.code}): ${data.message}`);
  }

  return data;
}

// Create MCP handler with all AITable tools and resources
const handler = createMcpHandler((server) => {
  // === AITable Tools ===

  // Get Records Tool
  server.tool(
    "get_records",
    "Get records from an AITable datasheet with full query support including pagination, filtering, sorting, and field selection",
    {
      datasheetId: z.string().describe("The ID of the datasheet (e.g., 'dst0Yj5aNeoHldqvf6')"),
      pageSize: z.number().int().min(1).max(1000).optional().describe("Records per page (1-1000, default: 100)"),
      maxRecords: z.number().int().optional().describe("Total records to return"),
      pageNum: z.number().int().min(1).optional().describe("Page number (default: 1)"),
      sort: z.array(z.object({
        field: z.string().describe("Field name or ID to sort by"),
        order: z.enum(["asc", "desc"]).describe("Sort order"),
      })).optional().describe("Array of sort objects"),
      recordIds: z.array(z.string()).optional().describe("Specific record IDs (max 1000)"),
      viewId: z.string().optional().describe("View ID to filter records"),
      fields: z.array(z.string()).optional().describe("Field names to include"),
      filterByFormula: z.string().optional().describe("Formula to filter records"),
      cellFormat: z.enum(["json", "string"]).optional().describe("Cell value format"),
      fieldKey: z.enum(["name", "id"]).optional().describe("Use field name or ID"),
    },
    async ({
      datasheetId,
      pageSize,
      maxRecords,
      pageNum,
      sort,
      recordIds,
      viewId,
      fields,
      filterByFormula,
      cellFormat,
      fieldKey,
    }) => {
      try {
        const params = new URLSearchParams();

        if (pageSize) params.append("pageSize", pageSize.toString());
        if (maxRecords) params.append("maxRecords", maxRecords.toString());
        if (pageNum) params.append("pageNum", pageNum.toString());
        if (viewId) params.append("viewId", viewId);
        if (cellFormat) params.append("cellFormat", cellFormat);
        if (fieldKey) params.append("fieldKey", fieldKey);
        if (filterByFormula) params.append("filterByFormula", filterByFormula);

        if (fields && Array.isArray(fields)) {
          fields.forEach(field => params.append("fields", field));
        }

        if (recordIds && Array.isArray(recordIds)) {
          recordIds.forEach(id => params.append("recordIds", id));
        }

        if (sort && Array.isArray(sort)) {
          sort.forEach((sortObj, index) => {
            if (sortObj.field) params.append(`sort[${index}][field]`, sortObj.field);
            if (sortObj.order) params.append(`sort[${index}][order]`, sortObj.order);
          });
        }

        const queryString = params.toString();
        const endpoint = `/datasheets/${datasheetId}/records${queryString ? `?${queryString}` : ""}`;

        const result = await aitableFetch<GetRecordsResponse>(API_TOKEN!, endpoint);

        return {
          content: [
            {
              type: "text",
              text: `✓ Retrieved ${result.data?.records.length || 0} records from datasheet ${datasheetId}\n\nTotal: ${result.data?.total || 0} | Page: ${result.data?.pageNum || 1} | Page Size: ${result.data?.pageSize || 0}\n\n${JSON.stringify(result.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting records: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Create Records Tool
  server.tool(
    "create_records",
    "Create new records in an AITable datasheet (max 10 per request). For attachment fields, provide array of objects with 'token' and 'name' properties: [{\"token\": \"space/...\", \"name\": \"filename.pdf\"}]",
    {
      datasheetId: z.string().describe("The datasheet ID"),
      records: z.array(z.object({
        fields: z.record(z.any()).describe("Field name-value pairs. For attachment fields, use format: [{\"token\": \"space/...\", \"name\": \"filename.pdf\"}]"),
      })).min(1).max(10).describe("Records to create (max: 10)"),
      viewId: z.string().optional().describe("When specified, returns fields that are not hidden and not empty in the view"),
      fieldKey: z.enum(["name", "id"]).optional().describe("Use field 'name' (default) or 'id' for writing and returning fields"),
    },
    async ({ datasheetId, records, viewId, fieldKey }) => {
      try {
        if (records.length === 0) {
          throw new Error("At least 1 record is required");
        }
        if (records.length > 10) {
          throw new Error(`Maximum 10 records allowed per request, got ${records.length}`);
        }

        const processedRecords = records.map((record, index) => {
          if (!record.fields || Object.keys(record.fields).length === 0) {
            throw new Error(`Record at index ${index} has no fields`);
          }

          const processedFields: Record<string, any> = {};

          for (const [fieldName, value] of Object.entries(record.fields)) {
            if (fieldName.trim() === "") {
              throw new Error(`Record at index ${index} has empty field name`);
            }

            if (Array.isArray(value) && value.length > 0 && value[0]?.token) {
              const attachments = value.map((att, attIndex) => {
                if (!att.token || typeof att.token !== 'string' || att.token.trim() === '') {
                  throw new Error(`Record ${index}, field '${fieldName}', attachment ${attIndex}: 'token' is required and must be a non-empty string`);
                }
                if (!att.name || typeof att.name !== 'string' || att.name.trim() === '') {
                  throw new Error(`Record ${index}, field '${fieldName}', attachment ${attIndex}: 'name' is required and must be a non-empty string`);
                }
                return { token: att.token, name: att.name };
              });
              processedFields[fieldName] = attachments;
            } else {
              processedFields[fieldName] = value;
            }
          }

          return { fields: processedFields };
        });

        const params = new URLSearchParams();
        if (viewId) params.append("viewId", viewId);
        if (fieldKey) params.append("fieldKey", fieldKey);

        const queryString = params.toString();
        const endpoint = `/datasheets/${datasheetId}/records${queryString ? `?${queryString}` : ""}`;

        const result = await aitableFetch<CreateRecordsResponse>(
          API_TOKEN!,
          endpoint,
          {
            method: "POST",
            body: JSON.stringify({ records: processedRecords }),
          }
        );

        return {
          content: [
            {
              type: "text",
              text: `✓ Created ${result.data?.records.length || 0} records in datasheet ${datasheetId}\n\n${JSON.stringify(result.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating records: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Update Records Tool
  server.tool(
    "update_records",
    "Update existing records in an AITable datasheet (max 10 per request). For attachment fields, provide array of objects with 'token' and 'name' properties: [{\"token\": \"space/...\", \"name\": \"filename.pdf\"}]",
    {
      datasheetId: z.string().describe("The datasheet ID"),
      records: z.array(z.object({
        recordId: z.string().describe("Record ID to update"),
        fields: z.record(z.any()).describe("Fields to update. For attachment fields, use format: [{\"token\": \"space/...\", \"name\": \"filename.pdf\"}]"),
      })).min(1).max(10).describe("Records to update (max: 10)"),
      viewId: z.string().optional().describe("When specified, returns fields that are not hidden and not empty in the view"),
      fieldKey: z.enum(["name", "id"]).optional().describe("Use field 'name' (default) or 'id' for writing and returning fields"),
    },
    async ({ datasheetId, records, viewId, fieldKey }) => {
      try {
        if (records.length === 0) {
          throw new Error("At least 1 record is required");
        }
        if (records.length > 10) {
          throw new Error(`Maximum 10 records allowed per request, got ${records.length}`);
        }

        const processedRecords = records.map((record, index) => {
          if (!record.recordId || typeof record.recordId !== 'string' || record.recordId.trim() === '') {
            throw new Error(`Record at index ${index}: 'recordId' is required and must be a non-empty string`);
          }

          if (!record.fields || Object.keys(record.fields).length === 0) {
            throw new Error(`Record at index ${index} (${record.recordId}) has no fields to update`);
          }

          const processedFields: Record<string, any> = {};

          for (const [fieldName, value] of Object.entries(record.fields)) {
            if (fieldName.trim() === "") {
              throw new Error(`Record ${index} (${record.recordId}) has empty field name`);
            }

            if (Array.isArray(value) && value.length > 0 && value[0]?.token) {
              const attachments = value.map((att, attIndex) => {
                if (!att.token || typeof att.token !== 'string' || att.token.trim() === '') {
                  throw new Error(`Record ${index} (${record.recordId}), field '${fieldName}', attachment ${attIndex}: 'token' is required and must be a non-empty string`);
                }
                if (!att.name || typeof att.name !== 'string' || att.name.trim() === '') {
                  throw new Error(`Record ${index} (${record.recordId}), field '${fieldName}', attachment ${attIndex}: 'name' is required and must be a non-empty string`);
                }
                return { token: att.token, name: att.name };
              });
              processedFields[fieldName] = attachments;
            } else {
              processedFields[fieldName] = value;
            }
          }

          return { recordId: record.recordId, fields: processedFields };
        });

        const params = new URLSearchParams();
        if (viewId) params.append("viewId", viewId);

        const queryString = params.toString();
        const endpoint = `/datasheets/${datasheetId}/records${queryString ? `?${queryString}` : ""}`;

        const requestBody: any = { records: processedRecords };
        if (fieldKey) requestBody.fieldKey = fieldKey;

        const result = await aitableFetch<UpdateRecordsResponse>(
          API_TOKEN!,
          endpoint,
          {
            method: "PATCH",
            body: JSON.stringify(requestBody),
          }
        );

        return {
          content: [
            {
              type: "text",
              text: `✓ Updated ${result.data?.records.length || 0} records in datasheet ${datasheetId}\n\n${JSON.stringify(result.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error updating records: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Delete Records Tool
  server.tool(
    "delete_records",
    "Delete records from an AITable datasheet (max 10 per request)",
    {
      datasheetId: z.string().describe("The datasheet ID"),
      recordIds: z.array(z.string()).min(1).max(10).describe("Record IDs to delete (max: 10)"),
    },
    async ({ datasheetId, recordIds }) => {
      try {
        if (recordIds.length === 0) {
          throw new Error("At least 1 record ID is required");
        }
        if (recordIds.length > 10) {
          throw new Error(`Maximum 10 record IDs allowed per request, got ${recordIds.length}`);
        }

        recordIds.forEach((id, index) => {
          if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error(`Record ID at index ${index} is empty or invalid`);
          }
        });

        const params = recordIds.map(id => `recordIds=${encodeURIComponent(id)}`).join("&");
        const result = await aitableFetch<DeleteRecordsResponse>(
          API_TOKEN!,
          `/datasheets/${datasheetId}/records?${params}`,
          {
            method: "DELETE",
          }
        );

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully deleted ${recordIds.length} record(s) from datasheet ${datasheetId}\n\nDeleted record IDs:\n${JSON.stringify(recordIds, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting records: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Fields Tool
  server.tool(
    "get_fields",
    "Get information about all fields in an AITable datasheet. Returns field metadata including id, name, type, and properties. Max 200 fields per datasheet.",
    {
      datasheetId: z.string().describe("The datasheet ID"),
      viewId: z.string().optional().describe("View ID. When specified, returns fields in view order and excludes hidden fields"),
    },
    async ({ datasheetId, viewId }) => {
      try {
        const params = new URLSearchParams();
        if (viewId) params.append("viewId", viewId);

        const queryString = params.toString();
        const endpoint = `/datasheets/${datasheetId}/fields${queryString ? `?${queryString}` : ""}`;

        const result = await aitableFetch<GetFieldsResponse>(API_TOKEN!, endpoint);

        return {
          content: [
            {
              type: "text",
              text: `✓ Retrieved ${result.data?.fields.length || 0} fields from datasheet ${datasheetId}\n\n${JSON.stringify(result.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting fields: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Create Field Tool
  server.tool(
    "create_field",
    "Create a new field in an AITable datasheet. Max 200 fields per datasheet. Currently supports SingleText field type.",
    {
      datasheetId: z.string().describe("The datasheet ID"),
      type: z.string().describe("Field type (e.g., 'SingleText')"),
      name: z.string().max(100).describe("Field name, max 100 characters"),
      property: z.object({
        defaultValue: z.string().optional().describe("Default text content"),
      }).describe("Field properties"),
    },
    async ({ datasheetId, type, name, property }) => {
      try {
        if (!name || name.trim() === '') {
          throw new Error("Field name is required and cannot be empty");
        }
        if (name.length > 100) {
          throw new Error(`Field name exceeds maximum length of 100 characters (got ${name.length})`);
        }
        if (!type || type.trim() === '') {
          throw new Error("Field type is required and cannot be empty");
        }

        const endpoint = `/spaces/${SPACE_ID}/datasheets/${datasheetId}/fields`;

        const result = await aitableFetch<CreateFieldResponse>(
          API_TOKEN!,
          endpoint,
          {
            method: "POST",
            body: JSON.stringify({ type, name, property }),
          }
        );

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully created field "${name}" in datasheet ${datasheetId}\n\n${JSON.stringify(result.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating field: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Delete Field Tool
  server.tool(
    "delete_field",
    "Delete a field from an AITable datasheet",
    {
      datasheetId: z.string().describe("The datasheet ID"),
      fieldId: z.string().describe("The field ID to delete"),
    },
    async ({ datasheetId, fieldId }) => {
      try {
        const endpoint = `/spaces/${SPACE_ID}/datasheets/${datasheetId}/fields/${fieldId}`;

        await aitableFetch<DeleteFieldResponse>(
          API_TOKEN!,
          endpoint,
          {
            method: "DELETE",
          }
        );

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully deleted field ${fieldId} from datasheet ${datasheetId}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting field: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Views Tool
  server.tool(
    "get_views",
    "Get all views from an AITable datasheet. Returns view metadata including id, name, and type (Grid, Gallery, Kanban, Gantt, Calendar, Architecture).",
    {
      datasheetId: z.string().describe("The datasheet ID"),
    },
    async ({ datasheetId }) => {
      try {
        const endpoint = `/datasheets/${datasheetId}/views`;

        const result = await aitableFetch<GetViewsResponse>(API_TOKEN!, endpoint);

        return {
          content: [
            {
              type: "text",
              text: `✓ Retrieved ${result.data?.views.length || 0} views from datasheet ${datasheetId}\n\n${JSON.stringify(result.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting views: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Node List Tool
  server.tool(
    "get_node_list",
    "Get a list of the outermost files in the working directory of the AITable space. Returns datasheets, folders, forms, dashboards, automations, etc. Uses Fusion API v3 for better performance.",
    {},
    async () => {
      try {
        const endpoint = `/spaces/${SPACE_ID}/nodes`;

        const result = await aitableFetch<GetNodeListResponse>(API_TOKEN!, endpoint);

        return {
          content: [
            {
              type: "text",
              text: `✓ Retrieved ${result.data?.nodes.length || 0} nodes from space ${SPACE_ID}\n\n${JSON.stringify(result.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting node list: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Create Datasheet Tool
  server.tool(
    "create_datasheet",
    "Create a new datasheet in an AITable space. Max 200 fields can be created in a single request. If no fields are provided, 3 default fields will be added.",
    {
      name: z.string().max(100).describe("Datasheet name, max 100 characters"),
      description: z.string().max(500).optional().describe("Table description, max 500 characters"),
      folderId: z.string().optional().describe("Folder ID; defaults to working directory if blank"),
      preNodeId: z.string().optional().describe("Previous node ID; defaults to first position if blank"),
      fields: z.array(z.object({
        type: z.string().describe("Field type (e.g., 'SingleText')"),
        name: z.string().max(100).describe("Field name, max 100 characters"),
        property: z.record(z.any()).describe("Field properties"),
      })).optional().describe("Field list; if blank, 3 default fields will be added"),
    },
    async ({ name, description, folderId, preNodeId, fields }) => {
      try {
        if (!name || name.trim() === '') {
          throw new Error("Datasheet name is required and cannot be empty");
        }
        if (name.length > 100) {
          throw new Error(`Datasheet name exceeds maximum length of 100 characters (got ${name.length})`);
        }

        if (description && description.length > 500) {
          throw new Error(`Description exceeds maximum length of 500 characters (got ${description.length})`);
        }

        if (fields && fields.length > 200) {
          throw new Error(`Maximum 200 fields allowed per datasheet, got ${fields.length}`);
        }

        if (fields) {
          fields.forEach((field, index) => {
            if (!field.name || field.name.trim() === '') {
              throw new Error(`Field at index ${index}: name is required and cannot be empty`);
            }
            if (field.name.length > 100) {
              throw new Error(`Field at index ${index}: name exceeds maximum length of 100 characters (got ${field.name.length})`);
            }
            if (!field.type || field.type.trim() === '') {
              throw new Error(`Field at index ${index} (${field.name}): type is required and cannot be empty`);
            }
          });
        }

        const endpoint = `/spaces/${SPACE_ID}/datasheets`;

        const requestBody: any = { name };
        if (description) requestBody.description = description;
        if (folderId) requestBody.folderId = folderId;
        if (preNodeId) requestBody.preNodeId = preNodeId;
        if (fields) requestBody.fields = fields;

        const result = await aitableFetch<CreateDatasheetResponse>(
          API_TOKEN!,
          endpoint,
          {
            method: "POST",
            body: JSON.stringify(requestBody),
          }
        );

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully created datasheet "${name}" in space ${SPACE_ID}\n\nDatasheet ID: ${result.data?.id}\nCreated at: ${result.data?.createdAt}\nFields created: ${result.data?.fields?.length || 0}\n\n${JSON.stringify(result.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating datasheet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Upload Attachment Tool
  server.tool(
    "upload_attachment",
    "Upload an attachment file to an AITable datasheet. This is STEP 1 of a 2-step process:\n\nSTEP 1: Upload file → Returns token and name\nSTEP 2: Use token+name in create_records or update_records to attach file to a record\n\nRequires absolute file path (e.g., 'C:/Users/Name/file.pdf'). Returns attachment metadata (token, name, size, mimeType, url). The file is NOT attached to any record yet - you must use the returned token and name in the 'fields' parameter of create_records/update_records with format: {\"FieldName\": [{\"token\": \"...\", \"name\": \"...\"}]}",
    {
      datasheetId: z.string().describe("The datasheet ID where the file will eventually be attached"),
      filePath: z.string().describe("Local absolute path to the file to upload (e.g., 'C:/Users/Name/Documents/file.pdf' or '/home/user/file.png')"),
    },
    async ({ datasheetId, filePath }) => {
      try {
        if (!filePath || filePath.trim() === '') {
          throw new Error("File path is required and cannot be empty");
        }

        if (!datasheetId || datasheetId.trim() === '') {
          throw new Error("Datasheet ID is required and cannot be empty");
        }

        const endpoint = `/datasheets/${datasheetId}/attachments`;

        let fileBuffer: Buffer;
        try {
          fileBuffer = readFileSync(filePath);
        } catch (fileError) {
          throw new Error(`Failed to read file at path '${filePath}': ${fileError instanceof Error ? fileError.message : String(fileError)}`);
        }

        const fileName = basename(filePath);
        if (!fileName || fileName.trim() === '') {
          throw new Error(`Invalid file path '${filePath}': cannot extract file name`);
        }

        const fileBlob = new Blob([new Uint8Array(fileBuffer)]);
        const form = new FormData();
        form.append('file', fileBlob, fileName);

        const response = await fetch(`${AITABLE_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
          },
          body: form as any,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json() as AITableResponse<UploadAttachmentResponse>;

        if (!data.success || (data.code !== 200 && data.code !== 201)) {
          throw new Error(`AITable API Error (${data.code}): ${data.message}`);
        }

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully uploaded attachment "${fileName}" to datasheet ${datasheetId}\n\nAttachment Details:\nToken: ${data.data?.token}\nName: ${data.data?.name}\nSize: ${data.data?.size} bytes\nMIME Type: ${data.data?.mimeType}\n${data.data?.width ? `Dimensions: ${data.data.width}x${data.data.height}\n` : ''}URL (valid 2h): ${data.data?.url}\n\n⚠️ NEXT STEP: The file is uploaded but NOT yet attached to any record.\n\nTo attach this file to a record, use create_records or update_records with:\n{\n  "AttachmentFieldName": [\n    {\n      "token": "${data.data?.token}",\n      "name": "${data.data?.name}"\n    }\n  ]\n}\n\nFull response:\n${JSON.stringify(data.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error uploading attachment: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Search Nodes Tool
  server.tool(
    "search_nodes",
    "Search for file nodes in the AITable space based on specific types, permissions, and queries, without considering folder hierarchy. Supports: Folder, Datasheet, Form, Dashboard, Mirror, Automation. Uses Fusion API v2.",
    {
      type: z
        .enum(["Folder", "Datasheet", "Form", "Dashboard", "Mirror"])
        .describe(
          "The type of file node. Values are case-sensitive: 'Folder', 'Datasheet', 'Form', 'Dashboard', 'Mirror'"
        ),
      permissions: z
        .array(z.number().int().min(0).max(3))
        .optional()
        .describe(
          "Permissions filter: 0=Manager, 1=Editor, 2=Update-only, 3=Read-only. Returns nodes matching these permission levels. Defaults to [0,1,2,3] if not provided."
        ),
      query: z
        .string()
        .optional()
        .describe("Search keywords for partial name matching"),
    },
    async ({ type, permissions, query }) => {
      try {
        const params = new URLSearchParams();
        params.append("type", type);

        if (permissions && permissions.length > 0) {
          params.append("permissions", permissions.join(","));
        }

        if (query) {
          params.append("query", query);
        }

        const v2BaseUrl = "https://aitable.ai/fusion/v2";
        const endpoint = `/spaces/${SPACE_ID}/nodes?${params.toString()}`;

        const response = await fetch(`${v2BaseUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json() as AITableResponse<SearchNodesResponse>;

        if (!data.success || data.code !== 200) {
          throw new Error(`AITable API Error (${data.code}): ${data.message}`);
        }

        return {
          content: [
            {
              type: "text",
              text: `✓ Found ${data.data?.nodes?.length || 0} nodes matching type '${type}'\n\nQuery: ${query || "none"}\nPermissions: ${permissions?.join(", ") || "all (0,1,2,3)"}\n\n${JSON.stringify(data.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error searching nodes: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Create Embed Link Tool
  server.tool(
    "create_embed_link",
    "Create an embed link for a specified node (datasheet, dashboard, or form). Returns a URL that can be embedded in other websites. The payload parameter allows customization of the embed UI (toolbars, permissions, etc.). If payload is omitted, defaults to read-only embed.",
    {
      nodeId: z
        .string()
        .describe("The node ID to create an embed link for (datasheet, dashboard, or form)"),
      payload: z
        .record(z.any())
        .optional()
        .describe(
          "Optional configuration for the embed link. Can include: viewControl (viewId, tabBar, toolBar), primarySideBar (collapsed), nodeInfoBar, collaboratorStatusBar, bannerLogo, permissionType (readOnly/publicEdit/privateEdit), theme (light/dark)"
        ),
    },
    async ({ nodeId, payload }) => {
      try {
        const endpoint = `/spaces/${SPACE_ID}/nodes/${nodeId}/embedlinks`;

        const requestBody = payload ? { payload } : {};

        const result = await aitableFetch<CreateEmbedLinkResponse>(
          API_TOKEN!,
          endpoint,
          {
            method: "POST",
            body: JSON.stringify(requestBody),
          }
        );

        return {
          content: [
            {
              type: "text",
              text: `✓ Created embed link for node ${nodeId}\n\nLink ID: ${result.data?.linkId}\nURL: ${result.data?.url}\n\n${JSON.stringify(result.data, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating embed link: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Node Detail Tool
  server.tool(
    "get_node_detail",
    "Get detailed information about a specific node (datasheet, folder, form, dashboard, automation) in the AITable space. If the node is a folder, the response will include the list of child nodes within that folder.",
    {
      nodeId: z
        .string()
        .describe("The node ID to get details for (datasheet/folder/form/dashboard/automation)"),
    },
    async ({ nodeId }) => {
      try {
        const endpoint = `/spaces/${SPACE_ID}/nodes/${nodeId}`;

        const result = await aitableFetch<GetNodeDetailResponse>(API_TOKEN!, endpoint);

        const isFolder = result.data?.type === "Folder";
        const childrenCount = result.data?.children?.length || 0;

        let responseText = `✓ Retrieved details for node ${nodeId}\n\nNode Details:\n`;
        responseText += `- Name: ${result.data?.name}\n`;
        responseText += `- Type: ${result.data?.type}\n`;
        responseText += `- Icon: ${result.data?.icon}\n`;
        responseText += `- Favorite: ${result.data?.isFav ? "Yes" : "No"}\n`;

        if (isFolder && childrenCount > 0) {
          responseText += `- Children: ${childrenCount} item(s)\n`;
        }

        responseText += `\nFull Response:\n${JSON.stringify(result.data, null, 2)}`;

        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting node details: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Embed Links Tool
  server.tool(
    "get_embed_links",
    "Get a list of all embed links for a specified node (datasheet, dashboard, or form). Returns up to 30 embed links. Deleted embed links are not included in the results.",
    {
      nodeId: z
        .string()
        .describe("The node ID to get embed links for (datasheet/dashboard/form)"),
    },
    async ({ nodeId }) => {
      try {
        const endpoint = `/spaces/${SPACE_ID}/nodes/${nodeId}/embedlinks`;

        const response = await fetch(`${AITABLE_BASE_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json() as AITableResponse<any>;

        if (!data.success || data.code !== 200) {
          throw new Error(`AITable API Error (${data.code}): ${data.message}`);
        }

        const embedLinks = Array.isArray(data.data) ? data.data : [];
        const count = embedLinks.length;

        let responseText = `✓ Retrieved ${count} embed link(s) for node ${nodeId}\n\n`;

        if (count > 0) {
          responseText += `Embed Links:\n`;
          embedLinks.forEach((link: any, index: number) => {
            responseText += `\n${index + 1}. Link ID: ${link.linkId}\n`;
            responseText += `   URL: ${link.url}\n`;
            if (link.payload?.permissionType) {
              responseText += `   Permission: ${link.payload.permissionType}\n`;
            }
          });
        } else {
          responseText += `No embed links found for this node.`;
        }

        responseText += `\n\nFull Response:\n${JSON.stringify(data.data, null, 2)}`;

        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting embed links: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Delete Embed Link Tool
  server.tool(
    "delete_embed_link",
    "Delete/disable a specific embed link for a node. After deletion, the embed link will no longer be accessible.",
    {
      nodeId: z
        .string()
        .describe("The node ID containing the embed link to delete"),
      linkId: z
        .string()
        .describe("The embed link ID to delete (e.g., 'embb90a52cfc02a4f83')"),
    },
    async ({ nodeId, linkId }) => {
      try {
        const endpoint = `/spaces/${SPACE_ID}/nodes/${nodeId}/embedlinks/${linkId}`;

        const response = await fetch(`${AITABLE_BASE_URL}${endpoint}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json() as AITableResponse<any>;

        if (!data.success || data.code !== 200) {
          throw new Error(`AITable API Error (${data.code}): ${data.message}`);
        }

        return {
          content: [
            {
              type: "text",
              text: `✓ Successfully deleted embed link\n\nNode ID: ${nodeId}\nLink ID: ${linkId}\n\nThe embed link is now disabled and can no longer be accessed.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting embed link: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // === Formula Resources ===

  const resources = [
    ["formula_overview", "aitable://formulas/overview", "formula-overview.md", "Quick reference guide to AITable formulas"],
    ["formula_operators", "aitable://formulas/operators", "formula-operators.md", "AITable formula operators"],
    ["formula_numeric", "aitable://formulas/numeric", "formula-numeric.md", "AITable numeric functions"],
    ["formula_string", "aitable://formulas/string", "formula-string.md", "AITable string functions"],
    ["formula_logical", "aitable://formulas/logical", "formula-logical.md", "AITable logical functions"],
    ["formula_date", "aitable://formulas/date", "formula-date.md", "AITable date/time functions"],
    ["formula_array", "aitable://formulas/array", "formula-array.md", "AITable array functions"],
    ["field_colors", "aitable://reference/field-colors", "field-colors.md", "AITable field color reference"],
  ];

  resources.forEach(([id, uri, filename, description]) => {
    server.registerResource(
      id as string,
      uri as string,
      {
        description: description as string,
        mimeType: "text/markdown",
      },
      async () => {
        try {
          const filePath = join(process.cwd(), "src", filename as string);
          const content = readFileSync(filePath, "utf-8");

          return {
            contents: [
              {
                uri: uri as string,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        } catch (error) {
          return {
            contents: [
              {
                uri: uri as string,
                mimeType: "text/plain",
                text: `Error loading ${filename}: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }
    );
  });
});

// Export handler for all HTTP methods (GET, POST, DELETE)
export { handler as GET, handler as POST, handler as DELETE };
