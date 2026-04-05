import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "AITable Attachment Manager", version: "1.0.0" });

const dropZone = document.getElementById("drop-zone")!;
const fileInput = document.getElementById("file-input") as HTMLInputElement;
const fileListEl = document.getElementById("file-list")!;
const statsEl = document.getElementById("stats")!;

interface UploadedFile {
  token: string;
  name: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  url: string;
}

let datasheetId = "";
let uploadedFiles: UploadedFile[] = [];

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

function getFileIcon(mime: string): string {
  if (mime.startsWith("image/")) return "IMG";
  if (mime.startsWith("video/")) return "VID";
  if (mime.startsWith("audio/")) return "AUD";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "XLS";
  if (mime.includes("document") || mime.includes("word")) return "DOC";
  return "FILE";
}

function renderFiles() {
  if (uploadedFiles.length === 0) {
    fileListEl.innerHTML = `<div class="empty">No files uploaded yet. Drop files above or click to browse.</div>`;
    statsEl.textContent = "";
    return;
  }

  statsEl.textContent = `${uploadedFiles.length} file${uploadedFiles.length !== 1 ? "s" : ""} uploaded`;

  let html = "";
  for (const file of uploadedFiles) {
    const isImage = isImageMime(file.mimeType);
    const thumbContent = isImage
      ? `<img src="${escapeHtml(file.url)}" alt="${escapeHtml(file.name)}" />`
      : getFileIcon(file.mimeType);

    const attachJson = JSON.stringify([{ token: file.token, name: file.name }], null, 2);

    html += `
      <div class="file-card">
        <div class="file-thumb">${thumbContent}</div>
        <div class="file-info">
          <div class="name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
          <div class="meta">${formatSize(file.size)} | ${escapeHtml(file.mimeType)}${file.width ? ` | ${file.width}x${file.height}` : ""}</div>
          <div class="file-status done">Uploaded - Ready to attach</div>
          <div class="token-box">
            <button class="copy-btn" data-copy='${escapeHtml(attachJson)}'>Copy</button>
            <strong>Attachment JSON:</strong><br/>${escapeHtml(attachJson)}
          </div>
        </div>
      </div>`;
  }

  fileListEl.innerHTML = html;

  // Copy button handlers
  fileListEl.querySelectorAll<HTMLButtonElement>(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy!);
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 2000);
      } catch {
        btn.textContent = "Failed";
        setTimeout(() => { btn.textContent = "Copy"; }, 2000);
      }
    });
  });
}

// Parse tool result to extract uploaded file info
function parseUploadResult(text: string): UploadedFile | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}$/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.token) return data;
    }
  } catch {}
  try {
    const data = JSON.parse(text);
    if (data.token) return data;
  } catch {}
  return null;
}

// Drop zone events
dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  // Note: In MCP Apps sandboxed iframe, file drops may be limited.
  // The actual upload happens via the server tool with file path.
});

fileInput.addEventListener("change", () => {
  // Note: Actual file upload in MCP Apps happens via server tools
  // The UI shows upload results from tool calls
});

// Handle tool results (upload responses)
app.ontoolresult = (notification) => {
  const text = notification.result?.content?.find((c: any) => c.type === "text")?.text;
  if (text) {
    const file = parseUploadResult(text);
    if (file) {
      uploadedFiles.push(file);
      renderFiles();
    }
  }
};

app.ontoolinput = (notification) => {
  const args = notification.arguments as any;
  if (args?.datasheetId) datasheetId = args.datasheetId;
};

app.onhostcontextchanged = (notification) => {
  if (notification.context?.theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// Initial render
renderFiles();

app.connect().then(() => {
  const ctx = app.getHostContext();
  if (ctx?.theme === "dark") document.documentElement.classList.add("dark");
});
