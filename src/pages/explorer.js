// ════════════════════════════════════════════════════════════
//  MemViz — Explorer Page (DS Encyclopedia)
// ════════════════════════════════════════════════════════════

export function renderExplorerPage() {
    const categories = [
        {
            title: 'Linear Data Structures',
            titleClass: 'linear',
            items: [
                {
                    icon: '📊', name: 'Array',
                    desc: 'Contiguous block of memory storing elements of the same type. Fast random access, slow insertion/deletion.',
                    complexity: [['Access', 'O(1)', 'good'], ['Search', 'O(n)', 'avg'], ['Insert', 'O(n)', 'bad'], ['Delete', 'O(n)', 'bad']],
                    space: 'O(n)', sample: 'array'
                },
                {
                    icon: '🔗', name: 'Linked List',
                    desc: 'Chain of nodes where each node points to the next. Fast insertion/deletion, slow random access.',
                    complexity: [['Access', 'O(n)', 'bad'], ['Search', 'O(n)', 'avg'], ['Insert', 'O(1)', 'good'], ['Delete', 'O(1)', 'good']],
                    space: 'O(n)', sample: 'll'
                },
                {
                    icon: '⇄', name: 'Doubly Linked List',
                    desc: 'Each node has pointers to both next and previous nodes. Bidirectional traversal.',
                    complexity: [['Access', 'O(n)', 'bad'], ['Search', 'O(n)', 'avg'], ['Insert', 'O(1)', 'good'], ['Delete', 'O(1)', 'good']],
                    space: 'O(n)', sample: 'dll'
                },
                {
                    icon: '📚', name: 'Stack',
                    desc: 'Last-In-First-Out (LIFO) structure. Think of a stack of plates — you can only add/remove from the top.',
                    complexity: [['Push', 'O(1)', 'good'], ['Pop', 'O(1)', 'good'], ['Peek', 'O(1)', 'good'], ['Search', 'O(n)', 'avg']],
                    space: 'O(n)', sample: 'stack'
                },
                {
                    icon: '🚶', name: 'Queue',
                    desc: 'First-In-First-Out (FIFO) structure. Like a line of people — first in, first served.',
                    complexity: [['Enqueue', 'O(1)', 'good'], ['Dequeue', 'O(1)', 'good'], ['Peek', 'O(1)', 'good'], ['Search', 'O(n)', 'avg']],
                    space: 'O(n)', sample: 'queue'
                },
            ]
        },
        {
            title: 'Tree Data Structures',
            titleClass: 'tree-cat',
            items: [
                {
                    icon: '🌳', name: 'Binary Search Tree',
                    desc: 'Hierarchical structure where left child < parent < right child. Enables efficient searching and sorting.',
                    complexity: [['Search', 'O(log n)', 'good'], ['Insert', 'O(log n)', 'good'], ['Delete', 'O(log n)', 'good'], ['Worst', 'O(n)', 'bad']],
                    space: 'O(n)', sample: 'bst'
                },
                {
                    icon: '⛰️', name: 'Heap (Priority Queue)',
                    desc: 'Complete binary tree where parent is always ≤ (min-heap) or ≥ (max-heap) its children. Used for priority queues.',
                    complexity: [['Insert', 'O(log n)', 'good'], ['Extract', 'O(log n)', 'good'], ['Peek', 'O(1)', 'good'], ['Search', 'O(n)', 'avg']],
                    space: 'O(n)', sample: 'heap'
                },
                {
                    icon: '🔤', name: 'Trie (Prefix Tree)',
                    desc: 'Tree for storing strings where each path from root represents a prefix. Blazing fast for autocomplete and spell-check.',
                    complexity: [['Insert', 'O(m)', 'good'], ['Search', 'O(m)', 'good'], ['Delete', 'O(m)', 'good'], ['Prefix', 'O(m)', 'good']],
                    space: 'O(n×m)', sample: 'trie'
                },
            ]
        },
        {
            title: 'Graph Data Structures',
            titleClass: 'graph-cat',
            items: [
                {
                    icon: '🕸️', name: 'Graph',
                    desc: 'Collection of nodes (vertices) connected by edges. Models relationships like social networks, maps, and dependencies.',
                    complexity: [['Add Node', 'O(1)', 'good'], ['Add Edge', 'O(1)', 'good'], ['BFS/DFS', 'O(V+E)', 'avg'], ['Space', 'O(V+E)', 'avg']],
                    space: 'O(V+E)', sample: 'graph'
                },
            ]
        },
        {
            title: 'Hash-Based Data Structures',
            titleClass: 'hash-cat',
            items: [
                {
                    icon: '🗂️', name: 'HashMap / Dictionary',
                    desc: 'Key-value store with near-instant lookups. Uses hash function to compute indices into a bucket array.',
                    complexity: [['Get', 'O(1) avg', 'good'], ['Set', 'O(1) avg', 'good'], ['Delete', 'O(1) avg', 'good'], ['Worst', 'O(n)', 'bad']],
                    space: 'O(n)', sample: 'hashmap'
                },
                {
                    icon: '🎯', name: 'Set',
                    desc: 'Collection of unique elements. No duplicates allowed. Fast membership testing.',
                    complexity: [['Add', 'O(1) avg', 'good'], ['Remove', 'O(1) avg', 'good'], ['Contains', 'O(1) avg', 'good'], ['Worst', 'O(n)', 'bad']],
                    space: 'O(n)', sample: 'set'
                },
            ]
        },
    ];

    return `<div class="page">
    <div class="explorer-page">
      <h1>Data Structure Explorer</h1>
      <p class="explorer-subtitle">Interactive encyclopedia with complexity analysis. Click "Try it" to see any data structure in action.</p>

      ${categories.map(cat => `
        <div class="ds-category">
          <div class="ds-category-title ${cat.titleClass}">${cat.title}</div>
          <div class="ds-exp-grid">
            ${cat.items.map(ds => `
              <div class="ds-exp-card">
                <h3>${ds.icon} ${ds.name}</h3>
                <p class="ds-desc">${ds.desc}</p>
                <table class="complexity-table">
                  <thead><tr><th>Operation</th><th>Time</th></tr></thead>
                  <tbody>
                    ${ds.complexity.map(([op, time, cls]) => `<tr><td>${op}</td><td class="${cls}">${time}</td></tr>`).join('')}
                  </tbody>
                </table>
                <div style="display:flex;align-items:center;gap:10px;">
                  <button class="try-btn" data-sample="${ds.sample}">▶ Try it</button>
                  <span style="font-family:'Fira Code',monospace;font-size:10px;color:var(--text-muted)">Space: ${ds.space}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <footer class="footer">
      <p>MemViz — Visual Programming Lab</p>
    </footer>
  </div>`;
}

export function initExplorer() {
    document.querySelectorAll('.try-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sample = btn.dataset.sample;
            window.location.hash = '#/visualizer?sample=' + sample;
        });
    });
}
