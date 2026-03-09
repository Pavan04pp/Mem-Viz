// ════════════════════════════════════════════════════════════
//  MemViz — Visualizer Page
//  Clean, stable implementation: editor, gutter, compile/run,
//  console output capture (heuristic), visualization area, samples.
// ════════════════════════════════════════════════════════════

import { parseCode } from '../engine/parser.js';
import { SAMPLES } from '../engine/samples.js';
import { renderState, generateExplanation } from '../renderers/index.js';

const LANGS = [
    { id: 'cpp', label: 'C++' },
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'csharp', label: 'C#' },
];

const SAMPLE_KEYS = [
    { key: 'vars', label: 'Variables' },
    { key: 'array', label: 'Array' },
    { key: 'pointer', label: 'Pointer' },
    { key: 'll', label: 'Linked List' },
    { key: 'dll', label: 'Doubly LL' },
    { key: 'stack', label: 'Stack' },
    { key: 'queue', label: 'Queue' },
    { key: 'bst', label: 'BST' },
    { key: 'heap', label: 'Heap' },
    { key: 'trie', label: 'Trie' },
    { key: 'graph', label: 'Graph' },
    { key: 'hashmap', label: 'HashMap' },
    { key: 'set', label: 'Set' },
    { key: 'callstack', label: 'Call Stack' },
    { key: 'complex', label: 'Complex' },
];

export function renderVisualizerPage() {
    const langOptions = LANGS.map(l => `<option value="${l.id}">${l.label}</option>`).join('');
    const sampleBtns = SAMPLE_KEYS.map(s => `<button class="sb" data-sample="${s.key}">${s.label}</button>`).join('');

    return `
<div class="ide-page">
    <div class="ide-window">
        <div class="ide-titlebar" style="height:48px;align-items:center;">
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;color:#e6e6ff;font-size:15px;">MemViz Visualizer</div>
            <div style="flex:1"></div>
            <select class="ide-lang-select" id="lang-select">${langOptions}</select>
            <button class="tb-btn compile-btn" id="compile-btn" style="margin-left:8px;">▶ Run</button>
            <button class="tb-btn" id="play-steps-btn" style="margin-left:6px;" disabled>Play Steps</button>
            <button class="tb-btn" id="clear-btn" style="margin-left:6px;">Clear</button>
        </div>

        <div class="ide-body">
            <div class="ide-left">
                    <div class="editor-area">
                                    <div class="line-gutter" id="line-gutter"></div>
                                    <div id="monaco-editor" style="flex:1;height:100%;width:100%"></div>
                                                            <textarea class="code-input" id="code-input" spellcheck="false" placeholder="// Write or paste code here..."></textarea>
                                </div>

                <div class="output-panel">
                    <div class="output-bar">
                        <span class="output-bar-title">Console</span>
                        <span class="output-bar-badge" id="output-badge"></span>
                    </div>
                    <div class="output-scroll" id="output-scroll"></div>
                </div>
            </div>

            <div class="ide-right">
                <div class="viz-bar">
                    <span class="viz-bar-title">Memory Visualizer</span>
                </div>
                <div class="viz-scroll" id="viz-scroll">
                    <div class="empty-state">
                        <div class="es-icon">◈</div>
                        <div class="es-txt">Start typing code or pick a sample below<br>visualization updates live</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="samples-bar">
            <span class="sl">Samples ▸</span>
            ${sampleBtns}
        </div>
    </div>
</div>`;
}

