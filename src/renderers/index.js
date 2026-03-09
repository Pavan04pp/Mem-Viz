// ════════════════════════════════════════════════════════════
//  MemViz — Master Renderer
//  Renders all data structures into HTML
// ════════════════════════════════════════════════════════════

function esc(s) {
    if (s === null || s === undefined) return 'null';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function zone(cls, title, content) {
    return `<div class="zone ${cls}"><div class="zone-title">${esc(title)}</div>${content}</div>`;
}

// ── AI Explanation Generator ──
export function generateExplanation(state, prevState) {
    const explanations = [];
    if (!prevState) {
        if (state.steps.length > 0) {
            const last = state.steps[state.steps.length - 1];
            if (last.action === 'CREATE_VAR') {
                explanations.push(`Variable <b>'${last.detail.name}'</b> created in <b>stack memory</b>. Value <b>${last.detail.value}</b> is assigned at address <b>${last.detail.addr}</b>.`);
            }
        }
        return explanations.join(' ');
    }

    // Compare states
    state.vars.forEach(v => {
        const p = prevState.vars?.find(x => x.name === v.name);
        if (!p) explanations.push(`Variable <b>'${v.name}'</b> (${v.type}) created in stack memory with value <b>${v.value}</b>.`);
        else if (String(p.value) !== String(v.value)) explanations.push(`Variable <b>'${v.name}'</b> updated: ${p.value} → <b>${v.value}</b>.`);
    });
    if (state.pointers.length > (prevState.pointers?.length || 0)) {
        const p = state.pointers[state.pointers.length - 1];
        explanations.push(`Pointer <b>'${p.name}'</b> now references the address of variable <b>${p.pointsTo || 'nullptr'}</b>.`);
    }
    if (state.arrays.length > (prevState.arrays?.length || 0)) {
        const a = state.arrays[state.arrays.length - 1];
        explanations.push(`Array <b>'${a.name}'</b> allocated with ${a.values.length} elements in contiguous memory.`);
    }
    const curCS = state.callStack.length, prevCS = prevState.callStack?.length || 0;
    if (curCS > prevCS) {
        explanations.push(`Function <b>${state.callStack[curCS - 1].name}</b> called — new stack frame pushed.`);
    }
    if (state.trees.length > 0 && state.trees[0].nodes.length > (prevState.trees?.[0]?.nodes?.length || 0)) {
        explanations.push(`Node inserted into BST. Tree maintains sorted property.`);
    }
    if (state.stacks.length > 0) {
        const curS = state.stacks[0]?.items?.length || 0;
        const prevS = prevState.stacks?.[0]?.items?.length || 0;
        if (curS > prevS) explanations.push(`Value <b>${state.stacks[0].items[curS - 1]}</b> pushed onto stack. LIFO order maintained.`);
        else if (curS < prevS) explanations.push(`Top element popped from stack. LIFO order maintained.`);
    }
    if (state.queues.length > 0) {
        const curQ = state.queues[0]?.items?.length || 0;
        const prevQ = prevState.queues?.[0]?.items?.length || 0;
        if (curQ > prevQ) explanations.push(`Value enqueued at rear. FIFO order maintained.`);
        else if (curQ < prevQ) explanations.push(`Front element dequeued. FIFO order maintained.`);
    }

    return explanations.length ? explanations[explanations.length - 1] : 'Visualization updated. Watch memory changes in real-time as you type.';
}

// ── Variable Card ──
function renderVarCard(v) {
    const tc = 'vc-type-' + (v.jsType || 'auto');
    let val = v.value;
    if (val === null) val = 'null';
    else if (val === true) val = 'true';
    else if (val === false) val = 'false';
    return `<div class="vcard ${tc}" title="${esc(v.name)}: ${esc(String(val))}">
    <div class="vc-badge">${esc(v.type || v.jsType || 'auto')}</div>
    <div class="vc-name">${esc(v.name)}</div>
    <div class="vc-val">${esc(String(val))}</div>
    <div class="vc-addr">${esc(v.addr)}</div>
  </div>`;
}

// ── Pointer Card ──
function renderPtrCard(p, vars) {
    const tv = vars.find(v => v.name === p.pointsTo);
    return `<div class="ptr-card">
    <div class="vc-badge" style="color:var(--orange);opacity:.7">pointer</div>
    <div class="vc-name">${esc(p.name)}</div>
    <div class="vc-val" style="font-size:13px">${esc(p.value)}</div>
    <div class="ptr-target">
      <svg width="16" height="10"><line x1="0" y1="5" x2="12" y2="5" stroke="#ff6b35" stroke-width="1.5"/><polyline points="9,2 12,5 9,8" fill="none" stroke="#ff6b35" stroke-width="1.5"/></svg>
      ${esc(p.pointsTo || 'nullptr')}${tv ? ' = ' + esc(String(tv.value)) : ''}
    </div>
    <div class="vc-addr">${esc(p.addr)}</div>
  </div>`;
}

// ── Array ──
function renderArray(a) {
    return `<div class="arr-block">
    <div class="arr-name">${esc(a.name)}[${a.values.length}] — ${esc(a.type)}</div>
    <div class="arr-row">${a.values.map((v, i) => `<div class="arr-cell">${esc(String(v))}<span class="arr-idx">[${i}]</span></div>`).join('')}</div>
  </div>`;
}

// ── Linked List ──
function renderLinkedList(ll) {
    if (!ll.nodes.length) return '';
    const ordered = [];
    const visited = new Set();
    let cur = ll.nodes.find(n => n.id === ll.head) || ll.nodes[0];
    while (cur && !visited.has(cur.id)) {
        ordered.push(cur);
        visited.add(cur.id);
        cur = cur.next ? ll.nodes.find(n => n.id === cur.next) : null;
    }
    ll.nodes.forEach(n => { if (!visited.has(n.id)) ordered.push(n); });
    return `<div class="ll-row">
    ${ordered.map((node, i) => {
        const hasNext = node.next && ll.nodes.find(n => n.id === node.next);
        return `<div class="ll-node">
        <div class="ll-val">${esc(String(node.val))}</div>
        <div class="ll-ptr">${hasNext ? '→next' : 'NULL'}</div>
      </div>${i < ordered.length - 1 ? '<div class="ll-arrow">→</div>' : ''}`;
    }).join('')}
    <div class="ll-null">→ NULL</div>
  </div>`;
}

// ── Doubly Linked List ──
function renderDoublyLinkedList(dll) {
    if (!dll.nodes.length) return '';
    const ordered = [];
    const visited = new Set();
    let cur = dll.nodes.find(n => n.id === dll.head) || dll.nodes[0];
    while (cur && !visited.has(cur.id)) {
        ordered.push(cur);
        visited.add(cur.id);
        cur = cur.next ? dll.nodes.find(n => n.id === cur.next) : null;
    }
    dll.nodes.forEach(n => { if (!visited.has(n.id)) ordered.push(n); });
    return `<div class="ll-row">
    <div class="ll-null">NULL ←</div>
    ${ordered.map((node, i) => {
        return `<div class="dll-node">
        <div class="dll-prev">←</div>
        <div class="dll-val">${esc(String(node.val))}</div>
        <div class="dll-next">→</div>
      </div>${i < ordered.length - 1 ? '<div class="dll-arrow">⇄</div>' : ''}`;
    }).join('')}
    <div class="ll-null">→ NULL</div>
  </div>`;
}

// ── Stack DS ──
function renderStackDS(s) {
    if (!s.items.length) return `<div style="font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted)">${esc(s.name)} (empty)</div>`;
    return `<div class="sds-outer">
    <div class="sds-top-lbl">${esc(s.name)} — top</div>
    <div class="sds-items">${[...s.items].reverse().map(v => `<div class="sds-item">${esc(String(v))}</div>`).join('')}</div>
    <div class="sds-bot-lbl">bottom</div>
  </div>`;
}

// ── Queue DS ──
function renderQueueDS(q) {
    if (!q.items.length) return `<div style="font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted)">${esc(q.name)} (empty)</div>`;
    return `<div style="margin-bottom:8px">
    <div style="font-family:'Fira Code',monospace;font-size:10px;color:var(--green);margin-bottom:5px">${esc(q.name)}</div>
    <div class="qds-row">
      <span class="qds-lbl">front→</span>
      <div class="qds-items">${q.items.map(v => `<div class="qds-item">${esc(String(v))}</div>`).join('')}</div>
      <span class="qds-lbl">←rear</span>
    </div>
  </div>`;
}

// ── Tree ──
function renderTree(tree) {
    if (!tree.nodes.length) return `<div style="font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted)">Empty tree</div>`;
    const pos = {};
    let xc = 0;
    function inorder(id, d) {
        if (!id) return;
        const node = tree.nodes.find(n => n.id === id);
        if (!node) return;
        inorder(node.left, d + 1);
        pos[id] = { x: xc++, y: d };
        inorder(node.right, d + 1);
    }
    inorder(tree.root, 0);
    tree.nodes.forEach(n => { if (pos[n.id] === undefined) pos[n.id] = { x: xc++, y: 0 }; });

    const pw = 58, ph = 70, r = 21, pad = 30;
    const maxX = Math.max(...Object.values(pos).map(p => p.x));
    const maxY = Math.max(...Object.values(pos).map(p => p.y));
    const W = (maxX + 1) * pw + pad * 2, H = (maxY + 1) * ph + pad * 2;
    const cx = id => pos[id].x * pw + pw / 2 + pad;
    const cy = id => pos[id].y * ph + ph / 2 + pad;

    let svg = `<div class="tree-scroll"><svg width="${W}" height="${H}" style="overflow:visible">`;
    tree.nodes.forEach(n => {
        if (n.left && pos[n.left]) svg += `<line class="te" x1="${cx(n.id)}" y1="${cy(n.id)}" x2="${cx(n.left)}" y2="${cy(n.left)}"/>`;
        if (n.right && pos[n.right]) svg += `<line class="te" x1="${cx(n.id)}" y1="${cy(n.id)}" x2="${cx(n.right)}" y2="${cy(n.right)}"/>`;
    });
    tree.nodes.forEach(n => {
        if (!pos[n.id]) return;
        svg += `<circle class="tn" cx="${cx(n.id)}" cy="${cy(n.id)}" r="${r}"/>`;
        svg += `<text class="tn-lbl" x="${cx(n.id)}" y="${cy(n.id)}">${esc(String(n.val))}</text>`;
    });
    return svg + `</svg></div>`;
}

// ── Graph ──
function renderGraph(g) {
    if (!g.nodes.length) return `<div style="font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted)">Empty graph</div>`;
    const n = g.nodes.length;
    const R_lay = Math.max(70, n * 22);
    const cx = 160 + R_lay, cy = 100 + R_lay;
    const W = cx * 2, H = cy * 2;
    const nodePos = {};
    g.nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i / n) - Math.PI / 2;
        nodePos[String(node.id)] = { x: cx + R_lay * Math.cos(angle), y: cy + R_lay * Math.sin(angle) };
    });
    const arrowId = 'arr' + Math.random().toString(36).slice(2, 7);
    let svg = `<div class="graph-scroll"><svg width="${W}" height="${H}">`;
    if (g.directed) svg += `<defs><marker id="${arrowId}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" class="ge-arrow"/></marker></defs>`;
    g.edges.forEach(e => {
        const fp = nodePos[String(e.from)], tp = nodePos[String(e.to)];
        if (!fp || !tp) return;
        svg += `<line class="ge" x1="${fp.x}" y1="${fp.y}" x2="${tp.x}" y2="${tp.y}" ${g.directed ? `marker-end="url(#${arrowId})"` : ''}/>`;
    });
    g.nodes.forEach(node => {
        const p = nodePos[String(node.id)];
        if (!p) return;
        svg += `<circle class="gn" cx="${p.x}" cy="${p.y}" r="22"/>`;
        svg += `<text class="gn-lbl" x="${p.x}" y="${p.y}">${esc(String(node.label || node.id))}</text>`;
    });
    return svg + `</svg></div>`;
}

