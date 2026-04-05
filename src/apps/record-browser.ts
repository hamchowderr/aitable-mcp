import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "AITable Record Browser", version: "1.0.0" });

const contentEl = document.getElementById("content")!;
const titleEl = document.getElementById("title")!;
const statsEl = document.getElementById("stats")!;
const searchEl = document.getElementById("search") as HTMLInputElement;
const paginationEl = document.getElementById("pagination")!;

interface RecordData {
  records: Array<{
    recordId: string;
    createdAt?: number;
    updatedAt?: number;
    fields: Record<string, unknown>;
  }>;
  total?: number;
  pageNum?: number;
  pageSize?: number;
}

let allRecords: RecordData["records"] = [];
let allFields: string[] = [];
let sortColumn = "";
let sortDirection: "asc" | "desc" = "asc";

function parseToolResult(text: string): RecordData | null {
  try {
    // The tool result has a header line then JSON
    const jsonMatch = text.match(/\{[\s\S]*\}$/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Try parsing the whole thing
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  return null;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    if (value.length === 0) return "";
    // Check if it's attachments
    if (value[0]?.name && value[0]?.url) {
      return value.map((a: any) => a.name).join(", ");
    }
    return value.map(v => typeof v === "object" ? JSON.stringify(v) : String(v)).join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function renderTable(records: RecordData["records"], fields: string[]) {
  if (records.length === 0) {
    contentEl.innerHTML = `<div class="empty">No records found</div>`;
    return;
  }

  let html = `<div class="table-container"><table><thead><tr>`;
  html += `<th>#</th>`;
  for (const field of fields) {
    const isSorted = sortColumn === field;
    const indicator = isSorted ? (sortDirection === "asc" ? "\u2191" : "\u2193") : "\u21C5";
    html += `<th class="${isSorted ? "sorted" : ""}" data-field="${escapeHtml(field)}">${escapeHtml(field)} <span class="sort-indicator">${indicator}</span></th>`;
  }
  html += `</tr></thead><tbody>`;

  records.forEach((record, index) => {
    html += `<tr>`;
    html += `<td class="badge">${index + 1}</td>`;
    for (const field of fields) {
      const value = record.fields[field];
      const formatted = formatCellValue(value);
      html += `<td title="${escapeHtml(formatted)}">${escapeHtml(formatted)}</td>`;
    }
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  contentEl.innerHTML = html;

  // Add sort listeners
  contentEl.querySelectorAll("th[data-field]").forEach(th => {
    th.addEventListener("click", () => {
      const field = (th as HTMLElement).dataset.field!;
      if (sortColumn === field) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortColumn = field;
        sortDirection = "asc";
      }
      applyFilterAndSort();
    });
  });
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function applyFilterAndSort() {
  const query = searchEl.value.toLowerCase().trim();
  let filtered = allRecords;

  if (query) {
    filtered = allRecords.filter(record =>
      Object.values(record.fields).some(v => {
        const str = formatCellValue(v).toLowerCase();
        return str.includes(query);
      })
    );
  }

  if (sortColumn) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = formatCellValue(a.fields[sortColumn]);
      const bVal = formatCellValue(b.fields[sortColumn]);
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }

  statsEl.textContent = query
    ? `${filtered.length} of ${allRecords.length} records`
    : `${allRecords.length} records`;

  renderTable(filtered, allFields);
}

function handleData(text: string) {
  const data = parseToolResult(text);
  if (!data || !data.records) {
    contentEl.innerHTML = `<div class="empty">No record data available</div>`;
    return;
  }

  allRecords = data.records;

  // Extract field names from all records
  const fieldSet = new Set<string>();
  for (const record of allRecords) {
    for (const key of Object.keys(record.fields)) {
      fieldSet.add(key);
    }
  }
  allFields = Array.from(fieldSet);

  statsEl.textContent = `${data.total ?? allRecords.length} records | Page ${data.pageNum ?? 1}`;

  if (data.total && data.pageSize && data.total > data.pageSize) {
    const totalPages = Math.ceil(data.total / data.pageSize);
    paginationEl.textContent = `Page ${data.pageNum ?? 1} of ${totalPages} (${data.pageSize} per page)`;
    paginationEl.style.display = "flex";
  }

  applyFilterAndSort();
}

// Handle tool result notifications
app.ontoolresult = (notification: any) => {
  const text = notification.result?.content?.find(
    (c: any) => c.type === "text"
  )?.text;
  if (text) handleData(text);
};

// Handle tool input (initial data)
app.ontoolinput = (notification: any) => {
  const args = notification.arguments;
  if (args?.datasheetId) {
    titleEl.textContent = `Records: ${args.datasheetId}`;
  }
};

// Handle host context changes (theme)
app.onhostcontextchanged = (notification: any) => {
  const theme = notification.context?.theme;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// Search input handler
searchEl.addEventListener("input", () => {
  applyFilterAndSort();
});

// Connect the app
app.connect().then(() => {
  const ctx = app.getHostContext();
  if (ctx?.theme === "dark") {
    document.documentElement.classList.add("dark");
  }
});
