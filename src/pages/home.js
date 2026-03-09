// ════════════════════════════════════════════════════════════
//  MemViz — Home Page
// ════════════════════════════════════════════════════════════

export function renderHomePage() {
    return `<div class="page">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-grid"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <span style="font-size:14px">⬡</span>
          Visual Programming Lab for CS
        </div>
        <h1 class="hero-title">
          See Your Code<br><span class="gradient">Come Alive</span>
        </h1>
        <p class="hero-subtitle">
          Understand what <em>actually</em> happens inside a computer when your code runs.
          Watch variables, memory, pointers, and data structures form in real-time.
        </p>
        <div class="hero-actions">
          <a href="#/visualizer" class="btn-primary" id="hero-cta">
            ▶ Launch Visualizer
          </a>
          <a href="#/explorer" class="btn-secondary">
            📚 Explore Data Structures
          </a>
        </div>
      </div>

      <!-- Demo Preview -->
      <div class="hero-demo">
        <div class="demo-header">
          <div class="demo-dot r"></div>
          <div class="demo-dot y"></div>
          <div class="demo-dot g"></div>
          <span style="font-family:'Fira Code',monospace;font-size:11px;color:var(--text-muted);margin-left:10px">memviz — live preview</span>
        </div>
        <div class="demo-body">
          <div class="demo-code" id="demo-code-anim">
            <div><span class="ty">int</span> <span class="nm">x</span> = <span class="nm">5</span>;</div>
            <div><span class="ty">int</span> <span class="nm">y</span> = x + <span class="nm">2</span>;</div>
            <div><span class="ty">int</span>* <span class="nm">p</span> = &amp;x;</div>
            <div><span class="cm">// Memory updates live ↗</span></div>
          </div>
          <div class="demo-viz" id="demo-viz-anim"></div>
        </div>
      </div>
    </section>

    <!-- FLOW -->
    <section class="flow-section">
      <h2>How It Works</h2>
      <div class="flow-steps">
        <div class="flow-step">
          <span class="step-num">1</span>
          Write Code
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">
          <span class="step-num">2</span>
          Execution Steps
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">
          <span class="step-num">3</span>
          Memory Visualization
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">
          <span class="step-num">4</span>
          DS Formation
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features-section">
      <div class="section-label">Features</div>
      <h2 class="section-title">Everything You Need to <span style="color:var(--accent)">Understand</span> Code</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon" style="background:rgba(99,102,241,0.15);color:var(--accent)">⚡</div>
          <h3>Live Visualization</h3>
          <p>Every keystroke updates the memory view instantly. No compile step, no waiting — just type and see.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:rgba(46,232,160,0.15);color:var(--green)">🧠</div>
          <h3>Real Memory Zones</h3>
          <p>See stack variables, heap allocations, and function frames just like the actual computer memory model.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:rgba(139,92,246,0.15);color:var(--purple)">🌳</div>
          <h3>14+ Data Structures</h3>
          <p>Arrays, Linked Lists, Stacks, Queues, BSTs, Graphs, HashMaps, Tries, Heaps, Sets, and more.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:rgba(56,189,248,0.15);color:var(--blue)">🔀</div>
          <h3>5 Languages</h3>
          <p>Write in C++, Python, Java, JavaScript, or C# — each with full syntax support and samples.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:rgba(245,197,66,0.15);color:var(--yellow)">⏱</div>
          <h3>Step-by-Step Debug</h3>
          <p>Run, Step, Pause, Reset — control execution line by line. Timeline slider for time-travel debugging.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:rgba(236,72,153,0.15);color:var(--pink)">🤖</div>
          <h3>AI Learning Assistant</h3>
          <p>Get contextual explanations like "Pointer 'p' now references address of variable 'x'" as you code.</p>
        </div>
      </div>
    </section>

    <!-- LANGUAGES -->
    <section class="langs-section">
      <div class="section-label">Supported Languages</div>
      <h2 class="section-title">Write in Your Language</h2>
      <div class="langs-row">
        <div class="lang-card">
          <div class="lang-icon" style="background:rgba(56,212,245,0.15);color:var(--cyan)">⊕</div>
          <span>C++</span>
        </div>
        <div class="lang-card">
          <div class="lang-icon" style="background:rgba(245,197,66,0.15);color:var(--yellow)">🐍</div>
          <span>Python</span>
        </div>
        <div class="lang-card">
          <div class="lang-icon" style="background:rgba(255,107,53,0.15);color:var(--orange)">☕</div>
          <span>Java</span>
        </div>
        <div class="lang-card">
          <div class="lang-icon" style="background:rgba(46,232,160,0.15);color:var(--green)">⬡</div>
          <span>JavaScript</span>
        </div>
        <div class="lang-card">
          <div class="lang-icon" style="background:rgba(139,92,246,0.15);color:var(--purple)">♯</div>
          <span>C#</span>
        </div>
      </div>
    </section>

    <!-- DS GALLERY -->
    <section class="ds-section">
      <div class="section-label">Data Structures</div>
      <h2 class="section-title">Visualize <span style="color:var(--green)">Everything</span></h2>
      <div class="ds-grid">
        ${[
            { emoji: '📦', name: 'Variables', desc: 'int, float, bool, string' },
            { emoji: '📊', name: 'Arrays', desc: 'Indexed elements' },
            { emoji: '🔗', name: 'Linked List', desc: 'Singly linked nodes' },
            { emoji: '⇄', name: 'Doubly Linked List', desc: 'Bidirectional nodes' },
            { emoji: '📚', name: 'Stack', desc: 'LIFO — push/pop' },
            { emoji: '🚶', name: 'Queue', desc: 'FIFO — enqueue/dequeue' },
            { emoji: '🌳', name: 'Binary Search Tree', desc: 'Sorted tree' },
            { emoji: '⛰️', name: 'Heap', desc: 'Min/Max priority' },
            { emoji: '🔤', name: 'Trie', desc: 'Prefix tree' },
            { emoji: '🕸️', name: 'Graph', desc: 'Nodes & edges' },
            { emoji: '🗂️', name: 'HashMap', desc: 'Key → Value pairs' },
            { emoji: '🎯', name: 'Set', desc: 'Unique elements' },
            { emoji: '👆', name: 'Pointers', desc: 'Memory references' },
            { emoji: '📞', name: 'Call Stack', desc: 'Function frames' },
        ].map(ds => `<a href="#/visualizer" class="ds-card">
          <div class="ds-emoji">${ds.emoji}</div>
          <h4>${ds.name}</h4>
          <p>${ds.desc}</p>
        </a>`).join('')}
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <p>MemViz — Visual Programming Lab for Computer Science</p>
      <p style="margin-top:6px"><a href="#/about">About</a> · Built for CS students, DSA learners & educators</p>
    </footer>
  </div>`;
}

export function initHomeAnimations() {
    const demoViz = document.getElementById('demo-viz-anim');
    if (!demoViz) return;

    // Animate demo cards appearing one by one
    const cards = [
        { type: 'int', name: 'x', val: '5', addr: '0x1004', delay: 400 },
        { type: 'int', name: 'y', val: '7', addr: '0x1008', delay: 1200 },
        { type: 'pointer', name: 'p', val: '0x1004', addr: '0x100C', delay: 2000 },
    ];

    cards.forEach(card => {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = `vcard vc-type-${card.type}`;
            el.innerHTML = `
        <div class="vc-badge">${card.type}</div>
        <div class="vc-name">${card.name}</div>
        <div class="vc-val">${card.val}</div>
        <div class="vc-addr">${card.addr}</div>
      `;
            if (demoViz) demoViz.appendChild(el);
        }, card.delay);
    });
}