// ── HashMap ──
function renderMap(m) {
    if (!m.entries.length) return `<div style="font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted)">${esc(m.name)} (empty)</div>`;
    return `<div style="margin-bottom:4px">
    <div style="font-family:'Fira Code',monospace;font-size:10px;color:var(--yellow);margin-bottom:7px">${esc(m.name)}</div>
    <div class="map-grid">${m.entries.map(e => `<div class="map-entry">
      <div class="me-key">${esc(String(e.key))}</div>
      <div class="me-sep">→</div>
      <div class="me-val">${esc(String(e.val))}</div>
    </div>`).join('')}</div>
  </div>`;
}

// ── Set ──
function renderSet(s) {
    if (!s.items.length) return `<div style="font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted)">${esc(s.name)} (empty)</div>`;
    return `<div style="margin-bottom:4px">
    <div style="font-family:'Fira Code',monospace;font-size:10px;color:var(--pink);margin-bottom:7px">${esc(s.name)}</div>
    <div class="set-grid">${s.items.map(v => `<div class="set-item">${esc(String(v))}</div>`).join('')}</div>
  </div>`;
}

// ── Heap ──
function renderHeap(h) {
    if (!h.items.length) return `<div style="font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted)">${esc(h.name)} (empty)</div>`;
    // Tree view
    const treeData = { nodes: [], root: null };
    h.items.forEach((v, i) => {
        const id = 'h' + i;
        treeData.nodes.push({ id, val: v, left: (2 * i + 1 < h.items.length) ? 'h' + (2 * i + 1) : null, right: (2 * i + 2 < h.items.length) ? 'h' + (2 * i + 2) : null });
        if (i === 0) treeData.root = id;
    });
    const treeHTML = renderTree(treeData);
    // Array view
    const arrHTML = `<div class="heap-array">${h.items.map((v, i) => {
        const maxVal = Math.max(...h.items.map(Math.abs), 1);
        const height = Math.max(20, (Math.abs(v) / maxVal) * 60);
        return `<div class="heap-bar" style="height:${height}px">${esc(String(v))}</div>`;
    }).join('')}</div>`;
    return `<div>
    <div style="font-family:'Fira Code',monospace;font-size:10px;color:var(--accent);margin-bottom:5px">${esc(h.name)} (${h.type}-heap)</div>
    ${treeHTML}${arrHTML}
  </div>`;
}

