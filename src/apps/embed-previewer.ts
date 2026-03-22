import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "AITable Embed Previewer", version: "1.0.0" });

const contentEl = document.getElementById("content")!;
const statsEl = document.getElementById("stats")!;
const feedbackEl = document.getElementById("feedback")!;

interface EmbedLink {
  linkId: string;
  url: string;
  payload?: {
    permissionType?: string;
    theme?: string;
    [key: string]: any;
  };
}

let allEmbedLinks: EmbedLink[] = [];
let nodeId = "";

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

function renderEmbedLinks(links: EmbedLink[]) {
  let html = "";

  if (links.length === 0) {
    html += `<div class="empty">No embed links found for this node.</div>`;
  } else {
    html += `<div class="embed-list">`;
    for (const link of links) {
      const perm = link.payload?.permissionType || "readOnly";
      const theme = link.payload?.theme || "light";
      html += `
        <div class="embed-card" data-link-id="${escapeHtml(link.linkId)}">
          <div class="embed-header">
            <span class="link-id">${escapeHtml(link.linkId)}</span>
            <div class="actions">
              <button class="btn-sm preview-toggle" data-link-id="${escapeHtml(link.linkId)}">Preview</button>
              <button class="btn-sm copy-btn" data-url="${escapeHtml(link.url)}">Copy URL</button>
              <button class="btn-sm danger delete-btn" data-link-id="${escapeHtml(link.linkId)}">Delete</button>
            </div>
          </div>
          <div class="embed-url">${escapeHtml(link.url)}</div>
          <div class="embed-meta">
            <span class="meta-badge">${escapeHtml(perm)}</span>
            <span class="meta-badge">${escapeHtml(theme)} theme</span>
          </div>
          <iframe class="preview-frame" id="frame-${escapeHtml(link.linkId)}" src="${escapeHtml(link.url)}" sandbox="allow-scripts allow-same-origin" loading="lazy"></iframe>
        </div>`;
    }
    html += `</div>`;
  }

  // Create section
  html += `
    <div class="create-section">
      <h3>Create New Embed Link</h3>
      <div class="create-row">
        <div class="form-group">
          <label>Permission</label>
          <select id="new-permission">
            <option value="readOnly">Read Only</option>
            <option value="publicEdit">Public Edit</option>
            <option value="privateEdit">Private Edit</option>
          </select>
        </div>
        <div class="form-group">
          <label>Theme</label>
          <select id="new-theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <button class="btn btn-primary" id="create-embed-btn">Create</button>
      </div>
    </div>`;

  contentEl.innerHTML = html;
  statsEl.textContent = `${links.length} embed link${links.length !== 1 ? "s" : ""}`;

  // Preview toggle handlers
  contentEl.querySelectorAll<HTMLButtonElement>(".preview-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const frame = document.getElementById(`frame-${btn.dataset.linkId}`) as HTMLIFrameElement;
      frame.classList.toggle("visible");
      btn.textContent = frame.classList.contains("visible") ? "Hide" : "Preview";
    });
  });

  // Copy URL handlers
  contentEl.querySelectorAll<HTMLButtonElement>(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.url!);
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "Copy URL"; btn.classList.remove("copied"); }, 2000);
      } catch {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = btn.dataset.url!;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = "Copy URL"; }, 2000);
      }
    });
  });

  // Delete handlers
  contentEl.querySelectorAll<HTMLButtonElement>(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const linkId = btn.dataset.linkId!;
      if (btn.classList.contains("confirm")) {
        btn.disabled = true;
        btn.textContent = "Deleting...";
        try {
          await app.callServerTool({
            name: "delete_embed_link",
            arguments: { nodeId, linkId },
          });
          btn.closest(".embed-card")?.remove();
          allEmbedLinks = allEmbedLinks.filter(l => l.linkId !== linkId);
          statsEl.textContent = `${allEmbedLinks.length} embed link${allEmbedLinks.length !== 1 ? "s" : ""}`;
          showFeedback(`Deleted embed link ${linkId}`, "success");
        } catch (error: any) {
          showFeedback(`Error: ${error.message || String(error)}`, "error");
          btn.disabled = false;
          btn.textContent = "Delete";
          btn.classList.remove("confirm");
        }
      } else {
        btn.classList.add("confirm");
        btn.textContent = "Confirm?";
        setTimeout(() => {
          if (btn.classList.contains("confirm")) {
            btn.classList.remove("confirm");
            btn.textContent = "Delete";
          }
        }, 3000);
      }
    });
  });

  // Create embed handler
  document.getElementById("create-embed-btn")?.addEventListener("click", async () => {
    const permission = (document.getElementById("new-permission") as HTMLSelectElement).value;
    const theme = (document.getElementById("new-theme") as HTMLSelectElement).value;
    const btn = document.getElementById("create-embed-btn") as HTMLButtonElement;

    btn.disabled = true;
    btn.textContent = "Creating...";

    try {
      const result = await app.callServerTool({
        name: "create_embed_link",
        arguments: {
          nodeId,
          payload: { permissionType: permission, theme },
        },
      });
      showFeedback("Embed link created successfully!", "success");
    } catch (error: any) {
      showFeedback(`Error: ${error.message || String(error)}`, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Create";
    }
  });
}

function parseToolResult(text: string): any {
  try {
    const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})$/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  try { return JSON.parse(text); } catch {}
  return null;
}

app.ontoolresult = (notification) => {
  const text = notification.result?.content?.find((c: any) => c.type === "text")?.text;
  if (text) {
    const data = parseToolResult(text);
    if (Array.isArray(data)) {
      allEmbedLinks = data;
    } else if (data?.embedLinks) {
      allEmbedLinks = data.embedLinks;
    } else if (data) {
      allEmbedLinks = [data];
    }
    renderEmbedLinks(allEmbedLinks);
  }
};

app.ontoolinput = (notification) => {
  const args = notification.arguments as any;
  if (args?.nodeId) nodeId = args.nodeId;
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
