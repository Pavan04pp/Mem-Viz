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
            <button class="tb-btn" id="clear-btn" style="margin-left:6px;">Clear</button>
        </div>

        <div class="ide-body">
            <div class="ide-left">
                <div class="editor-area">
                    <div class="line-gutter" id="line-gutter"></div>
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
    const clearBtn = document.getElementById('clear-btn');
    const outputScroll = document.getElementById('output-scroll');
    const outputBadge = document.getElementById('output-badge');
    const vizScroll = document.getElementById('viz-scroll');

    if (!codeInput) return;

    let prevState = null;
    let activeSample = null;
    let debounceTimer = null;

    function updateGutter(errorLines) {
        const lines = codeInput.value.split('\n');
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

    function compile() {
        const code = codeInput.value || '';
        clearOutput();
        if (!code.trim()) {
            vizScroll.innerHTML = `<div class="empty-state"><div class="es-icon">◈</div><div class="es-txt">Start typing code or pick a sample below<br>visualization updates live</div></div>`;
            updateGutter([]);
            return;
        }

        appendOutput(`<span class="out-prompt">$</span> Compiling...`, 'out-info');
        const lang = langSelect.value;
        const state = parseCode(code, lang);

        if (state.errors && state.errors.length) {
            updateGutter(state.errors);
            outputBadge.className = 'output-bar-badge badge-err';
            outputBadge.textContent = `${state.errors.length} error${state.errors.length>1?'s':''}`;
            state.errors.forEach(e => appendOutput(`<span class="out-err">Line ${e.line}: ${escHtml(e.message)}</span>`));
            const html = renderState(state);
            if (html) vizScroll.innerHTML = html;
            prevState = state;
            return;
        }

        updateGutter([]);
        outputBadge.className = 'output-bar-badge badge-ok';
        outputBadge.textContent = 'OK';
        appendOutput('<span class="out-ok">✓ Build succeeded — 0 errors</span>');

        captureOutputLines(code, lang);
        const explanation = generateExplanation(state, prevState);
        if (explanation) appendOutput(`<span class="out-info">${explanation}</span>`);
        if (state.steps && state.steps.length) appendOutput(`<span class="out-prompt">▸</span> ${state.steps.length} operation${state.steps.length>1?'s':''} traced`, 'out-info');

        const html = renderState(state);
        vizScroll.innerHTML = html || `<div class="empty-state"><div class="es-icon">◈</div><div class="es-txt">No data structures detected</div></div>`;
        prevState = state;
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
            compile();
        } else if (codeInput.value.trim()) {
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
}