// ── Trie ──
function renderTrie(t) {
    if (!t.words.length) return `<div style="font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted)">${esc(t.name)} (empty)</div>`;
    // Build flat node list from trie root
    const nodes = [];
    const edges = [];
    let nodeId = 0;
    function traverse(node, parentId) {
        const myId = nodeId++;
        nodes.push({ id: myId, char: node.char || '⊙', isEnd: node.isEnd });
        if (parentId !== null) edges.push({ from: parentId, to: myId });
        for (const ch of Object.keys(node.children).sort()) {
            traverse(node.children[ch], myId);
        }
    }
    traverse(t.root, null);

    // Simple tree layout
    const pos = {};
    let xc = 0;
    function layoutInorder(id) {
        const ch = edges.filter(e => e.from === id).map(e => e.to);
        if (ch.length === 0) { pos[id] = { x: xc++, y: getDepth(id) }; return; }
        ch.forEach(c => layoutInorder(c));
        const xs = ch.map(c => pos[c].x);
        pos[id] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: getDepth(id) };
    }
    function getDepth(id) {
        let d = 0, cur = id;
        while (true) {
            const parent = edges.find(e => e.to === cur);
            if (!parent) break;
            cur = parent.from; d++;
        }
        return d;
    }
    layoutInorder(0);

    const pw = 42, ph = 55, r = 16, pad = 25;
    const maxX = Math.max(...Object.values(pos).map(p => p.x));
    const maxY = Math.max(...Object.values(pos).map(p => p.y));
    const W = (maxX + 1) * pw + pad * 2, H = (maxY + 1) * ph + pad * 2;
    const getX = id => pos[id].x * pw + pw / 2 + pad;
    const getY = id => pos[id].y * ph + ph / 2 + pad;

    let svg = `<div class="tree-scroll"><svg width="${W}" height="${H}" style="overflow:visible">`;
    edges.forEach(e => svg += `<line class="trie-e" x1="${getX(e.from)}" y1="${getY(e.from)}" x2="${getX(e.to)}" y2="${getY(e.to)}"/>`);
    nodes.forEach(n => {
        svg += `<circle class="trie-n${n.isEnd ? ' end-node' : ''}" cx="${getX(n.id)}" cy="${getY(n.id)}" r="${r}"/>`;
        svg += `<text class="trie-lbl" x="${getX(n.id)}" y="${getY(n.id)}">${esc(n.char)}</text>`;
    });
    svg += `</svg></div>`;
    svg += `<div style="font-family:'Fira Code',monospace;font-size:10px;color:var(--text-muted);margin-top:6px">Words: ${t.words.map(w => `<span style="color:var(--blue)">"${esc(w)}"</span>`).join(', ')}</div>`;
    return svg;
}

