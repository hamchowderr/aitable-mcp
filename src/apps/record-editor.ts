import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "AITable Record Editor", version: "1.0.0" });

const contentEl = document.getElementById("content")!;
const titleEl = document.getElementById("title")!;
const modeBadgeEl = document.getElementById("mode-badge")!;
const feedbackEl = document.getElementById("feedback")!;

interface FieldMeta {
  id: string;
  name: string;
  type: string;
  property?: Record<string, any>;
}

interface ToolData {
  fields?: FieldMeta[];
  record?: { recordId: string; fields: Record<string, unknown> };
  datasheetId?: string;
  mode?: "create" | "edit";
}

let currentData: ToolData = {};

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getInputForField(field: FieldMeta, value: unknown): string {
  const id = `field-${field.id}`;
  const val = value !== null && value !== undefined ? String(value) : "";

  switch (field.type) {
    case "Number":
    case "Currency":
    case "Percent":
    case "Rating":
    case "AutoNumber":
      return `<input type="number" id="${id}" data-field="${escapeHtml(field.name)}" value="${escapeHtml(val)}" step="any" placeholder="Enter number..." />`;

    case "Checkbox":
      const checked = value ? "checked" : "";
      return `<div class="checkbox-wrapper"><input type="checkbox" id="${id}" data-field="${escapeHtml(field.name)}" ${checked} /><span>Enabled</span></div>`;

    case "DateTime":
    case "CreatedTime":
    case "LastModifiedTime":
      return `<input type="datetime-local" id="${id}" data-field="${escapeHtml(field.name)}" value="${escapeHtml(val)}" />`;

    case "SingleSelect": {
      const options = field.property?.options || [];
      let html = `<select id="${id}" data-field="${escapeHtml(field.name)}"><option value="">-- Select --</option>`;
      for (const opt of options) {
        const selected = val === opt.name ? "selected" : "";
        html += `<option value="${escapeHtml(opt.name)}" ${selected}>${escapeHtml(opt.name)}</option>`;
      }
      html += `</select>`;
      return html;
    }

    case "MultiSelect": {
      const options = field.property?.options || [];
      const selectedValues = Array.isArray(value) ? value : [];
      let html = `<div class="multi-select-group" id="${id}" data-field="${escapeHtml(field.name)}">`;
      for (const opt of options) {
        const checked = selectedValues.includes(opt.name) ? "checked" : "";
        html += `<label><input type="checkbox" value="${escapeHtml(opt.name)}" ${checked} /><span>${escapeHtml(opt.name)}</span></label>`;
      }
      html += `</div>`;
      return html;
    }

    case "Text":
    case "URL":
    case "Email":
    case "Phone":
      return `<textarea id="${id}" data-field="${escapeHtml(field.name)}" placeholder="Enter ${field.type.toLowerCase()}...">${escapeHtml(val)}</textarea>`;

    default:
      return `<input type="text" id="${id}" data-field="${escapeHtml(field.name)}" value="${escapeHtml(val)}" placeholder="Enter value..." />`;
  }
}

function renderForm(data: ToolData) {
  const fields = data.fields || [];
  const record = data.record;
  const isEdit = data.mode === "edit" && record;

  if (isEdit) {
    modeBadgeEl.textContent = "Edit";
    modeBadgeEl.className = "mode-badge edit";
    titleEl.textContent = `Edit Record`;
  } else {
    modeBadgeEl.textContent = "Create";
    modeBadgeEl.className = "mode-badge create";
    titleEl.textContent = "New Record";
  }

  if (fields.length === 0) {
    contentEl.innerHTML = `<div class="loading">No fields available. The tool will provide field metadata.</div>`;
    return;
  }

  let html = `<form id="record-form">`;
  for (const field of fields) {
    // Skip auto-generated fields in create mode
    if (!isEdit && ["AutoNumber", "CreatedTime", "LastModifiedTime", "CreatedBy", "LastModifiedBy"].includes(field.type)) {
      continue;
    }

    const value = isEdit && record ? record.fields[field.name] : undefined;
    html += `<div class="form-group">`;
    html += `<label>${escapeHtml(field.name)} <span class="field-type">(${escapeHtml(field.type)})</span></label>`;
    html += getInputForField(field, value);
    html += `</div>`;
  }
  html += `<div class="actions">`;
  html += `<button type="submit" class="btn btn-primary" id="submit-btn">${isEdit ? "Update Record" : "Create Record"}</button>`;
  html += `</div>`;
  html += `</form>`;

  contentEl.innerHTML = html;

  document.getElementById("record-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSubmit(data);
  });
}

function collectFormValues(fields: FieldMeta[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const field of fields) {
    const id = `field-${field.id}`;
    const el = document.getElementById(id);
    if (!el) continue;

    switch (field.type) {
      case "Checkbox":
        values[field.name] = (el as HTMLInputElement).checked;
        break;
      case "Number":
      case "Currency":
      case "Percent":
      case "Rating": {
        const v = (el as HTMLInputElement).value;
        if (v !== "") values[field.name] = parseFloat(v);
        break;
      }
      case "MultiSelect": {
        const checked = el.querySelectorAll<HTMLInputElement>("input:checked");
        const selected = Array.from(checked).map(c => c.value);
        if (selected.length > 0) values[field.name] = selected;
        break;
      }
      default: {
        const v = (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
        if (v !== "") values[field.name] = v;
        break;
      }
    }
  }

  return values;
}

async function handleSubmit(data: ToolData) {
  const btn = document.getElementById("submit-btn") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "Saving...";
  feedbackEl.className = "feedback";
  feedbackEl.style.display = "none";

  try {
    const fields = collectFormValues(data.fields || []);
    const isEdit = data.mode === "edit" && data.record;

    let result;
    if (isEdit) {
      result = await app.callServerTool({
        name: "update_records",
        arguments: {
          datasheetId: data.datasheetId,
          records: [{ recordId: data.record!.recordId, fields }],
        },
      });
    } else {
      result = await app.callServerTool({
        name: "create_records",
        arguments: {
          datasheetId: data.datasheetId,
          records: [{ fields }],
        },
      });
    }

    feedbackEl.textContent = isEdit ? "Record updated successfully!" : "Record created successfully!";
    feedbackEl.className = "feedback success";
  } catch (error: any) {
    feedbackEl.textContent = `Error: ${error.message || String(error)}`;
    feedbackEl.className = "feedback error";
  } finally {
    btn.disabled = false;
    btn.textContent = data.mode === "edit" ? "Update Record" : "Create Record";
  }
}

function parseToolResult(text: string): ToolData | null {
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
    if (data) {
      currentData = { ...currentData, ...data };
      renderForm(currentData);
    }
  }
};

app.ontoolinput = (notification) => {
  const args = notification.arguments as any;
  if (args) {
    currentData.datasheetId = args.datasheetId;
    if (args.recordId) {
      currentData.mode = "edit";
    }
  }
};

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
