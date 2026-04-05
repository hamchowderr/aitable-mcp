import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "AITable Space Overview", version: "1.0.0" });

const contentEl = document.getElementById("content")!;
const titleEl = document.getElementById("title")!;
const statsBarEl = document.getElementById("stats-bar")!;
const searchEl = document.getElementById("search") as HTMLInputElement;

interface NodeItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  isFav: boolean;
}

let allNodes: NodeItem[] = [];

const TYPE_ICONS: Record<string, string> = {
  Datasheet: "\uD83D\uDCCA",
  Folder: "\uD83D\uDCC1",
  Form: "\uD83D\uDCDD",
  Dashboard: "\uD83D\uDCC8",
  Mirror: "\uD83E\uDE9E",
  Automation: "\u26A1",
};

function parseToolResult(text: string): { nodes: NodeItem[] } | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}$/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  return null;
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderStats(nodes: NodeItem[]) {
  const typeCounts: Record<string, number> = {};
  for (const node of nodes) {
    typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
  }

  let html = `<div class="stat-card"><div class="number">${nodes.length}</div><div class="label">Total Nodes</div></div>`;
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    html += `<div class="stat-card"><div class="number">${count}</div><div class="label">${escapeHtml(type)}s</div></div>`;
  }

  statsBarEl.innerHTML = html;
  statsBarEl.style.display = "flex";
}

function renderNodes(nodes: NodeItem[]) {
  if (nodes.length === 0) {
    contentEl.innerHTML = `<div class="empty">No nodes found</div>`;
    return;
  }

  let html = `<div class="node-grid">`;
  for (const node of nodes) {
    const icon = node.icon || TYPE_ICONS[node.type] || "\uD83D\uDCC4";
    html += `
      <div class="node-card${node.isFav ? " fav" : ""}">
        <div class="icon">${icon}</div>
        <div class="name" title="${escapeHtml(node.name)}">${escapeHtml(node.name)}</div>
        <span class="type-badge">${escapeHtml(node.type)}</span>
        <div class="meta">ID: ${escapeHtml(node.id)}</div>
      </div>`;
  }
  html += `</div>`;
  contentEl.innerHTML = html;
}

function applyFilter() {
  const query = searchEl.value.toLowerCase().trim();
  const filtered = query
    ? allNodes.filter(n => n.name.toLowerCase().includes(query) || n.type.toLowerCase().includes(query) || n.id.toLowerCase().includes(query))
    : allNodes;
  renderNodes(filtered);
}

function handleData(text: string) {
  const data = parseToolResult(text);
  if (!data || !data.nodes) {
    contentEl.innerHTML = `<div class="empty">No space data available</div>`;
    return;
  }

  allNodes = data.nodes;
  renderStats(allNodes);
  applyFilter();
}

app.ontoolresult = (notification) => {
  const text = notification.result?.content?.find(
    (c: any) => c.type === "text"
  )?.text;
  if (text) handleData(text);
};

app.onhostcontextchanged = (notification) => {
  const theme = notification.context?.theme;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

searchEl.addEventListener("input", () => {
  applyFilter();
});

app.connect().then(() => {
  const ctx = app.getHostContext();
  if (ctx?.theme === "dark") {
    document.documentElement.classList.add("dark");
  }
});
