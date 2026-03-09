// ════════════════════════════════════════════════════════════
//  MemViz — Code Parser (C++, Python, Java, JS, C#)
//  Parses code line-by-line, builds memory state
// ════════════════════════════════════════════════════════════

import { evalExpr, typeClass } from './evaluator.js';

let _addrBase = 0x1000;
const _addrMap = {};
function freshAddr(name) {
    if (!_addrMap[name]) { _addrMap[name] = '0x' + (_addrBase += 4).toString(16).toUpperCase().padStart(4, '0'); }
    return _addrMap[name];
}
function resetEngine() { _addrBase = 0x1000; Object.keys(_addrMap).forEach(k => delete _addrMap[k]); }

export function parseCode(code, lang) {
    resetEngine();
    const st = {
        vars: [], arrays: [], linkedLists: [], doublyLinkedLists: [],
        stacks: [], queues: [], trees: [], graphs: [], maps: [],
        sets: [], tries: [], heaps: [], priorityQueues: [],
        callStack: [], pointers: [],
        steps: [], errors: []
    };
    const lines = code.split('\n');
    let stepN = 0, inFunc = null;

    const addStep = (action, detail, lineNum) => st.steps.push({ step: ++stepN, action, detail, line: lineNum });
    const getVar = name => st.vars.find(v => v.name === name);

    function setVar(name, rawType, value, scope, lineNum) {
        const tc = typeClass(rawType);
        const ei = st.vars.findIndex(v => v.name === name);
        if (ei >= 0) {
            const old = st.vars[ei].value;
            st.vars[ei].value = value;
            addStep('UPDATE_VAR', { name, oldValue: old, newValue: value, type: tc }, lineNum);
        } else {
            const addr = freshAddr(name);
            st.vars.push({ name, type: rawType || 'auto', jsType: tc, value, addr, scope: scope || 'stack' });
            addStep('CREATE_VAR', { name, type: tc, value, addr }, lineNum);
        }
    }

    lines.forEach((rawLine, li) => {
        const line = rawLine.trim();
        if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('/*') || line.startsWith('*')) return;
        const vrs = st.vars;
        const lineNum = li + 1;

        // ── FUNCTION DECLARATIONS ──
        // C++/Java/C#
        const fnCpp = line.match(/^(?:(?:public|private|protected|static|virtual|inline|override|final|async|void)\s+)*([\w[\]<>:]+)\s+(\w+)\s*\(([^)]*)\)\s*(?:const\s*)?\{?\s*$/);
        if (fnCpp) {
            const [, ret, fname, params] = fnCpp;
            if (!['if', 'for', 'while', 'switch', 'catch', 'else'].includes(fname) && !line.includes('=')) {
                const pl = params ? params.split(',').map(p => { const pts = p.trim().split(/\s+/); return pts[pts.length - 1].replace(/[*&]/g, ''); }).filter(Boolean) : [];
                st.callStack.push({ name: fname + '()', params: pl, vars: [], returnType: ret });
                inFunc = fname; addStep('FUNC_ENTER', { name: fname, params: pl, returnType: ret }, lineNum); return;
            }
        }
        // Python def
        const fnPy = line.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*[\w\[\]]+\s*)?:$/);
        if (fnPy) {
            const [, fname, params] = fnPy;
            const pl = params.split(',').map(p => p.trim().split(/[:=]/)[0].trim()).filter(Boolean);
            st.callStack.push({ name: fname + '()', params: pl, vars: [], returnType: 'auto' });
            inFunc = fname; addStep('FUNC_ENTER', { name: fname, params: pl }, lineNum); return;
        }
        // JS function
        const fnJs = line.match(/^(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*\{?\s*$/);
        if (fnJs) {
            const [, fname, params] = fnJs;
            const pl = params.split(',').map(p => p.trim()).filter(Boolean);
            st.callStack.push({ name: fname + '()', params: pl, vars: [], returnType: 'auto' });
            inFunc = fname; addStep('FUNC_ENTER', { name: fname, params: pl }, lineNum); return;
        }
        // Arrow function
        const fnArrow = line.match(/^(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/);
        if (fnArrow) {
            const [, fname, params] = fnArrow;
            const pl = params.split(',').map(p => p.trim()).filter(Boolean);
            st.callStack.push({ name: fname + '()', params: pl, vars: [], returnType: 'auto' });
            inFunc = fname; addStep('FUNC_ENTER', { name: fname, params: pl }, lineNum); return;
        }

        // return
        if (/^return\s+/.test(line) || line === 'return;') {
            const rv = line.replace(/^return\s*/, '').replace(/;$/, '');
            addStep('FUNC_RETURN', { name: inFunc, value: evalExpr(rv, vrs) }, lineNum); return;
        }

        // ── POINTER OPERATIONS ──
        const ptrDecl = line.match(/^(?:const\s+)?([\w:]+)\s*\*+\s*(\w+)\s*=\s*(?:&(\w+)|nullptr|NULL);?$/) ||
            line.match(/^(?:const\s+)?([\w:]+)\s*&\s*(\w+)\s*=\s*(\w+);?$/);
        if (ptrDecl) {
            const [, baseType, pname, target] = ptrDecl;
            const tv = getVar(target || '');
            st.pointers.push({ name: pname, pointsTo: target || null, addr: freshAddr(pname), value: tv ? tv.addr : 'nullptr', baseType });
            addStep('CREATE_POINTER', { name: pname, pointsTo: target, value: tv?.addr }, lineNum); return;
        }
        const derefW = line.match(/^\*(\w+)\s*=\s*(.+?);?$/);
        if (derefW) {
            const ptr = st.pointers.find(p => p.name === derefW[1]);
            if (ptr) { const tv = getVar(ptr.pointsTo); if (tv) { const old = tv.value; tv.value = evalExpr(derefW[2], vrs); addStep('DEREF_WRITE', { pointer: ptr.name, target: ptr.pointsTo, oldValue: old, newValue: tv.value }, lineNum); } }
            return;
        }
        const ptrR = line.match(/^(\w+)\s*=\s*&(\w+);?$/);
        if (ptrR) {
            const ptr = st.pointers.find(p => p.name === ptrR[1]);
            if (ptr) { ptr.pointsTo = ptrR[2]; const nv = getVar(ptrR[2]); ptr.value = nv ? nv.addr : '0x????'; addStep('POINTER_REASSIGN', { name: ptr.name, newTarget: ptrR[2] }, lineNum); }
            return;
        }

        // ── VARIABLE DECLARATIONS ──
        // C++/Java/C# typed
        const typedVar = line.match(/^(?:const\s+|static\s+|final\s+|volatile\s+|readonly\s+)?(int|long|short|float|double|bool|boolean|char|string|String|auto|var|unsigned int|unsigned long|decimal|byte|sbyte|uint|ulong|ushort)\s+(\w+)\s*=\s*(.+?);?\s*$/);
        if (typedVar && !line.includes('(') && !line.includes('[') && !line.includes('*')) {
            const [, rawT, name, rhs] = typedVar;
            const value = evalExpr(rhs, vrs);
            setVar(name, rawT, value, inFunc ? 'frame:' + inFunc : 'stack', lineNum);
            if (inFunc) { const fr = st.callStack.find(f => f.name === inFunc + '()'); if (fr) fr.vars.push([name, value]); }
            return;
        }
        // Python / JS assignment
        if (lang === 'python' || lang === 'javascript') {
            const dyn = lang === 'python'
                ? line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/)
                : line.match(/^(?:let|const|var)\s+(\w+)\s*=\s*(.+?);?\s*$/);
            if (dyn && !line.includes('[') && !line.includes('{') && !line.includes('(') && !line.includes('def ') && !line.includes('==')) {
                const [, name, rhs] = dyn;
                const value = evalExpr(rhs, vrs);
                let rawT = 'auto';
                if (typeof value === 'number') rawT = Number.isInteger(value) ? 'int' : 'float';
                else if (typeof value === 'boolean') rawT = 'bool';
                else if (typeof value === 'string') rawT = 'string';
                setVar(name, rawT, value, inFunc ? 'frame:' + inFunc : 'stack', lineNum);
                if (inFunc) { const fr = st.callStack.find(f => f.name === inFunc + '()'); if (fr) { const ei = fr.vars.findIndex(v => v[0] === name); if (ei >= 0) fr.vars[ei][1] = value; else fr.vars.push([name, value]); } }
                return;
            }
        }
        // reassign
        const reass = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+?);?\s*$/);
        if (reass && getVar(reass[1]) && !line.includes('==') && !line.includes('(') && !line.includes('[')) {
            setVar(reass[1], null, evalExpr(reass[2], vrs), undefined, lineNum); return;
        }

        // ── ARRAYS ──
        // C++/C#: int arr[n] = {1,2,3};  or int[] arr = {1,2,3};
        const cArr = line.match(/^(?:const\s+)?(int|float|double|char|string)\s+(\w+)\s*\[\d*\]\s*=\s*\{(.+?)\};?$/) ||
            line.match(/^(?:const\s+)?(int|float|double|char|string)\[\]\s+(\w+)\s*=\s*(?:new\s+\w+\[\d*\]\s*)?\{(.+?)\};?$/);
        if (cArr) {
            const [, type, name, vals] = cArr;
            const values = vals.split(',').map(v => evalExpr(v.trim(), vrs));
            const ei = st.arrays.findIndex(a => a.name === name);
            if (ei >= 0) st.arrays[ei].values = values;
            else st.arrays.push({ name, type, values, addr: freshAddr(name) });
            addStep('CREATE_ARRAY', { name, type, size: values.length, values }, lineNum); return;
        }
        // C++ int arr[n]; (uninitialized)
        const cArrEmpty = line.match(/^(?:const\s+)?(int|float|double|char)\s+(\w+)\s*\[(\d+)\]\s*;?$/);
        if (cArrEmpty) {
            const [, type, name, sz] = cArrEmpty;
            const size = parseInt(sz);
            st.arrays.push({ name, type, values: Array(size).fill(0), addr: freshAddr(name) });
            addStep('CREATE_ARRAY', { name, type, size, values: [] }, lineNum); return;
        }
        // array element update
        const arrU = line.match(/^(\w+)\[(\d+)\]\s*=\s*(.+?);?$/);
        if (arrU) {
            const arr = st.arrays.find(a => a.name === arrU[1]);
            if (arr) { const idx = parseInt(arrU[2]); const old = arr.values[idx]; arr.values[idx] = evalExpr(arrU[3], vrs); addStep('UPDATE_ARRAY', { name: arr.name, index: idx, oldValue: old, newValue: arr.values[idx] }, lineNum); return; }
        }
        // Python list / JS array
        const dynArr = lang === 'python'
            ? line.match(/^(\w+)\s*=\s*\[(.+?)\]$/)
            : line.match(/^(?:let|const|var)\s+(\w+)\s*=\s*\[(.+?)\];?$/);
        if (dynArr) {
            const [, name, vals] = dynArr;
            const values = vals.split(',').map(v => evalExpr(v.trim(), vrs));
            st.arrays.push({ name, type: lang === 'python' ? 'list' : 'Array', values, addr: freshAddr(name) });
            addStep('CREATE_ARRAY', { name, values }, lineNum); return;
        }
        // C# List<T>
        const csList = line.match(/^List<(\w+)>\s+(\w+)\s*=\s*new\s+List<\w+>\s*\{(.+?)\};?$/);
        if (csList) {
            const [, type, name, vals] = csList;
            const values = vals.split(',').map(v => evalExpr(v.trim(), vrs));
            st.arrays.push({ name, type: 'List<' + type + '>', values, addr: freshAddr(name) });
            addStep('CREATE_ARRAY', { name, values }, lineNum); return;
        }

        // ── LINKED LIST ──
        const llCreate = line.match(/(?:ListNode\s*\*?\s*|Node\s*\*?\s*)(\w+)\s*=\s*new\s*(?:Node|ListNode)\((.+?)\);?/) ||
            (lang === 'python' && line.match(/^(\w+)\s*=\s*(?:Node|ListNode)\((.+?)\)$/));
        if (llCreate) {
            const [, vName, valE] = llCreate;
            const val = evalExpr(valE, vrs);
            let ll = st.linkedLists[0];
            if (!ll) { ll = { name: 'LinkedList', nodes: [], head: null }; st.linkedLists.push(ll); }
            ll.nodes.push({ id: vName, val, next: null, addr: freshAddr(vName) });
            if (!ll.head) ll.head = vName;
            addStep('CREATE_NODE', { varName: vName, val }, lineNum); return;
        }
        const llLink = line.match(/(\w+)\s*->\s*next\s*=\s*(\w+|nullptr|null|NULL|None);?/) ||
            line.match(/(\w+)\.next\s*=\s*(\w+|null|None);?/);
        if (llLink) {
            const [, from, to] = llLink;
            const ll = st.linkedLists[0];
            if (ll) { const node = ll.nodes.find(n => n.id === from); if (node) { node.next = ['nullptr', 'null', 'NULL', 'None'].includes(to) ? null : to; addStep('LINK_NODES', { from, to }, lineNum); } }
            return;
        }

        // ── DOUBLY LINKED LIST ──
        const dllCreate = line.match(/(?:DNode\s*\*?\s*)(\w+)\s*=\s*new\s*DNode\((.+?)\);?/) ||
            (lang === 'python' && line.match(/^(\w+)\s*=\s*DNode\((.+?)\)$/));
        if (dllCreate) {
            const [, vName, valE] = dllCreate;
            const val = evalExpr(valE, vrs);
            let dll = st.doublyLinkedLists[0];
            if (!dll) { dll = { name: 'DoublyLinkedList', nodes: [], head: null }; st.doublyLinkedLists.push(dll); }
            dll.nodes.push({ id: vName, val, next: null, prev: null, addr: freshAddr(vName) });
            if (!dll.head) dll.head = vName;
            addStep('CREATE_DNODE', { varName: vName, val }, lineNum); return;
        }
        const dllLink = line.match(/(\w+)\s*->\s*next\s*=\s*(\w+);?\s*$/) || line.match(/(\w+)\.next\s*=\s*(\w+);?\s*$/);
        if (dllLink && st.doublyLinkedLists.length > 0) {
            const [, from, to] = dllLink;
            const dll = st.doublyLinkedLists[0];
            if (dll) {
                const node = dll.nodes.find(n => n.id === from);
                const toNode = dll.nodes.find(n => n.id === to);
                if (node && toNode) { node.next = to; toNode.prev = from; addStep('LINK_DNODES', { from, to }, lineNum); }
            }
            return;
        }

        // ── STACK DS ──
        const sInit = line.match(/^(?:stack\s*<[^>]+>|Stack(?:<[^>]+>)?|std::stack\s*<[^>]+>)\s+(\w+)\s*;?$/) ||
            (lang === 'python' && line.match(/^(\w+)\s*=\s*(?:\[\]|Stack\(\)|deque\(\))$/)) ||
            (lang === 'javascript' && line.match(/^(?:let|const|var)\s+(\w+)\s*=\s*\[\]\s*;?.*\/\/.*stack/i));
        if (sInit) { const n = sInit[1]; if (!st.stacks.find(s => s.name === n)) { st.stacks.push({ name: n, items: [] }); addStep('INIT_STACK', { name: n }, lineNum); } return; }

        const sPush = line.match(/(\w+)\.(?:push|append|push_back|Push)\((.+?)\);?$/);
        if (sPush) {
            const [, n, ve] = sPush; let ds = st.stacks.find(s => s.name === n);
            if (!ds) { ds = { name: n, items: [] }; st.stacks.push(ds); }
            const v = evalExpr(ve, vrs); ds.items.push(v);
            addStep('STACK_PUSH', { name: n, value: v, size: ds.items.length }, lineNum); return;
        }
        const sPop = line.match(/^(\w+)\.(?:pop|Pop)\(\);?$/);
        if (sPop) { const ds = st.stacks.find(s => s.name === sPop[1]); if (ds && ds.items.length) { const v = ds.items.pop(); addStep('STACK_POP', { name: ds.name, removed: v, size: ds.items.length }, lineNum); } return; }
        const sTop = line.match(/^(?:int|auto|var|let|const)\s+(\w+)\s*=\s*(\w+)\.(?:top|Peek|peek)\(\);?$/);
        if (sTop) { const ds = st.stacks.find(s => s.name === sTop[2]); if (ds && ds.items.length) { const v = ds.items[ds.items.length - 1]; setVar(sTop[1], 'int', v, undefined, lineNum); } return; }

        // ── QUEUE DS ──
        const qInit = line.match(/^(?:queue\s*<[^>]+>|Queue(?:<[^>]+>)?|std::queue\s*<[^>]+>|deque\s*<[^>]+>)\s+(\w+)\s*;?$/) ||
            (lang === 'python' && line.match(/^(\w+)\s*=\s*(?:Queue\(\)|deque\(\))$/));
        if (qInit) { const n = qInit[1]; if (!st.queues.find(q => q.name === n)) { st.queues.push({ name: n, items: [] }); addStep('INIT_QUEUE', { name: n }, lineNum); } return; }

        const qEnq = line.match(/(\w+)\.(?:enqueue|push|offer|append|put|Enqueue)\((.+?)\);?$/);
        if (qEnq) {
            const [, n, ve] = qEnq; let ds = st.queues.find(q => q.name === n);
            if (!ds) { ds = { name: n, items: [] }; st.queues.push(ds); }
            const v = evalExpr(ve, vrs); ds.items.push(v);
            addStep('QUEUE_ENQ', { name: n, value: v, size: ds.items.length }, lineNum); return;
        }
        const qDeq = line.match(/(\w+)\.(?:dequeue|poll|popleft|get|shift|Dequeue)\(.*?\);?$/);
        if (qDeq) { const ds = st.queues.find(q => q.name === qDeq[1]); if (ds && ds.items.length) { const v = ds.items.shift(); addStep('QUEUE_DEQ', { name: ds.name, removed: v, size: ds.items.length }, lineNum); } return; }
        const qFront = line.match(/^(?:int|auto|var|let|const)\s+(\w+)\s*=\s*(\w+)\.(?:front|Peek|peek)\(\);?$/);
        if (qFront) { const ds = st.queues.find(q => q.name === qFront[2]); if (ds && ds.items.length) { setVar(qFront[1], 'int', ds.items[0], undefined, lineNum); } return; }

        // ── TREES ──
        const tInit = line.match(/^(?:BST|BinaryTree|BinarySearchTree|AVLTree|Tree)\s+(\w+)\s*;?$/) ||
            (lang === 'python' && line.match(/^(\w+)\s*=\s*(?:BST|BinaryTree|AVLTree|BinarySearchTree)\(\)$/));
        if (tInit) { const n = tInit[1]; if (!st.trees.find(t => t.name === n)) { st.trees.push({ name: n, type: 'BST', nodes: [], root: null }); addStep('INIT_TREE', { name: n }, lineNum); } return; }

        const tIns = line.match(/(\w+)\.(?:insert|Insert)\((.+?)\);?$/);
        if (tIns) {
            const [, n, ve] = tIns; let tree = st.trees.find(t => t.name === n);
            if (!tree) { tree = { name: n, type: 'BST', nodes: [], root: null }; st.trees.push(tree); }
            const val = evalExpr(ve, vrs); bstInsert(tree, val);
            addStep('TREE_INSERT', { name: n, value: val, size: tree.nodes.length }, lineNum); return;
        }
        const tDel = line.match(/(\w+)\.(?:delete|remove|erase|Delete|Remove)\((.+?)\);?$/);
        if (tDel) {
            const tree = st.trees.find(t => t.name === tDel[1]);
            if (tree) { bstDelete(tree, evalExpr(tDel[2], vrs)); addStep('TREE_DELETE', { name: tree.name }, lineNum); }
            return;
        }

        // ── HEAP / PRIORITY QUEUE ──
        const hInit = line.match(/^(?:MinHeap|MaxHeap|Heap|PriorityQueue|priority_queue)\s*(?:<[^>]+>)?\s+(\w+)\s*;?$/) ||
            (lang === 'python' && line.match(/^(\w+)\s*=\s*(?:MinHeap|MaxHeap|Heap|\[\])\s*(?:#\s*heap)?$/i));
        if (hInit) {
            const n = hInit[1];
            const isMax = line.toLowerCase().includes('max');
            if (!st.heaps.find(h => h.name === n)) {
                st.heaps.push({ name: n, items: [], type: isMax ? 'max' : 'min' });
                addStep('INIT_HEAP', { name: n, type: isMax ? 'max' : 'min' }, lineNum);
            }
            return;
        }

        const hPush = line.match(/(\w+)\.(?:push|insert|add|Push|Insert|heappush)\((.+?)\);?$/);
        if (hPush && st.heaps.find(h => h.name === hPush[1])) {
            const [, n, ve] = hPush;
            const h = st.heaps.find(h => h.name === n);
            const v = evalExpr(ve, vrs);
            h.items.push(v);
            h.items.sort((a, b) => h.type === 'min' ? a - b : b - a);
            addStep('HEAP_PUSH', { name: n, value: v, size: h.items.length }, lineNum); return;
        }
        const hPop = line.match(/(\w+)\.(?:pop|Pop|poll|extract)\(\);?$/);
        if (hPop && st.heaps.find(h => h.name === hPop[1])) {
            const h = st.heaps.find(h => h.name === hPop[1]);
            if (h.items.length) { const v = h.items.shift(); addStep('HEAP_POP', { name: h.name, removed: v, size: h.items.length }, lineNum); }
            return;
        }

        // ── TRIE ──
        const trieInit = line.match(/^(?:Trie)\s+(\w+)\s*;?$/) ||
            (lang === 'python' && line.match(/^(\w+)\s*=\s*Trie\(\)$/));
        if (trieInit) {
            const n = trieInit[1];
            if (!st.tries.find(t => t.name === n)) {
                st.tries.push({ name: n, root: { char: '', children: {}, isEnd: false }, words: [] });
                addStep('INIT_TRIE', { name: n }, lineNum);
            }
            return;
        }
        const trieIns = line.match(/(\w+)\.insert\((.+?)\);?$/);
        if (trieIns && st.tries.find(t => t.name === trieIns[1])) {
            const t = st.tries.find(t => t.name === trieIns[1]);
            const word = String(evalExpr(trieIns[2], vrs));
            t.words.push(word);
            let node = t.root;
            for (const ch of word) {
                if (!node.children[ch]) node.children[ch] = { char: ch, children: {}, isEnd: false };
                node = node.children[ch];
            }
            node.isEnd = true;
            addStep('TRIE_INSERT', { name: t.name, word }, lineNum); return;
        }

        // ── SET ──
        const setInit = line.match(/^(?:set\s*<[^>]+>|unordered_set\s*<[^>]+>|HashSet(?:<[^>]+>)?|TreeSet(?:<[^>]+>)?)\s+(\w+)\s*;?$/) ||
            (lang === 'python' && line.match(/^(\w+)\s*=\s*set\(\)$/)) ||
            (lang === 'javascript' && line.match(/^(?:let|const|var)\s+(\w+)\s*=\s*new\s+Set\(\);?$/));
        if (setInit) {
            const n = setInit[1];
            if (!st.sets.find(s => s.name === n)) { st.sets.push({ name: n, items: [] }); addStep('INIT_SET', { name: n }, lineNum); }
            return;
        }
        const setAdd = line.match(/(\w+)\.(?:insert|add|Add)\((.+?)\);?$/);
        if (setAdd && st.sets.find(s => s.name === setAdd[1])) {
            const s = st.sets.find(s => s.name === setAdd[1]);
            const v = evalExpr(setAdd[2], vrs);
            if (!s.items.includes(v)) { s.items.push(v); addStep('SET_ADD', { name: s.name, value: v }, lineNum); }
            return;
        }
        const setRem = line.match(/(\w+)\.(?:erase|remove|delete|Remove)\((.+?)\);?$/);
        if (setRem && st.sets.find(s => s.name === setRem[1])) {
            const s = st.sets.find(s => s.name === setRem[1]);
            const v = evalExpr(setRem[2], vrs);
            s.items = s.items.filter(i => String(i) !== String(v));
            addStep('SET_REMOVE', { name: s.name, value: v }, lineNum); return;
        }

        // ── GRAPH ──
        const gInit = line.match(/^(?:Graph|Digraph)\s+(\w+)\s*;?$/) ||
            (lang === 'python' && line.match(/^(\w+)\s*=\s*(?:Graph|defaultdict\(list\)|{})\s*$/));
        if (gInit) { const n = gInit[1]; if (!st.graphs.find(g => g.name === n)) { st.graphs.push({ name: n, nodes: [], edges: [], directed: line.includes('Digraph') }); addStep('INIT_GRAPH', { name: n }, lineNum); } return; }

        const gNode = line.match(/(\w+)\.add(?:Node|node|_node|Vertex|vertex)\((.+?)\);?$/);
        if (gNode) { const g = st.graphs.find(g => g.name === gNode[1]); if (g) { const id = evalExpr(gNode[2], vrs); if (!g.nodes.find(n => String(n.id) === String(id))) { g.nodes.push({ id, label: String(id) }); addStep('GRAPH_NODE', { name: g.name, node: id }, lineNum); } } return; }

        const gEdge = line.match(/(\w+)\.add(?:Edge|edge|_edge)\((.+?),\s*(.+?)\);?$/);
        if (gEdge) {
            const g = st.graphs.find(g => g.name === gEdge[1]);
            if (g) {
                const from = evalExpr(gEdge[2], vrs), to = evalExpr(gEdge[3], vrs);
                if (!g.nodes.find(n => String(n.id) === String(from))) g.nodes.push({ id: from, label: String(from) });
                if (!g.nodes.find(n => String(n.id) === String(to))) g.nodes.push({ id: to, label: String(to) });
                g.edges.push({ from, to }); addStep('GRAPH_EDGE', { name: g.name, from, to }, lineNum);
            }
            return;
        }
        // Python adjacency
        if (lang === 'python') {
            const pyAdj = line.match(/^(\w+)\[(.+?)\]\.append\((.+?)\)$/);
            if (pyAdj) {
                let g = st.graphs.find(g => g.name === pyAdj[1]);
                if (g) {
                    const from = evalExpr(pyAdj[2], vrs), to = evalExpr(pyAdj[3], vrs);
                    if (!g.nodes.find(n => String(n.id) === String(from))) g.nodes.push({ id: from, label: String(from) });
                    if (!g.nodes.find(n => String(n.id) === String(to))) g.nodes.push({ id: to, label: String(to) });
                    g.edges.push({ from, to }); addStep('GRAPH_EDGE', { name: g.name, from, to }, lineNum);
                }
                return;
            }
        }

        // ── HASH MAP ──
        const mInit = line.match(/^(?:map|unordered_map|HashMap|Map|TreeMap|LinkedHashMap|Dictionary)\s*(?:<[^>]+>)?\s+(\w+)\s*;?$/) ||
            (lang === 'python' && line.match(/^(\w+)\s*=\s*(?:dict\(\)|{})$/)) ||
            (lang === 'javascript' && line.match(/^(?:let|const|var)\s+(\w+)\s*=\s*(?:new Map\(\)|{});?$/));
        if (mInit) { const n = mInit[1]; if (!st.maps.find(m => m.name === n)) { st.maps.push({ name: n, entries: [] }); addStep('INIT_MAP', { name: n }, lineNum); } return; }

        const mSet = line.match(/^(\w+)\[(.+?)\]\s*=\s*(.+?);?$/) ||
            line.match(/(\w+)\.(?:put|set|Add)\((.+?),\s*(.+?)\);?$/);
        if (mSet) {
            const m = st.maps.find(m => m.name === mSet[1]);
            if (m) { const key = evalExpr(mSet[2], vrs), val = evalExpr(mSet[3], vrs); const ei = m.entries.findIndex(e => String(e.key) === String(key)); if (ei >= 0) m.entries[ei].val = val; else m.entries.push({ key, val }); addStep('MAP_SET', { name: m.name, key, val }, lineNum); }
            return;
        }
        const mDel = line.match(/(\w+)\.(?:erase|remove|delete|Remove)\((.+?)\);?$/) ||
            (lang === 'python' && line.match(/^del\s+(\w+)\[(.+?)\]$/));
        if (mDel) { const m = st.maps.find(m => m.name === mDel[1]); if (m) { const key = evalExpr(mDel[2], vrs); m.entries = m.entries.filter(e => String(e.key) !== String(key)); addStep('MAP_DELETE', { name: m.name, key }, lineNum); } return; }
    });
    // Simple syntax error detection after processing all lines
    lines.forEach((rawLine, li) => {
        const line = rawLine.trim();
        if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('/*') || line.startsWith('*')) return;
        const hasUnmatchedParen = (line.match(/\(/g) || []).length !== (line.match(/\)/g) || []).length;
        const hasUnmatchedBrace = (line.match(/\{/g) || []).length !== (line.match(/\}/g) || []).length;
        const likelyStatement = /[=;{}]/.test(line) || /function|def|class/.test(line);
        if (hasUnmatchedParen || hasUnmatchedBrace || (!line.endsWith(';') && !line.endsWith('}') && !line.endsWith('{') && !likelyStatement)) {
            st.errors.push({ line: li + 1, message: 'Syntax error or unsupported statement' });
        }
    });
    return st;
}

function bstInsert(tree, val) {
    const node = { id: 'n' + val, val, left: null, right: null };
    tree.nodes.push(node);
    if (tree.nodes.length === 1) { tree.root = node.id; return; }
    let cur = tree.nodes.find(n => n.id === tree.root);
    while (cur) {
        if (val < cur.val) { if (!cur.left) { cur.left = node.id; break; } else cur = tree.nodes.find(n => n.id === cur.left); }
        else if (val > cur.val) { if (!cur.right) { cur.right = node.id; break; } else cur = tree.nodes.find(n => n.id === cur.right); }
        else break;
    }
}

function bstDelete(tree, val) {
    const ni = tree.nodes.findIndex(n => n.val === val);
    if (ni < 0) return;
    const node = tree.nodes[ni];
    tree.nodes.splice(ni, 1);
    tree.nodes.forEach(n => { if (n.left === node.id) n.left = null; if (n.right === node.id) n.right = null; });
    if (tree.root === node.id) tree.root = tree.nodes.length > 0 ? tree.nodes[0].id : null;
}
