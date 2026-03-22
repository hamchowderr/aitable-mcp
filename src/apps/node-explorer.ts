import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "AITable Node Explorer", version: "1.0.0" });

const treePanelEl = document.getElementById("tree-panel")!;
const detailPanelEl = document.getElementById("detail-panel")!;
const detailTitleEl = document.getElementById("detail-title")!;
const detailContentEl = document.getElementById("detail-content")!;
const breadcrumbEl = document.getElementById("breadcrumb")!;
const searchEl = document.getElementById("search") as HTMLInputElement;

interface NodeItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  isFav: boolean;
  children?: NodeItem[];
}

const TYPE_ICONS: Record<string, string> = {
  Datasheet: "📊", Folder: "📁", Form: "📝", Dashboard: "📈",
  Mirror: "🪞", Automation: "⚡",
};

let rootNodes: NodeItem[] = [];
let expandedFolders = new Set<string>();
let selectedNodeId = "";
let childrenCache = new Map<string, NodeItem[]>();

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTree(nodes: NodeItem[], container: HTMLElement, depth = 0) {
  let html = "";

  for (const node of nodes) {
    const isFolder = node.type === "Folder";
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const icon = node.icon || TYPE_ICONS[node.type] || "📄";

    html += `<div class="tree-item${isSelected ? " selected" : ""}" data-id="${escapeHtml(node.id)}" data-type="${escapeHtml(node.type)}">`;
    html += `<span class="expand-btn ${isFolder ? (isExpanded ? "expanded" : "") : "hidden"}">▶</span>`;
    html += `<span class="icon">${icon}</span>`;
    html += `<span class="name">${escapeHtml(node.name)}</span>`;
    if (node.isFav) html += `<span class="fav">★</span>`;
    html += `<span class="type-badge">${escapeHtml(node.type)}</span>`;
    html += `</div>`;

    if (isFolder) {
      const children = childrenCache.get(node.id);
      html += `<div class="tree-children${isExpanded ? "" : " collapsed"}" data-parent="${escapeHtml(node.id)}">`;
      if (isExpanded && children) {
        for (const child of children) {
          const cIcon = child.icon || TYPE_ICONS[child.type] || "📄";
          const cIsFolder = child.type === "Folder";
          const cIsExpanded = expandedFolders.has(child.id);
          const cIsSelected = selectedNodeId === child.id;

          html += `<div class="tree-item${cIsSelected ? " selected" : ""}" data-id="${escapeHtml(child.id)}" data-type="${escapeHtml(child.type)}">`;
          html += `<span class="expand-btn ${cIsFolder ? (cIsExpanded ? "expanded" : "") : "hidden"}">▶</span>`;
          html += `<span class="icon">${cIcon}</span>`;
          html += `<span class="name">${escapeHtml(child.name)}</span>`;
          if (child.isFav) html += `<span class="fav">★</span>`;
          html += `<span class="type-badge">${escapeHtml(child.type)}</span>`;
          html += `</div>`;

          if (cIsFolder) {
            const subChildren = childrenCache.get(child.id);
            html += `<div class="tree-children${cIsExpanded ? "" : " collapsed"}" data-parent="${escapeHtml(child.id)}">`;
            if (cIsExpanded && subChildren) {
              for (const sc of subChildren) {
                const scIcon = sc.icon || TYPE_ICONS[sc.type] || "📄";
                const scIsSelected = selectedNodeId === sc.id;
                html += `<div class="tree-item${scIsSelected ? " selected" : ""}" data-id="${escapeHtml(sc.id)}" data-type="${escapeHtml(sc.type)}">`;
                html += `<span class="expand-btn hidden">▶</span>`;
                html += `<span class="icon">${scIcon}</span>`;
                html += `<span class="name">${escapeHtml(sc.name)}</span>`;
                if (sc.isFav) html += `<span class="fav">★</span>`;
                html += `<span class="type-badge">${escapeHtml(sc.type)}</span>`;
                html += `</div>`;
              }
            } else if (cIsExpanded) {
              html += `<div class="loading-inline">Loading...</div>`;
            }
            html += `</div>`;
          }
        }
      } else if (isExpanded) {
        html += `<div class="loading-inline">Loading...</div>`;
      }
      html += `</div>`;
    }
  }

  container.innerHTML = `<div class="tree-list">${html}</div>`;

  // Attach click handlers
  container.querySelectorAll<HTMLElement>(".tree-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = item.dataset.id!;
      const type = item.dataset.type!;

      // Select node
      selectedNodeId = id;
      showDetail(id, type, item.querySelector(".name")?.textContent || "");

      if (type === "Folder") {
        toggleFolder(id);
      }

      renderTreeView();
    });
  });
}

function showDetail(id: string, type: string, name: string) {
  detailPanelEl.classList.add("visible");
  detailTitleEl.textContent = name;

  let html = "";
  html += `<div class="detail-row"><div class="label">ID</div><div class="value">${escapeHtml(id)}</div></div>`;
  html += `<div class="detail-row"><div class="label">Type</div><div class="value">${escapeHtml(type)}</div></div>`;

  // Find the node to get more info
  const node = findNode(id, rootNodes);
  if (node) {
    html += `<div class="detail-row"><div class="label">Favorite</div><div class="value">${node.isFav ? "Yes ★" : "No"}</div></div>`;
    if (node.icon) {
      html += `<div class="detail-row"><div class="label">Icon</div><div class="value">${node.icon}</div></div>`;
    }
  }

  detailContentEl.innerHTML = html;
}

function findNode(id: string, nodes: NodeItem[]): NodeItem | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const cached = childrenCache.get(node.id);
    if (cached) {
      const found = findNode(id, cached);
      if (found) return found;
    }
  }
  return null;
}

async function toggleFolder(id: string) {
  if (expandedFolders.has(id)) {
    expandedFolders.delete(id);
  } else {
    expandedFolders.add(id);
    if (!childrenCache.has(id)) {
      try {
        const result = await app.callServerTool({
          name: "get_node_detail",
          arguments: { nodeId: id },
        });
        const text = (result.content?.find((c: any) => c.type === "text") as any)?.text;
        if (text) {
          const data = parseResult(text);
          if (data?.children) {
            // children can be array of arrays
            const flatChildren = Array.isArray(data.children[0])
              ? data.children.flat()
              : data.children;
            childrenCache.set(id, flatChildren);
          } else {
            childrenCache.set(id, []);
          }
        }
      } catch {
        childrenCache.set(id, []);
      }
    }
  }
  renderTreeView();
}

function renderTreeView() {
  const query = searchEl.value.toLowerCase().trim();
  let nodes = rootNodes;
  if (query) {
    nodes = filterNodes(rootNodes, query);
  }
  renderTree(nodes, treePanelEl);
}

function filterNodes(nodes: NodeItem[], query: string): NodeItem[] {
  return nodes.filter(n =>
    n.name.toLowerCase().includes(query) ||
    n.type.toLowerCase().includes(query) ||
    n.id.toLowerCase().includes(query)
  );
}

function parseResult(text: string): any {
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
    const data = parseResult(text);
    if (data?.nodes) {
      rootNodes = data.nodes;
      renderTreeView();
    }
  }
};

searchEl.addEventListener("input", () => renderTreeView());

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