// ── Master Render ──
export function renderState(state) {
    let html = '';

    // Call Stack
    if (state.callStack.length > 0) {
        html += zone('z-stack', 'Call Stack',
            `<div class="cstack-col">${state.callStack.map((f, i) => {
                const active = i === state.callStack.length - 1;
                return `<div class="cframe ${active ? 'cf-active' : 'cf-inactive'}">
          <div class="cf-name">▸ ${esc(f.name)}</div>
          <div class="cf-ret">${esc(f.returnType || 'auto')} → return</div>
          ${f.params.map(p => `<div class="cf-var">${esc(p)} = <b>param</b></div>`).join('')}
          ${(f.vars || []).map(([k, v]) => `<div class="cf-var">${esc(k)} = <b>${esc(String(v))}</b></div>`).join('')}
        </div>`;
            }).reverse().join('')}</div>`
        );
    }

    // Stack Memory
    const stackVars = state.vars.filter(v => !v.scope || v.scope === 'stack' || !v.scope.startsWith('frame'));
    if (stackVars.length > 0 || state.pointers.length > 0) {
        html += zone('z-stack', 'Stack Memory',
            `<div class="cards-row">${stackVars.map(v => renderVarCard(v)).join('')}${state.pointers.map(p => renderPtrCard(p, state.vars)).join('')}</div>`
        );
    }

    // Arrays
    if (state.arrays.length > 0) {
        html += zone('z-stack', 'Arrays', state.arrays.map(a => renderArray(a)).join(''));
    }

    // Linked Lists (heap)
    if (state.linkedLists.length > 0 && state.linkedLists[0].nodes.length > 0) {
        html += zone('z-heap', 'Heap — Linked List', state.linkedLists.map(ll => renderLinkedList(ll)).join(''));
    }

    // Doubly Linked Lists
    if (state.doublyLinkedLists.length > 0 && state.doublyLinkedLists[0].nodes.length > 0) {
        html += zone('z-heap', 'Heap — Doubly Linked List', state.doublyLinkedLists.map(dll => renderDoublyLinkedList(dll)).join(''));
    }

    // Stacks
    if (state.stacks.length > 0) {
        html += zone('z-ds', 'Stack (LIFO)', state.stacks.map(s => renderStackDS(s)).join('<div style="width:20px"></div>'));
    }

    // Queues
    if (state.queues.length > 0) {
        html += zone('z-ds', 'Queue (FIFO)', state.queues.map(q => renderQueueDS(q)).join(''));
    }

    // Trees
    if (state.trees.length > 0) {
        html += zone('z-heap', 'Binary Search Tree', state.trees.map(t => renderTree(t)).join(''));
    }

    // Heaps
    if (state.heaps.length > 0) {
        html += zone('z-ds', 'Heap / Priority Queue', state.heaps.map(h => renderHeap(h)).join(''));
    }

    // Tries
    if (state.tries.length > 0) {
        html += zone('z-ds', 'Trie (Prefix Tree)', state.tries.map(t => renderTrie(t)).join(''));
    }

    // Graphs
    if (state.graphs.length > 0) {
        html += zone('z-graph', 'Graph', state.graphs.map(g => renderGraph(g)).join(''));
    }

    // Maps
    if (state.maps.length > 0) {
        html += zone('z-map', 'HashMap / Dictionary', state.maps.map(m => renderMap(m)).join(''));
    }

    // Sets
    if (state.sets.length > 0) {
        html += zone('z-map', 'Set (Unique Elements)', state.sets.map(s => renderSet(s)).join(''));
    }

    if (!html) {
        html = `<div class="empty-state"><div class="es-icon">◈</div><div class="es-txt">Start typing code<br>visualization updates live</div></div>`;
    }

    return html;
}
