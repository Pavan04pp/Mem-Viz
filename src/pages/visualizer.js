// MemViz Visualizer - Ace Editor
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
    const langOptions = LANGS.map(l => '<option value=\"' + l.id + '\">' + l.label + '</option>').join('');
    const sampleBtns = SAMPLE_KEYS.map(s => '<button class=\"sb\" data-sample=\"' + s.key + '\">' + s.label + '</button>').join('');
    return '<div class=\"ide-page\"><div class=\"ide-window\"><div class=\"ide-titlebar\"><div class=\"ide-title-text\">MemViz IDE</div><div style=\"flex:1\"></div><select class=\"ide-lang-select\" id=\"lang-select\">' + langOptions + '</select><button class=\"tb-btn compile-btn\" id=\"compile-btn\">Run</button><button class=\"tb-btn\" id=\"play-steps-btn\" disabled>Play Steps</button><button class=\"tb-btn\" id=\"clear-btn\">Clear</button></div><div class=\"ide-body\"><div class=\"ide-left\"><div class=\"editor-area\"><div id=\"ace-editor\"></div></div><div class=\"output-panel\"><div class=\"output-bar\"><span class=\"output-bar-title\">Console</span><span class=\"output-bar-badge\" id=\"output-badge\"></span></div><div class=\"output-scroll\" id=\"output-scroll\"></div></div></div><div class=\"ide-right\"><div class=\"viz-bar\"><span class=\"viz-bar-title\">Memory Visualizer</span></div><div class=\"viz-scroll\" id=\"viz-scroll\"><div class=\"empty-state\"><div class=\"es-icon\">-</div><div class=\"es-txt\">Start typing code or pick a sample</div></div></div></div></div><div class=\"samples-bar\"><span class=\"sl\">Samples</span>' + sampleBtns + '</div></div></div>';
}