export function initVisualizer() {
    const codeInput = document.getElementById('code-input');
    const lineGutter = document.getElementById('line-gutter');
    const langSelect = document.getElementById('lang-select');
    const compileBtn = document.getElementById('compile-btn');
    const playBtn = document.getElementById('play-steps-btn');
    const clearBtn = document.getElementById('clear-btn');
    const outputScroll = document.getElementById('output-scroll');
    const outputBadge = document.getElementById('output-badge');
    const vizScroll = document.getElementById('viz-scroll');

    if (!codeInput) return;

    let prevState = null;
    let activeSample = null;
    let debounceTimer = null;
    let lastSteps = [];
    let monacoEditor = null;

    // Monaco loader + helpers
    function ensureMonaco() {
        return new Promise(resolve => {
            if (window.monaco && window.monaco.editor) {
                if (!window.monacoEditor) {
                    window.monacoEditor = monaco.editor.create(document.getElementById('monaco-editor'), { value: codeInput.value || '', language: 'cpp', theme: 'vs-dark', automaticLayout: true });
                    window.monacoEditor.getModel().onDidChangeContent(() => onCodeChange());
                }
                monacoEditor = window.monacoEditor;
                resolve(monacoEditor);
                return;
            }
            const loader = document.createElement('script');
            loader.src = 'https://unpkg.com/monaco-editor@0.41.0/min/vs/loader.js';
            loader.onload = () => {
                try {
                    // eslint-disable-next-line no-undef
                    require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.41.0/min/vs' } });
                    // eslint-disable-next-line no-undef
                    require(['vs/editor/editor.main'], () => {
                        try {
                            monacoEditor = monaco.editor.create(document.getElementById('monaco-editor'), { value: codeInput.value || '', language: 'cpp', theme: 'vs-dark', automaticLayout: true });
                            window.monacoEditor = monacoEditor;
                            monacoEditor.getModel().onDidChangeContent(() => onCodeChange());
                            // hide the textarea fallback when Monaco is active
                            try { codeInput.style.display = 'none'; } catch (e) {}
                            // focus editor for immediate typing experience
                            try { monacoEditor.focus(); } catch (e) {}
                            resolve(monacoEditor);
                        } catch (e) { console.warn('monaco create failed', e); resolve(null); }
                    });
                } catch (e) { console.warn('monaco loader failed', e); resolve(null); }
            };
            loader.onerror = () => resolve(null);
            document.body.appendChild(loader);
        });
    }

    function getCode() { return (monacoEditor && monacoEditor.getValue) ? monacoEditor.getValue() : codeInput.value; }
    function setCode(v) { if (monacoEditor && monacoEditor.setValue) monacoEditor.setValue(v); else codeInput.value = v; }

    // ── Pyodide (in-browser Python) loader for realtime execution ─────────────────
    async function ensurePyodide() {
        if (window.pyodide) return window.pyodide;
        return new Promise((resolve) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
            s.onload = async () => {
                try {
                    // eslint-disable-next-line no-undef
                    window.pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/' });
                    resolve(window.pyodide);
                } catch (e) { console.warn('pyodide init failed', e); resolve(null); }
            };
            s.onerror = () => resolve(null);
            document.head.appendChild(s);
        });
    }

    function updateGutter(errorLines) {
        const lines = (getCode() || '').split('\n');
        const errSet = new Set((errorLines || []).map(e => e.line));
        let html = '';
        for (let i = 1; i <= lines.length; i++) {
            const cls = errSet.has(i) ? ' error-ln' : '';
            html += `<span class="ln${cls}">${i}</span>`;
        }
        lineGutter.innerHTML = html;
    }

    codeInput.addEventListener('scroll', () => { lineGutter.scrollTop = codeInput.scrollTop; });

    function clearOutput() {
        outputScroll.innerHTML = '';
        outputBadge.className = 'output-bar-badge';
        outputBadge.textContent = '';
    }

    function appendOutput(html, cls) {
        const el = document.createElement('div');
        el.className = 'out-line ' + (cls || '');
        el.innerHTML = html;
        outputScroll.appendChild(el);
        outputScroll.scrollTop = outputScroll.scrollHeight;
    }

    function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function stripQuotes(s) { s = s.trim(); if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1); return s; }
    function parseCoutChain(raw) { return raw.split('<<').map(s => s.trim()).filter(s => s && s !== 'endl').map(s => stripQuotes(s)).join(''); }

    function captureOutputLines(code, lang) {
        const lines = code.split('\n');
        lines.forEach(line => {
            const t = line.trim();
            let m;
            m = t.match(/cout\s*<<\s*(.+?)(?:\s*<<\s*endl)?\s*;?$/);
            if (m) { appendOutput(`<span class="out-stdout">[stdout] ${escHtml(parseCoutChain(m[1]))}</span>`); return; }
            m = t.match(/^print\s*\((.+)\)\s*$/);
            if (m) { appendOutput(`<span class="out-stdout">[stdout] ${escHtml(stripQuotes(m[1]))}</span>`); return; }
            m = t.match(/System\.out\.println?\s*\((.+)\)\s*;?$/);
            if (m) { appendOutput(`<span class="out-stdout">[stdout] ${escHtml(stripQuotes(m[1]))}</span>`); return; }
            m = t.match(/console\.log\s*\((.+)\)\s*;?$/);
            if (m) { appendOutput(`<span class="out-stdout">[stdout] ${escHtml(stripQuotes(m[1]))}</span>`); return; }
            m = t.match(/Console\.WriteLine?\s*\((.+)\)\s*;?$/);
            if (m) { appendOutput(`<span class="out-stdout">[stdout] ${escHtml(stripQuotes(m[1]))}</span>`); return; }
        });
    }

    async function compile() {
        const code = getCode() || '';
        clearOutput();
        if (!code.trim()) {
            vizScroll.innerHTML = `<div class="empty-state"><div class="es-icon">◈</div><div class="es-txt">Start typing code or pick a sample below<br>visualization updates live</div></div>`;
            updateGutter([]);
            return;
        }

        appendOutput(`<span class="out-prompt">$</span> Compiling...`, 'out-info');
        const lang = langSelect.value;
            // Basic language guard: only support C/C++ (cpp), Python, Java for now
            const supported = ['cpp', 'python', 'java'];
            if (!supported.includes(lang)) {
                appendOutput(`<span class="out-err">Error: Language '${lang}' is not supported for execution yet. Select C++, Python, or Java.</span>`, 'out-err');
                outputBadge.className = 'output-bar-badge badge-err';
                outputBadge.textContent = 'Unsupported';
                return;
            }

            const state = parseCode(code, lang);

        if (state.errors && state.errors.length) {
            updateGutter(state.errors);
            outputBadge.className = 'output-bar-badge badge-err';
            outputBadge.textContent = `${state.errors.length} error${state.errors.length>1?'s':''}`;
            state.errors.forEach(e => appendOutput(`<span class="out-err">Line ${e.line}: ${escHtml(e.message)}</span>`));
            const html = renderState(state);
            if (html) vizScroll.innerHTML = html;
            // Monaco markers
            if (monacoEditor && monacoEditor.getModel) {
                try {
                    const markers = state.errors.map(e => ({ startLineNumber: e.line, startColumn: 1, endLineNumber: e.line, endColumn: 400, message: e.message, severity: monaco.MarkerSeverity.Error }));
                    monaco.editor.setModelMarkers(monacoEditor.getModel(), 'memviz', markers);
                } catch (e) { /* ignore */ }
            }
            prevState = state;
            return;
        }

        updateGutter([]);
        // clear monaco markers on success
        if (monacoEditor && monacoEditor.getModel) {
            try { monaco.editor.setModelMarkers(monacoEditor.getModel(), 'memviz', []); } catch (e) {}
        }
        outputBadge.className = 'output-bar-badge badge-ok';
        outputBadge.textContent = 'OK';
        appendOutput('<span class="out-ok">✓ Build succeeded — 0 errors</span>');

        // Additional semantic checks for C-style linked list: require a Node struct/class definition
        if (state.linkedLists && state.linkedLists.length > 0 && (lang === 'cpp')) {
            const hasNodeDef = /struct\s+Node\b|class\s+Node\b|typedef\s+struct\s+Node\b|new\s+Node\(|Node\s*\*/.test(code);
            if (!hasNodeDef) {
                appendOutput(`<span class="out-err">Error: linked list detected but no Node struct/class found in source. Please define a <code>struct Node</code> (or class) before running.</span>`, 'out-err');
                outputBadge.className = 'output-bar-badge badge-err';
                outputBadge.textContent = 'Error';
                setTimeout(() => { updateGutter([]); }, 50);
                // still render partial viz (if any)
                const html = renderState(state);
                if (html) vizScroll.innerHTML = html;
                prevState = state;
                return;
            }
        }

        // Detect infinite loop pattern and require interactive choice
        const hasInfiniteLoop = /while\s*\(\s*(1|true)\s*\)/i.test(code);
        if (hasInfiniteLoop && state.linkedLists && state.linkedLists.length > 0) {
            // render current state and then prompt user for operation
            vizScroll.innerHTML = renderState(state) || vizScroll.innerHTML;
            awaitUserOperation().then(op => {
                if (op) animateLLOperation(op);
            });
            prevState = state;
            return;
        }

        // If Python, try to execute in-browser via Pyodide and capture real stdout/stderr.
        if (lang === 'python') {
            appendOutput('<span class="out-info">Running with Pyodide (in-browser)...</span>');
            const py = await ensurePyodide();
            if (py) {
                try {
                    // redirect stdout/stderr to StringIO, run code, then restore
                    await py.runPythonAsync(`import sys, io\n_stdout = sys.stdout\n_stderr = sys.stderr\nsys.stdout = io.StringIO()\nsys.stderr = io.StringIO()`);
                    await py.runPythonAsync(code);
                    const out = py.runPython('sys.stdout.getvalue()');
                    const err = py.runPython('sys.stderr.getvalue()');
                    await py.runPythonAsync('sys.stdout = _stdout\nsys.stderr = _stderr');
                    if (out) out.split('\n').forEach(l => { if (l !== '') appendOutput(`<span class="out-stdout">[stdout] ${escHtml(l)}</span>`); });
                    if (err) err.split('\n').forEach(l => { if (l !== '') appendOutput(`<span class="out-stderr">[stderr] ${escHtml(l)}</span>`); });
                } catch (e) {
                    appendOutput(`<span class="out-err">Runtime error: ${escHtml(String(e))}</span>`, 'out-err');
                }
            } else {
                appendOutput('<span class="out-err">Pyodide failed to load — cannot execute Python in-browser.</span>', 'out-err');
            }
        } else {
            // heuristically capture print/cout/console.log for non-executed languages
            captureOutputLines(code, lang);
        }
        const explanation = generateExplanation(state, prevState);
        if (explanation) appendOutput(`<span class="out-info">${explanation}</span>`);
        if (state.steps && state.steps.length) appendOutput(`<span class="out-prompt">▸</span> ${state.steps.length} operation${state.steps.length>1?'s':''} traced`, 'out-info');

        const html = renderState(state);
        vizScroll.innerHTML = html || `<div class="empty-state"><div class="es-icon">◈</div><div class="es-txt">No data structures detected</div></div>`;
        prevState = state;
        // store steps for playback and enable play button
        lastSteps = state.steps || [];
        if (playBtn) playBtn.disabled = !(lastSteps && lastSteps.length > 0);
        // Auto-play traced steps for a fully automatic experience (no clicks)
        if (lastSteps && lastSteps.length) {
            // don't await — let animations run
            playSteps(lastSteps).catch(e => console.warn('autoplay steps failed', e));
        }
    }


    function onCodeChange() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(compile, 400);
        updateGutter([]);
    }

    codeInput.addEventListener('input', onCodeChange);

    compileBtn.addEventListener('click', () => { compileBtn.classList.remove('has-errors'); compile(); });
    clearBtn.addEventListener('click', () => {
        codeInput.value = '';
        clearOutput();
        vizScroll.innerHTML = `<div class="empty-state"><div class="es-icon">◈</div><div class="es-txt">Start typing code or pick a sample below<br>visualization updates live</div></div>`;
        updateGutter([]);
        prevState = null;
        activeSample = null;
        document.querySelectorAll('.sb.on').forEach(b => b.classList.remove('on'));
    });

    langSelect.addEventListener('change', () => {
        if (activeSample && SAMPLES[langSelect.value] && SAMPLES[langSelect.value][activeSample]) {
            codeInput.value = SAMPLES[langSelect.value][activeSample];
            // if Monaco is active sync its value too
            if (monacoEditor && monacoEditor.setValue) monacoEditor.setValue(codeInput.value);
            compile();
        } else if (codeInput.value.trim()) {
            if (monacoEditor && monacoEditor.getModel) {
                try { monaco.editor.setModelLanguage(monacoEditor.getModel(), { cpp: 'cpp', python: 'python', java: 'java', javascript: 'javascript', csharp: 'csharp' }[langSelect.value] || 'cpp'); } catch (e) {}
            }
            compile();
        }
    });

    document.querySelectorAll('.sb').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.sample;
            const code = SAMPLES[langSelect.value] && SAMPLES[langSelect.value][key];
            if (!code) return;
            document.querySelectorAll('.sb.on').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            activeSample = key;
            codeInput.value = code;
            compile();
        });
    });

    codeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = codeInput.selectionStart;
            const end = codeInput.selectionEnd;
            codeInput.value = codeInput.value.substring(0, start) + '    ' + codeInput.value.substring(end);
            codeInput.selectionStart = codeInput.selectionEnd = start + 4;
            onCodeChange();
        }
    });

        updateGutter([]);

        // initialize Monaco editor in background (optional)
        ensureMonaco().then(ed => {
            if (!ed) return;
            // set language from select
            const map = { cpp: 'cpp', python: 'python', java: 'java', javascript: 'javascript', csharp: 'csharp' };
            const lang = langSelect.value || 'cpp';
            try { monaco.editor.setModelLanguage(ed.getModel(), map[lang] || 'cpp'); } catch (e) {}
        });

        // Play steps handler
        if (playBtn) playBtn.addEventListener('click', () => {
            playBtn.disabled = true;
            playSteps(lastSteps).finally(() => { if (playBtn) playBtn.disabled = false; });
        });

    // initial compile to populate visualization immediately (keep Run button visible for IDE feel)
    setTimeout(() => { try { compile(); } catch (e) { console.warn('initial compile failed', e); } }, 80);
}

    // ── Interactive modal / animations helpers ─────────────────
    function awaitUserOperation() {
        return new Promise(resolve => {
            // create modal
            let modal = document.getElementById('mv-op-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'mv-op-modal';
                modal.style.position = 'fixed';
                modal.style.inset = '0';
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.style.background = 'rgba(0,0,0,0.45)';
                modal.style.zIndex = 9999;
                modal.innerHTML = `<div style="background:#141423;color:#e6e6ff;padding:18px;border-radius:10px;min-width:320px;box-shadow:0 8px 40px rgba(0,0,0,0.7)">
                    <div style="font-weight:700;margin-bottom:8px">Interactive loop detected</div>
                    <div style="font-size:13px;color:#bdbde6;margin-bottom:12px">Choose an operation to perform on the linked list to proceed with visualization:</div>
                    <div style="display:flex;gap:8px;justify-content:flex-end">
                        <button id="mv-op-insert" class="tb-btn">Insert</button>
                        <button id="mv-op-delete" class="tb-btn">Delete</button>
                        <button id="mv-op-search" class="tb-btn">Search</button>
                        <button id="mv-op-reverse" class="tb-btn">Reverse</button>
                        <button id="mv-op-cancel" class="tb-btn">Cancel</button>
                    </div>
                </div>`;
                document.body.appendChild(modal);
            }
            modal.style.display = 'flex';
            const cleanup = (choice) => { modal.style.display = 'none'; resolve(choice); };
            modal.querySelector('#mv-op-insert').onclick = () => cleanup('insert');
            modal.querySelector('#mv-op-delete').onclick = () => cleanup('delete');
            modal.querySelector('#mv-op-search').onclick = () => cleanup('search');
            modal.querySelector('#mv-op-reverse').onclick = () => cleanup('reverse');
            modal.querySelector('#mv-op-cancel').onclick = () => cleanup(null);
        });
    }

    function animateLLOperation(op) {
        const viz = document.querySelector('.viz-scroll');
        if (!viz) return;
        const llZone = viz.querySelector('.zone.z-heap');
        if (!llZone) return;
        const row = llZone.querySelector('.ll-row');
        if (!row) return;

        // simple insert at head animation
        if (op === 'insert') {
            const newNode = document.createElement('div');
            newNode.className = 'll-node inserting';
            newNode.innerHTML = `<div class="ll-val">?</div><div class="ll-ptr">→next</div>`;
            row.insertBefore(newNode, row.firstChild);
            setTimeout(() => newNode.classList.remove('inserting'), 900);
        }
        // delete last node
        if (op === 'delete') {
            const nodes = row.querySelectorAll('.ll-node');
            if (nodes.length) {
                const target = nodes[nodes.length - 1];
                target.classList.add('deleting');
                setTimeout(() => target.remove(), 700);
            }
        }
        // search: highlight first node for demo
        if (op === 'search') {
            const first = row.querySelector('.ll-node');
            if (first) {
                first.classList.add('highlight');
                setTimeout(() => first.classList.remove('highlight'), 1200);
            }
        }
        // reverse: flip ordering visually
        if (op === 'reverse') {
            const nodes = Array.from(row.querySelectorAll('.ll-node'));
            if (nodes.length > 1) {
                const container = row;
                nodes.reverse().forEach(n => container.appendChild(n));
                nodes.forEach(n => { n.classList.add('swapping'); setTimeout(() => n.classList.remove('swapping'), 900); });
            }
        }
    }

    // Play parser steps sequentially and animate corresponding DOM nodes
    async function playSteps(steps) {
        if (!steps || !steps.length) return;
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        for (const s of steps) {
            try {
                const act = s.action;
                const d = s.detail || {};
                // small narration
                appendOutput(`<span class="out-info">Step ${s.step}: ${act}</span>`);
                if (act === 'CREATE_NODE' && d.varName) {
                    const el = document.querySelector(`[data-node-id="${d.varName}"]`);
                    if (el) { el.classList.add('inserting'); await sleep(800); el.classList.remove('inserting'); el.classList.add('highlight'); await sleep(400); el.classList.remove('highlight'); }
                } else if (act === 'LINK_NODES' && d.from) {
                    const a = document.querySelector(`[data-node-id="${d.from}"]`);
                    const b = document.querySelector(`[data-node-id="${d.to}"]`);
                    if (a) { a.classList.add('highlight'); }
                    if (b) { b.classList.add('highlight'); }
                    await sleep(600);
                    if (a) a.classList.remove('highlight'); if (b) b.classList.remove('highlight');
                } else if (act === 'CREATE_DNODE' && d.varName) {
                    const el = document.querySelector(`[data-node-id="${d.varName}"]`);
                    if (el) { el.classList.add('inserting'); await sleep(700); el.classList.remove('inserting'); }
                } else if (act === 'CREATE_VAR' || act === 'UPDATE_VAR') {
                    // highlight var card
                    const name = d.name;
                    if (name) {
                        const cards = Array.from(document.querySelectorAll('.vcard'));
                        const card = cards.find(c => c.querySelector('.vc-name')?.textContent === name);
                        if (card) { card.classList.add('highlight'); await sleep(500); card.classList.remove('highlight'); }
                    }
                } else {
                    // generic pause for unsupported steps
                    await sleep(350);
                }
            } catch (e) { console.warn('playSteps error', e); }
        }
    }
