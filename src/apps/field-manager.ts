import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "AITable Field Manager", version: "1.0.0" });

const contentEl = document.getElementById("content")!;
const statsEl = document.getElementById("stats")!;
const searchEl = document.getElementById("search") as HTMLInputElement;
const feedbackEl = document.getElementById("feedback")!;

interface FieldItem {
  id: string;
  name: string;
  type: string;
  desc?: string;
  isPrimary?: boolean;
  editable?: boolean;
  property?: Record<string, any>;
}

let allFields: FieldItem[] = [];
let datasheetId = "";

const TYPE_ICONS: Record<string, string> = {
  SingleText: "Aa", Text: "T", Number: "#", Currency: "$",
  Percent: "%", DateTime: "D", Checkbox: "V", Rating: "R",
  SingleSelect: "1", MultiSelect: "M", URL: "@", Email: "E",
  Phone: "P", Attachment: "F", AutoNumber: "N", CreatedTime: "C",
  LastModifiedTime: "U", CreatedBy: "C", LastModifiedBy: "U",
  MagicLink: "L", MagicLookUp: "K", Formula: "f", Member: "M",
};

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showFeedback(message: string, type: "success" | "error") {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${type}`;
  setTimeout(() => { feedbackEl.className = "feedback"; feedbackEl.style.display = "none"; }, 4000);
}

function renderFields(fields: FieldItem[]) {
  if (fields.length === 0) {
    contentEl.innerHTML = `<div class="empty">No fields found</div>`;
    return;
  }

  let html = `<div class="field-list">`;
  for (const field of fields) {
    const icon = TYPE_ICONS[field.type] || "?";
    html += `
      <div class="field-card" data-id="${escapeHtml(field.id)}">
        <div class="field-icon">${icon}</div>
        <div class="field-info">
          <div class="name">${escapeHtml(field.name)}</div>
          <div class="meta">ID: ${escapeHtml(field.id)}${field.desc ? ` | ${escapeHtml(field.desc)}` : ""}</div>
        </div>
        <span class="type-badge">${escapeHtml(field.type)}</span>
        ${field.isPrimary ? '<span class="type-badge primary-badge">Primary</span>' : ""}
        ${!field.isPrimary ? `<button class="delete-btn" data-field-id="${escapeHtml(field.id)}" data-field-name="${escapeHtml(field.name)}">Delete</button>` : ""}
      </div>`;
  }
  html += `</div>`;

  // Create field section
  html += `
    <div class="create-section">
      <h3>Create New Field</h3>
      <div class="create-row">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="new-field-name" placeholder="Field name" maxlength="100" />
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="new-field-type">
            <option value="SingleText">SingleText</option>
            <option value="Text">Text</option>
            <option value="Number">Number</option>
            <option value="Currency">Currency</option>
            <option value="Percent">Percent</option>
            <option value="DateTime">DateTime</option>
            <option value="Checkbox">Checkbox</option>
            <option value="Rating">Rating</option>
            <option value="SingleSelect">SingleSelect</option>
            <option value="MultiSelect">MultiSelect</option>
            <option value="URL">URL</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
          </select>
        </div>
        <button class="btn btn-primary" id="create-field-btn">Create</button>
      </div>
    </div>`;

  contentEl.innerHTML = html;

  // Delete button handlers
  contentEl.querySelectorAll<HTMLButtonElement>(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const fieldId = btn.dataset.fieldId!;
      const fieldName = btn.dataset.fieldName!;

      if (btn.classList.contains("confirm")) {
        btn.disabled = true;
        btn.textContent = "Deleting...";
        try {
          await app.callServerTool({
            name: "delete_field",
            arguments: { datasheetId, fieldId },
          });
          btn.closest(".field-card")?.remove();
          allFields = allFields.filter(f => f.id !== fieldId);
          statsEl.textContent = `${allFields.length} fields`;
          showFeedback(`Deleted field "${fieldName}"`, "success");
        } catch (error: any) {
          showFeedback(`Error: ${error.message || String(error)}`, "error");
          btn.disabled = false;
          btn.textContent = "Delete";
          btn.classList.remove("confirm");
        }
      } else {
        btn.classList.add("confirm");
        btn.textContent = `Confirm delete "${fieldName}"?`;
        setTimeout(() => {
          if (btn.classList.contains("confirm")) {
            btn.classList.remove("confirm");
            btn.textContent = "Delete";
          }
        }, 3000);
      }
    });
  });

  // Create field handler
  document.getElementById("create-field-btn")?.addEventListener("click", async () => {
    const nameEl = document.getElementById("new-field-name") as HTMLInputElement;
    const typeEl = document.getElementById("new-field-type") as HTMLSelectElement;
    const name = nameEl.value.trim();
    const type = typeEl.value;

    if (!name) { showFeedback("Field name is required", "error"); return; }

    const btn = document.getElementById("create-field-btn") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = "Creating...";

    try {
      await app.callServerTool({
        name: "create_field",
        arguments: { datasheetId, type, name, property: {} },
      });
      showFeedback(`Created field "${name}" (${type})`, "success");
      nameEl.value = "";
    } catch (error: any) {
      showFeedback(`Error: ${error.message || String(error)}`, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Create";
    }
  });
}

function applyFilter() {
  const query = searchEl.value.toLowerCase().trim();
  const filtered = query
    ? allFields.filter(f => f.name.toLowerCase().includes(query) || f.type.toLowerCase().includes(query) || f.id.toLowerCase().includes(query))
    : allFields;
  renderFields(filtered);
}

function parseToolResult(text: string): { fields: FieldItem[] } | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}$/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  try { return JSON.parse(text); } catch {}
  return null;
}

app.ontoolresult = (notification) => {
  const text = notification.result?.content?.find((c: any) => c.type === "text")?.text;
  if (text) {
    const data = parseToolResult(text);
    if (data?.fields) {
      allFields = data.fields;
      statsEl.textContent = `${allFields.length} fields`;
      applyFilter();
    }
  }
};

app.ontoolinput = (notification) => {
  const args = notification.arguments as any;
  if (args?.datasheetId) datasheetId = args.datasheetId;
};

searchEl.addEventListener("input", () => applyFilter());

app.onhostcontextchanged = (notification) => {
  if (notification.context?.theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

app.connect().then(() => {
  const ctx = app.getHostContext();
  if (ctx?.theme === "dark") document.documentElement.classList.add("dark");
});
