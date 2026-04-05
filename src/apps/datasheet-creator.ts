import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "AITable Datasheet Creator", version: "1.0.0" });

const fieldsContainer = document.getElementById("fields-container")!;
const addFieldBtn = document.getElementById("add-field-btn")!;
const previewBtn = document.getElementById("preview-btn")!;
const previewEl = document.getElementById("preview")!;
const feedbackEl = document.getElementById("feedback")!;
const fieldCounterEl = document.getElementById("field-counter")!;

const FIELD_TYPES = [
  "SingleText", "Text", "Number", "Currency", "Percent",
  "DateTime", "Checkbox", "Rating", "SingleSelect", "MultiSelect",
  "URL", "Email", "Phone",
];

let fieldCount = 0;

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function addFieldRow(name = "", type = "SingleText") {
  fieldCount++;
  const row = document.createElement("div");
  row.className = "field-row";
  row.dataset.index = String(fieldCount);

  let typeOptions = FIELD_TYPES.map(t =>
    `<option value="${t}" ${t === type ? "selected" : ""}>${t}</option>`
  ).join("");

  row.innerHTML = `
    <span class="field-num">${fieldCount}</span>
    <input type="text" placeholder="Field name" value="${escapeHtml(name)}" class="field-name" maxlength="100" />
    <select class="field-type">${typeOptions}</select>
    <button type="button" class="remove-btn" title="Remove field">&times;</button>
  `;

  row.querySelector(".remove-btn")!.addEventListener("click", () => {
    row.remove();
    updateFieldNumbers();
  });

  fieldsContainer.appendChild(row);
  updateFieldNumbers();
}

function updateFieldNumbers() {
  const rows = fieldsContainer.querySelectorAll(".field-row");
  rows.forEach((row, i) => {
    row.querySelector(".field-num")!.textContent = String(i + 1);
  });
  fieldCounterEl.textContent = `${rows.length} field${rows.length !== 1 ? "s" : ""} ${rows.length === 0 ? "(leave empty for 3 defaults)" : ""}`;
}

function collectData() {
  const name = (document.getElementById("ds-name") as HTMLInputElement).value.trim();
  const description = (document.getElementById("ds-description") as HTMLTextAreaElement).value.trim();

  const fields: Array<{ type: string; name: string; property: Record<string, any> }> = [];
  fieldsContainer.querySelectorAll(".field-row").forEach(row => {
    const fieldName = (row.querySelector(".field-name") as HTMLInputElement).value.trim();
    const fieldType = (row.querySelector(".field-type") as HTMLSelectElement).value;
    if (fieldName) {
      fields.push({ type: fieldType, name: fieldName, property: {} });
    }
  });

  return { name, description, fields };
}

addFieldBtn.addEventListener("click", () => addFieldRow());

previewBtn.addEventListener("click", () => {
  const data = collectData();
  const payload: any = { name: data.name };
  if (data.description) payload.description = data.description;
  if (data.fields.length > 0) payload.fields = data.fields;
  previewEl.textContent = JSON.stringify(payload, null, 2);
  previewEl.style.display = previewEl.style.display === "none" ? "block" : "none";
});

document.getElementById("datasheet-form")!.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("submit-btn") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "Creating...";
  feedbackEl.className = "feedback";
  feedbackEl.style.display = "none";

  try {
    const data = collectData();
    if (!data.name) throw new Error("Datasheet name is required");

    const args: any = { name: data.name };
    if (data.description) args.description = data.description;
    if (data.fields.length > 0) args.fields = data.fields;

    const result = await app.callServerTool({
      name: "create_datasheet",
      arguments: args,
    });

    const text = result.content?.find((c: any) => c.type === "text")?.text || "";
    feedbackEl.textContent = `Datasheet created successfully! ${text.includes("Datasheet ID:") ? text.match(/Datasheet ID: (\S+)/)?.[0] || "" : ""}`;
    feedbackEl.className = "feedback success";
  } catch (error: any) {
    feedbackEl.textContent = `Error: ${error.message || String(error)}`;
    feedbackEl.className = "feedback error";
  } finally {
    btn.disabled = false;
    btn.textContent = "Create Datasheet";
  }
});

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
