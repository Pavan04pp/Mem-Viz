// ════════════════════════════════════════════════════════════
//  MemViz — About Page
// ════════════════════════════════════════════════════════════

export function renderAboutPage() {
    return `<div class="page">
    <div class="about-page">
      <h1>About <span style="color:var(--accent)">MemViz</span></h1>
      <p>MemViz is a <b>Visual Programming Lab</b> — a platform where CS students can see exactly what happens inside a computer when their code runs.</p>
      <p>Instead of <code>write code → get output</code>, students see:</p>
      <p style="color:var(--accent);font-family:'Fira Code',monospace;font-size:15px;text-align:center;padding:16px 0">
        write code → execution steps → memory visualization → data structure formation
      </p>

      <h2>🎯 What Makes This Special</h2>
      <p>Every line of code creates a <b>real-time graphical representation</b> of memory and data structures. Variables become interactive cards, pointers show arrow connections, trees animate node insertions, and stacks visually push & pop.</p>

      <h2>🧠 Concepts You'll Master</h2>
      <div class="about-targets">
        <div class="about-target"><span class="at-icon">📦</span> Stack vs Heap Memory</div>
        <div class="about-target"><span class="at-icon">👆</span> Pointers & References</div>
        <div class="about-target"><span class="at-icon">🔁</span> Recursion & Call Stack</div>
        <div class="about-target"><span class="at-icon">🌳</span> Trees & Graphs</div>
        <div class="about-target"><span class="at-icon">📊</span> Arrays & Linked Lists</div>
        <div class="about-target"><span class="at-icon">🗂️</span> Hash Maps & Sets</div>
        <div class="about-target"><span class="at-icon">⚡</span> Algorithm Visualization</div>
        <div class="about-target"><span class="at-icon">🔤</span> Tries & Heaps</div>
      </div>

      <h2>👥 Built For</h2>
      <div class="about-targets">
        <div class="about-target"><span class="at-icon">🎓</span> CS Students (1st year+)</div>
        <div class="about-target"><span class="at-icon">📖</span> DSA Learners</div>
        <div class="about-target"><span class="at-icon">💻</span> Coding Bootcamps</div>
        <div class="about-target"><span class="at-icon">🏫</span> Universities</div>
        <div class="about-target"><span class="at-icon">👨‍🏫</span> Teachers & Professors</div>
        <div class="about-target"><span class="at-icon">🚀</span> Self-taught Developers</div>
      </div>

      <h2>🛠️ Tech Stack</h2>
      <p>Vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies. Pure browser-native ES modules. Designed to run anywhere.</p>

      <h2>🔮 Vision</h2>
      <p>MemViz aims to become the <b>"Visual Programming Lab for Computer Science"</b> — where students learn memory, pointers, recursion, trees, graphs, and sorting algorithms all through visual execution.</p>
    </div>

    <footer class="footer">
      <p>MemViz — Visual Programming Lab for Computer Science</p>
    </footer>
  </div>`;
}