export function initVisualizer() {
    const langSelect = document.getElementById('lang-select');
    const compileBtn = document.getElementById('compile-btn');
    const playBtn = document.getElementById('play-steps-btn');
    const clearBtn = document.getElementById('clear-btn');
    const outputScroll = document.getElementById('output-scroll');
    const outputBadge = document.getElementById('output-badge');
    const vizScroll = document.getElementById('viz-scroll');
    const editorContainer = document.getElementById('ace-editor');
    if (!editorContainer) return;

    let editor = null;
    let prevState = null;
    let activeSample = null;
    let debounceTimer = null;
    let lastSteps = [];

    function loadAce() {
        return new Promise(function(resolve) {
            if (window.ace) { resolve(window.ace); return; }
            var s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.6/ace.min.js';
            s.onload = function() { resolve(window.ace); };
            s.onerror = function() { resolve(null); };
            document.head.appendChild(s);
        });
    }

    function initEditor() {
        return loadAce().then(function(ace) {
            if (!ace) return null;
            editor = ace.edit('ace-editor');
            editor.setTheme('ace/theme/one_dark');
            var langMap = { cpp: 'c_cpp', python: 'python', java: 'java', javascript: 'javascript', csharp: 'csharp' };
            editor.session.setMode('ace/mode/' + (langMap[langSelect.value] || 'c_cpp'));
            editor.setOptions({
                fontSize: '14px',
                fontFamily: \"'Fira Code', Consolas, monospace\",
                showPrintMargin: false,
                highlightActiveLine: true,
                highlightSelectedWord: true,
                showGutter: true,
                showLineNumbers: true,
                tabSize: 4,
                useSoftTabs: true,
                wrap: false,
                scrollPastEnd: 0.5,
                displayIndentGuides: true,
                highlightGutterLine: true,
                showFoldWidgets: true,
                behavioursEnabled: true,
                wrapBehavioursEnabled: true,
                enableMultiselect: true
            });
            editor.session.on('change', function() {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(compile, 400);
            });
            editor.focus();
            return editor;
        });
    }

    function getCode() { return editor ? editor.getValue() : ''; }
    function setCode(code) { if (editor) { editor.setValue(code, -1); editor.clearSelection(); } }
    function setLanguage(lang) {
        if (!editor) return;
        var langMap = { cpp: 'c_cpp', python: 'python', java: 'java', javascript: 'javascript', csharp: 'csharp' };
        editor.session.setMode('ace/mode/' + (langMap[lang] || 'c_cpp'));
    }

    function ensurePyodide() {
        if (window.pyodide) return Promise.resolve(window.pyodide);
        return new Promise(function(resolve) {
            var s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
            s.onload = function() {
                loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/' })
                    .then(function(py) { window.pyodide = py; resolve(py); })
                    .catch(function() { resolve(null); });
            };
            s.onerror = function() { resolve(null); };
            document.head.appendChild(s);
        });
    }

    function clearOutput() { outputScroll.innerHTML = ''; outputBadge.className = 'output-bar-badge'; outputBadge.textContent = ''; }
    function appendOutput(html, cls) { var el = document.createElement('div'); el.className = 'out-line ' + (cls || ''); el.innerHTML = html; outputScroll.appendChild(el); outputScroll.scrollTop = outputScroll.scrollHeight; }
    function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function compile() {
        var code = getCode();
        clearOutput();
        if (!code.trim()) { vizScroll.innerHTML = '<div class=\"empty-state\"><div class=\"es-icon\">-</div><div class=\"es-txt\">Start typing code</div></div>'; return Promise.resolve(); }
        appendOutput('<span class=\"out-prompt\">\$</span> Compiling...', 'out-info');
        var lang = langSelect.value;
        var supported = ['cpp', 'python', 'java'];
        if (supported.indexOf(lang) === -1) { appendOutput('<span class=\"out-err\">Language not supported</span>', 'out-err'); outputBadge.className = 'output-bar-badge badge-err'; outputBadge.textContent = 'Unsupported'; return Promise.resolve(); }
        var state = parseCode(code, lang);
        if (state.errors && state.errors.length) {
            outputBadge.className = 'output-bar-badge badge-err';
            outputBadge.textContent = state.errors.length + ' error' + (state.errors.length > 1 ? 's' : '');
            state.errors.forEach(function(e) { appendOutput('<span class=\"out-err\">Line ' + e.line + ': ' + escHtml(e.message) + '</span>'); });
            if (editor) { editor.session.setAnnotations(state.errors.map(function(e) { return { row: e.line - 1, column: 0, text: e.message, type: 'error' }; })); }
            var html = renderState(state); if (html) vizScroll.innerHTML = html;
            prevState = state;
            return Promise.resolve();
        }
        if (editor) editor.session.clearAnnotations();
        outputBadge.className = 'output-bar-badge badge-ok';
        outputBadge.textContent = 'OK';
        appendOutput('<span class=\"out-ok\">Build succeeded</span>');
        var runPromise = Promise.resolve();
        if (lang === 'python') {
            appendOutput('<span class=\"out-info\">Running with Pyodide...</span>');
            runPromise = ensurePyodide().then(function(py) {
                if (py) {
                    return py.runPythonAsync('import sys, io\\n_stdout = sys.stdout\\n_stderr = sys.stderr\\nsys.stdout = io.StringIO()\\nsys.stderr = io.StringIO()')
                        .then(function() { return py.runPythonAsync(code); })
                        .then(function() {
                            var out = py.runPython('sys.stdout.getvalue()');
                            var err = py.runPython('sys.stderr.getvalue()');
                            return py.runPythonAsync('sys.stdout = _stdout\\nsys.stderr = _stderr').then(function() {
                                if (out) out.split('\\n').forEach(function(l) { if (l !== '') appendOutput('<span class=\"out-stdout\">[stdout] ' + escHtml(l) + '</span>'); });
                                if (err) err.split('\\n').forEach(function(l) { if (l !== '') appendOutput('<span class=\"out-stderr\">[stderr] ' + escHtml(l) + '</span>'); });
                            });
                        })
                        .catch(function(e) { appendOutput('<span class=\"out-err\">Runtime error: ' + escHtml(String(e)) + '</span>', 'out-err'); });
                } else { appendOutput('<span class=\"out-err\">Pyodide failed to load</span>', 'out-err'); }
            });
        }
        return runPromise.then(function() {
            var explanation = generateExplanation(state, prevState);
            if (explanation) appendOutput('<span class=\"out-info\">' + explanation + '</span>');
            var html = renderState(state);
            vizScroll.innerHTML = html || '<div class=\"empty-state\"><div class=\"es-icon\">-</div><div class=\"es-txt\">No data structures detected</div></div>';
            prevState = state;
            lastSteps = state.steps || [];
            if (playBtn) playBtn.disabled = !(lastSteps && lastSteps.length > 0);
        });
    }

    function playSteps(steps) {
        if (!steps || !steps.length) return Promise.resolve();
        function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
        var i = 0;
        function next() {
            if (i >= steps.length) return Promise.resolve();
            var s = steps[i++];
            appendOutput('<span class=\"out-info\">Step ' + s.step + ': ' + s.action + '</span>');
            return sleep(350).then(next);
        }
        return next();
    }

    compileBtn.addEventListener('click', function() { compile(); });
    clearBtn.addEventListener('click', function() { setCode(''); clearOutput(); vizScroll.innerHTML = '<div class=\"empty-state\"><div class=\"es-icon\">-</div><div class=\"es-txt\">Start typing code</div></div>'; prevState = null; activeSample = null; });
    langSelect.addEventListener('change', function() { setLanguage(langSelect.value); if (activeSample && SAMPLES[langSelect.value] && SAMPLES[langSelect.value][activeSample]) { setCode(SAMPLES[langSelect.value][activeSample]); } compile(); });
    document.querySelectorAll('.sb').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var key = btn.dataset.sample;
            var code = SAMPLES[langSelect.value] && SAMPLES[langSelect.value][key];
            if (!code) return;
            document.querySelectorAll('.sb.on').forEach(function(b) { b.classList.remove('on'); });
            btn.classList.add('on');
            activeSample = key;
            setCode(code);
            compile();
        });
    });
    if (playBtn) { playBtn.addEventListener('click', function() { playBtn.disabled = true; playSteps(lastSteps).then(function() { playBtn.disabled = false; }); }); }
    initEditor().then(function() { setTimeout(compile, 100); });
}
