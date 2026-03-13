// Premium MemViz Visualizer - Code-Driven Animated DLL Visualization

import { SAMPLES } from '../engine/samples.js';

export function renderVisualizerPage() {
    return `
    <div class="viz-page">
        <div class="viz-main">
            <div class="code-panel">
                <div class="panel-header">
                    <span class="panel-title">Code Editor</span>
                    <select class="lang-select" id="lang-select">
                        <option value="cpp">C++</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                    </select>
                </div>
                <div class="editor-wrapper">
                    <div id="ace-editor"></div>
                </div>
                <div class="editor-actions">
                    <button class="run-btn" id="run-btn">▶ Run & Visualize</button>
                    <button class="clear-btn" id="clear-btn">Clear</button>
                </div>
            </div>
            <div class="visual-panel">
                <div class="panel-header">
                    <span class="panel-title">Memory Visualization</span>
                    <div class="speed-control">
                        <label>Speed:</label>
                        <input type="range" id="speed-slider" min="1" max="10" value="5">
                    </div>
                </div>
                <div class="visual-canvas" id="visual-canvas">
                    <div class="empty-viz">
                        <div class="empty-icon">⬡</div>
                        <div class="empty-text">Write code and click Run to visualize</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom-panel">
            <div class="console-panel">
                <div class="panel-header">
                    <span class="panel-title">Console Output</span>
                </div>
                <div class="console-output" id="console-output"></div>
            </div>
            <div class="input-panel" id="input-panel" style="display:none;">
                <div class="panel-header">
                    <span class="panel-title">Input Required</span>
                </div>
                <div class="input-prompt" id="input-prompt">Enter value:</div>
                <input type="text" class="input-field" id="input-field" placeholder="Type here...">
                <button class="input-submit" id="input-submit">Submit</button>
            </div>
        </div>
        <div class="samples-row">
            <span class="samples-label">Quick Load:</span>
            <button class="sample-btn" data-sample="array">Array</button>
            <button class="sample-btn" data-sample="ll">Linked List</button>
            <button class="sample-btn active" data-sample="dll">Doubly LL</button>
            <button class="sample-btn" data-sample="stack">Stack</button>
            <button class="sample-btn" data-sample="queue">Queue</button>
            <button class="sample-btn" data-sample="bst">BST</button>
            <button class="sample-btn" data-sample="heap">Heap</button>
            <button class="sample-btn" data-sample="trie">Trie</button>
            <button class="sample-btn" data-sample="graph">Graph</button>
            <button class="sample-btn" data-sample="hashmap">HashMap</button>
            <button class="sample-btn" data-sample="set">Set</button>
        </div>
    </div>`;
}

// Premium DLL Visualizer - Uses same style as built-in renderer
class DLLVisualizer {
    constructor(canvasEl) {
        this.canvas = canvasEl;
        this.nodes = [];
        this.animSpeed = 500;
    }

    setSpeed(val) {
        this.animSpeed = 1100 - val * 100;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms || this.animSpeed));
    }

    async render(highlightId = null, operation = null) {
        if (this.nodes.length === 0) {
            this.canvas.innerHTML = `
                <div class="dll-viz-container">
                    <div class="dll-empty-state">
                        <div class="dll-ptr-label head-label">
                            <span class="dll-ptr-name">head</span>
                            <span class="dll-ptr-arrow">↓</span>
                        </div>
                        <div class="dll-null-box">NULL</div>
                        <div class="dll-ptr-label tail-label">
                            <span class="dll-ptr-arrow">↑</span>
                            <span class="dll-ptr-name">tail</span>
                        </div>
                    </div>
                </div>`;
            return;
        }

        let html = `<div class="dll-viz-container"><div class="dll-nodes-wrapper">`;
        html += `<div class="dll-null-cap left">NULL ←</div>`;

        this.nodes.forEach((node, index) => {
            const isFirst = index === 0;
            const isLast = index === this.nodes.length - 1;
            const isHighlighted = node.id === highlightId;
            const isInserting = operation === 'insert' && isHighlighted;
            const isDeleting = operation === 'delete' && isHighlighted;
            const nodeClass = `dll-premium-node ${isHighlighted ? 'highlight' : ''} ${isInserting ? 'inserting' : ''}`;

            html += `<div class="dll-node-wrap">`;
            
            // Head pointer above first node
            if (isFirst) {
                html += `<div class="dll-ptr-above">
                    <span class="dll-ptr-name head">head</span>
                    <span class="dll-ptr-arrow down">↓</span>
                </div>`;
            }

            // The actual node
            html += `
                <div class="${nodeClass}" id="${node.id}" data-node-id="${node.id}">
                    <div class="dll-section dll-prev">
                        <span class="dll-sec-label">PREV</span>
                        <span class="dll-sec-val">${isFirst ? 'NULL' : '●'}</span>
                    </div>
                    <div class="dll-section dll-data">
                        <span class="dll-data-val">${node.value}</span>
                    </div>
                    <div class="dll-section dll-next">
                        <span class="dll-sec-label">NEXT</span>
                        <span class="dll-sec-val">${isLast ? 'NULL' : '●'}</span>
                    </div>
                    <div class="dll-addr">0x${(0x1000 + index * 16).toString(16).toUpperCase()}</div>
                </div>`;

            // Tail pointer below last node
            if (isLast) {
                html += `<div class="dll-ptr-below">
                    <span class="dll-ptr-arrow up">↑</span>
                    <span class="dll-ptr-name tail">tail</span>
                </div>`;
            }

            html += `</div>`; // end dll-node-wrap

            // Connector between nodes
            if (!isLast) {
                html += `<div class="dll-connector">⇄</div>`;
            }
        });

        html += `<div class="dll-null-cap right">→ NULL</div>`;
        html += `</div></div>`; // end dll-nodes-wrapper and dll-viz-container
        
        this.canvas.innerHTML = html;
    }

    async insertBegin(value) {
        const newNode = {
            id: 'node_' + Date.now(),
            value: value
        };
        this.nodes.unshift(newNode);

        await this.render(newNode.id, 'insert');
        await this.sleep();
        await this.render();
        return newNode;
    }

    async insertEnd(value) {
        const newNode = {
            id: 'node_' + Date.now(),
            value: value
        };
        this.nodes.push(newNode);

        await this.render(newNode.id, 'insert');
        await this.sleep();
        await this.render();
        return newNode;
    }

    async deleteBegin() {
        if (this.nodes.length === 0) return null;

        const deletedNode = this.nodes[0];
        
        // First render with highlight
        await this.render(deletedNode.id, 'delete');
        
        // Add delete animation class
        const nodeEl = document.querySelector(`[data-node-id="${deletedNode.id}"]`);
        if (nodeEl) {
            nodeEl.classList.add('deleting');
            await this.sleep();
        }

        // Remove node and re-render
        this.nodes.shift();
        await this.render();
        return deletedNode;
    }

    async deleteEnd() {
        if (this.nodes.length === 0) return null;

        const deletedNode = this.nodes[this.nodes.length - 1];
        
        // First render with highlight
        await this.render(deletedNode.id, 'delete');

        // Add delete animation class
        const nodeEl = document.querySelector(`[data-node-id="${deletedNode.id}"]`);
        if (nodeEl) {
            nodeEl.classList.add('deleting');
            await this.sleep();
        }

        // Remove node and re-render
        this.nodes.pop();
        await this.render();
        return deletedNode;
    }

    // Stack operations (LIFO - Last In First Out)
    async push(value) {
        // Push adds to the end (top of stack)
        return this.insertEnd(value, 'stack');
    }

    async pop() {
        // Pop removes from the end (top of stack)
        return this.deleteEnd();
    }

    async peek() {
        if (this.nodes.length === 0) return null;
        const topNode = this.nodes[this.nodes.length - 1];
        await this.render(topNode.id, 'highlight');
        return topNode;
    }

    // Queue operations (FIFO - First In First Out)
    async enqueue(value) {
        // Enqueue adds to the end (rear of queue)
        return this.insertEnd(value, 'queue');
    }

    async dequeue() {
        // Dequeue removes from the beginning (front of queue)
        return this.deleteBegin();
    }

    async front() {
        if (this.nodes.length === 0) return null;
        const frontNode = this.nodes[0];
        await this.render(frontNode.id, 'highlight');
        return frontNode;
    }

    // Render as Stack (vertical, top at top)
    async renderStack(highlightId = null, highlightType = null) {
        const container = document.getElementById('visual-canvas');
        
        if (this.nodes.length === 0) {
            container.innerHTML = `
                <div class="dll-premium-container stack-view">
                    <div class="empty-stack-message">Stack is Empty</div>
                </div>
            `;
            return;
        }

        // Reverse for display (top of stack at top)
        const displayNodes = [...this.nodes].reverse();
        
        let html = `<div class="dll-premium-container stack-view">`;
        html += `<div class="stack-label">TOP</div>`;
        
        displayNodes.forEach((node, index) => {
            const isTop = index === 0;
            const isBottom = index === displayNodes.length - 1;
            const isHighlighted = node.id === highlightId;
            
            let classes = 'dll-premium-node stack-node';
            if (isHighlighted) {
                classes += highlightType === 'delete' ? ' deleting' : ' highlighted';
            }
            if (isTop) classes += ' stack-top';
            
            html += `
                <div class="${classes}" data-node-id="${node.id}">
                    <div class="node-value">${node.value}</div>
                    ${isTop ? '<span class="stack-pointer">← TOP</span>' : ''}
                </div>
            `;
        });
        
        html += `<div class="stack-label">BOTTOM</div>`;
        html += `</div>`;
        
        container.innerHTML = html;
        await this.sleep(100);
    }

    // Render as Queue (horizontal, front at left)
    async renderQueue(highlightId = null, highlightType = null) {
        const container = document.getElementById('visual-canvas');
        
        if (this.nodes.length === 0) {
            container.innerHTML = `
                <div class="dll-premium-container queue-view">
                    <div class="empty-queue-message">Queue is Empty</div>
                </div>
            `;
            return;
        }

        let html = `<div class="dll-premium-container queue-view">`;
        html += `<div class="queue-label front-label">FRONT</div>`;
        html += `<div class="queue-nodes">`;
        
        this.nodes.forEach((node, index) => {
            const isFront = index === 0;
            const isRear = index === this.nodes.length - 1;
            const isHighlighted = node.id === highlightId;
            
            let classes = 'dll-premium-node queue-node';
            if (isHighlighted) {
                classes += highlightType === 'delete' ? ' deleting' : ' highlighted';
            }
            if (isFront) classes += ' queue-front';
            if (isRear) classes += ' queue-rear';
            
            html += `
                <div class="${classes}" data-node-id="${node.id}">
                    ${isFront ? '<span class="queue-pointer front-ptr">FRONT↓</span>' : ''}
                    <div class="node-value">${node.value}</div>
                    ${isRear ? '<span class="queue-pointer rear-ptr">↑REAR</span>' : ''}
                </div>
            `;
            
            // Add arrow between nodes
            if (index < this.nodes.length - 1) {
                html += `<div class="queue-arrow">→</div>`;
            }
        });
        
        html += `</div>`;
        html += `<div class="queue-label rear-label">REAR</div>`;
        html += `</div>`;
        
        container.innerHTML = html;
        await this.sleep(100);
    }

    // ═══════════════════════════════════════════════════════════════
    // ARRAY VISUALIZATION
    // ═══════════════════════════════════════════════════════════════
    
    async arrayInsert(index, value) {
        if (index < 0 || index > this.nodes.length) return false;
        const node = { id: Date.now(), value };
        this.nodes.splice(index, 0, node);
        return true;
    }

    async arrayRemove(index) {
        if (index < 0 || index >= this.nodes.length) return null;
        const removed = this.nodes.splice(index, 1)[0];
        return removed.value;
    }

    arrayGet(index) {
        if (index < 0 || index >= this.nodes.length) return null;
        return this.nodes[index].value;
    }

    async renderArray(highlightIndex = null) {
        const container = document.getElementById('visual-canvas');
        
        if (this.nodes.length === 0) {
            container.innerHTML = `
                <div class="ds-container array-container">
                    <div class="ds-title">📊 Array</div>
                    <div class="ds-empty">Array is Empty</div>
                </div>
            `;
            return;
        }

        let html = `<div class="ds-container array-container">`;
        html += `<div class="ds-title">📊 Array</div>`;
        html += `<div class="array-indices">`;
        this.nodes.forEach((_, i) => {
            html += `<div class="array-index">${i}</div>`;
        });
        html += `</div>`;
        html += `<div class="array-cells">`;
        this.nodes.forEach((node, i) => {
            const highlight = i === highlightIndex ? ' highlighted' : '';
            html += `<div class="array-cell${highlight}">${node.value}</div>`;
        });
        html += `</div>`;
        html += `</div>`;
        
        container.innerHTML = html;
        await this.sleep(100);
    }

    // ═══════════════════════════════════════════════════════════════
    // TRIE VISUALIZATION
    // ═══════════════════════════════════════════════════════════════
    
    trieClear() {
        this.trieRoot = { children: {}, isEnd: false };
    }

    async trieInsert(word) {
        if (!this.trieRoot) this.trieClear();
        let node = this.trieRoot;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = { children: {}, isEnd: false };
            }
            node = node.children[char];
        }
        node.isEnd = true;
        await this.renderTrie();
    }

    trieSearch(word) {
        if (!this.trieRoot) return false;
        let node = this.trieRoot;
        for (const char of word) {
            if (!node.children[char]) return false;
            node = node.children[char];
        }
        return node.isEnd;
    }

    trieStartsWith(prefix) {
        if (!this.trieRoot) return false;
        let node = this.trieRoot;
        for (const char of prefix) {
            if (!node.children[char]) return false;
            node = node.children[char];
        }
        return true;
    }

    trieGetAllWords() {
        const words = [];
        const traverse = (node, word) => {
            if (node.isEnd) words.push(word);
            for (const [char, child] of Object.entries(node.children)) {
                traverse(child, word + char);
            }
        };
        if (this.trieRoot) traverse(this.trieRoot, '');
        return words;
    }

    async renderTrie() {
        const container = document.getElementById('visual-canvas');
        const words = this.trieGetAllWords();
        
        let html = `<div class="ds-container trie-container">`;
        html += `<div class="ds-title">🔤 Trie (Prefix Tree)</div>`;
        
        if (words.length === 0) {
            html += `<div class="ds-empty">Trie is Empty</div>`;
        } else {
            html += `<div class="trie-visual">`;
            html += `<div class="trie-root">root</div>`;
            html += `<div class="trie-words">`;
            words.forEach(word => {
                html += `<div class="trie-word">`;
                for (let i = 0; i < word.length; i++) {
                    html += `<span class="trie-char">${word[i]}</span>`;
                    if (i < word.length - 1) html += `<span class="trie-arrow">→</span>`;
                }
                html += `<span class="trie-end">✓</span>`;
                html += `</div>`;
            });
            html += `</div>`;
        }
        html += `</div>`;
        
        container.innerHTML = html;
        await this.sleep(100);
    }

    // ═══════════════════════════════════════════════════════════════
    // GRAPH VISUALIZATION
    // ═══════════════════════════════════════════════════════════════
    
    graphInit(numNodes) {
        this.graphNodes = numNodes;
        this.graphAdj = Array.from({ length: numNodes }, () => []);
    }

    async graphAddEdge(u, v) {
        if (u >= 0 && u < this.graphNodes && v >= 0 && v < this.graphNodes) {
            this.graphAdj[u].push(v);
            this.graphAdj[v].push(u);
            await this.renderGraph();
            return true;
        }
        return false;
    }

    async graphBFS(start) {
        const visited = new Array(this.graphNodes).fill(false);
        const result = [];
        const queue = [start];
        visited[start] = true;
        
        while (queue.length > 0) {
            const node = queue.shift();
            result.push(node);
            for (const neighbor of this.graphAdj[node]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.push(neighbor);
                }
            }
        }
        return result;
    }

    async graphDFS(start) {
        const visited = new Array(this.graphNodes).fill(false);
        const result = [];
        
        const dfs = (node) => {
            visited[node] = true;
            result.push(node);
            for (const neighbor of this.graphAdj[node]) {
                if (!visited[neighbor]) dfs(neighbor);
            }
        };
        dfs(start);
        return result;
    }

    graphDisplay(engine) {
        engine.log('Graph (Adjacency List):', 'output');
        for (let i = 0; i < this.graphNodes; i++) {
            engine.log(`${i} → ${this.graphAdj[i].join(', ') || '(none)'}`, 'output');
        }
    }

    async renderGraph() {
        const container = document.getElementById('visual-canvas');
        
        let html = `<div class="ds-container graph-container">`;
        html += `<div class="ds-title">🕸️ Graph</div>`;
        
        if (!this.graphNodes || this.graphNodes === 0) {
            html += `<div class="ds-empty">Graph is Empty</div>`;
        } else {
            // Visual representation
            html += `<div class="graph-visual">`;
            const radius = 120;
            const centerX = 150;
            const centerY = 140;
            
            // Draw edges first (SVG)
            html += `<svg class="graph-svg" viewBox="0 0 300 280">`;
            const positions = [];
            for (let i = 0; i < this.graphNodes; i++) {
                const angle = (2 * Math.PI * i) / this.graphNodes - Math.PI / 2;
                positions.push({
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                });
            }
            
            // Draw edges
            for (let i = 0; i < this.graphNodes; i++) {
                for (const j of this.graphAdj[i]) {
                    if (i < j) {
                        html += `<line x1="${positions[i].x}" y1="${positions[i].y}" x2="${positions[j].x}" y2="${positions[j].y}" class="graph-edge"/>`;
                    }
                }
            }
            
            // Draw nodes
            for (let i = 0; i < this.graphNodes; i++) {
                html += `<circle cx="${positions[i].x}" cy="${positions[i].y}" r="20" class="graph-node-circle"/>`;
                html += `<text x="${positions[i].x}" y="${positions[i].y + 5}" class="graph-node-text">${i}</text>`;
            }
            html += `</svg>`;
            html += `</div>`;
            
            // Adjacency list
            html += `<div class="graph-adj-list">`;
            html += `<div class="adj-title">Adjacency List:</div>`;
            for (let i = 0; i < this.graphNodes; i++) {
                html += `<div class="adj-row"><span class="adj-node">${i}</span> → ${this.graphAdj[i].join(', ') || '∅'}</div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
        
        container.innerHTML = html;
        await this.sleep(100);
    }

    // ═══════════════════════════════════════════════════════════════
    // HASHMAP VISUALIZATION
    // ═══════════════════════════════════════════════════════════════
    
    hashMapClear() {
        this.hashTable = Array.from({ length: 10 }, () => []);
    }

    hashFunc(key) {
        let h = 0;
        for (const c of String(key)) {
            h = (h * 31 + c.charCodeAt(0)) % 10;
        }
        return h;
    }

    async hashMapPut(key, value) {
        if (!this.hashTable) this.hashMapClear();
        const idx = this.hashFunc(key);
        const bucket = this.hashTable[idx];
        for (const entry of bucket) {
            if (entry.key === key) {
                entry.value = value;
                await this.renderHashMap();
                return;
            }
        }
        bucket.push({ key, value });
        await this.renderHashMap();
    }

    hashMapGet(key) {
        if (!this.hashTable) return null;
        const idx = this.hashFunc(key);
        for (const entry of this.hashTable[idx]) {
            if (entry.key === key) return entry.value;
        }
        return null;
    }

    async hashMapRemove(key) {
        if (!this.hashTable) return false;
        const idx = this.hashFunc(key);
        const bucket = this.hashTable[idx];
        const i = bucket.findIndex(e => e.key === key);
        if (i !== -1) {
            bucket.splice(i, 1);
            await this.renderHashMap();
            return true;
        }
        return false;
    }

    hashMapDisplay(engine) {
        if (!this.hashTable) return;
        engine.log('HashMap:', 'output');
        this.hashTable.forEach((bucket, i) => {
            const entries = bucket.map(e => `{${e.key}:${e.value}}`).join(' → ');
            engine.log(`[${i}]: ${entries || 'NULL'}`, 'output');
        });
    }

    async renderHashMap() {
        const container = document.getElementById('visual-canvas');
        
        let html = `<div class="ds-container hashmap-container">`;
        html += `<div class="ds-title">🗂️ HashMap</div>`;
        
        if (!this.hashTable) {
            html += `<div class="ds-empty">HashMap is Empty</div>`;
        } else {
            html += `<div class="hashmap-buckets">`;
            this.hashTable.forEach((bucket, i) => {
                html += `<div class="hashmap-row">`;
                html += `<div class="bucket-index">[${i}]</div>`;
                html += `<div class="bucket-entries">`;
                if (bucket.length === 0) {
                    html += `<span class="bucket-null">NULL</span>`;
                } else {
                    bucket.forEach((entry, j) => {
                        html += `<div class="bucket-entry">${entry.key}: ${entry.value}</div>`;
                        if (j < bucket.length - 1) html += `<span class="bucket-arrow">→</span>`;
                    });
                }
                html += `</div></div>`;
            });
            html += `</div>`;
        }
        html += `</div>`;
        
        container.innerHTML = html;
        await this.sleep(100);
    }

    // ═══════════════════════════════════════════════════════════════
    // SET VISUALIZATION
    // ═══════════════════════════════════════════════════════════════
    
    setClear() {
        this.setData = new Set();
    }

    async setAdd(value) {
        if (!this.setData) this.setClear();
        if (this.setData.has(value)) return false;
        this.setData.add(value);
        await this.renderSet();
        return true;
    }

    async setRemove(value) {
        if (!this.setData) return false;
        const result = this.setData.delete(value);
        await this.renderSet();
        return result;
    }

    setContains(value) {
        if (!this.setData) return false;
        return this.setData.has(value);
    }

    setGetAll() {
        if (!this.setData) return [];
        return [...this.setData];
    }

    async renderSet() {
        const container = document.getElementById('visual-canvas');
        const values = this.setGetAll();
        
        let html = `<div class="ds-container set-container">`;
        html += `<div class="ds-title">🎯 Set</div>`;
        
        if (values.length === 0) {
            html += `<div class="ds-empty">Set is Empty</div>`;
        } else {
            html += `<div class="set-elements">`;
            html += `<span class="set-brace">{</span>`;
            values.forEach((val, i) => {
                html += `<div class="set-element">${val}</div>`;
                if (i < values.length - 1) html += `<span class="set-comma">,</span>`;
            });
            html += `<span class="set-brace">}</span>`;
            html += `</div>`;
            html += `<div class="set-size">Size: ${values.length}</div>`;
        }
        html += `</div>`;
        
        container.innerHTML = html;
        await this.sleep(100);
    }

    // ═══════════════════════════════════════════════════════════════
    // BINARY SEARCH TREE VISUALIZATION
    // ═══════════════════════════════════════════════════════════════
    
    bstClear() {
        this.bstRoot = null;
    }

    async bstInsert(value) {
        const newNode = { value, left: null, right: null };
        
        if (!this.bstRoot) {
            this.bstRoot = newNode;
            await this.renderBST();
            return;
        }
        
        let current = this.bstRoot;
        while (true) {
            if (value < current.value) {
                if (!current.left) {
                    current.left = newNode;
                    break;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    break;
                }
                current = current.right;
            }
        }
        
        await this.renderBST();
    }

    async bstDelete(value) {
        const deleteNode = (node, val) => {
            if (!node) return null;
            
            if (val < node.value) {
                node.left = deleteNode(node.left, val);
            } else if (val > node.value) {
                node.right = deleteNode(node.right, val);
            } else {
                // Found the node to delete
                if (!node.left && !node.right) return null;
                if (!node.left) return node.right;
                if (!node.right) return node.left;
                
                // Node with two children: get inorder successor
                let successor = node.right;
                while (successor.left) successor = successor.left;
                node.value = successor.value;
                node.right = deleteNode(node.right, successor.value);
            }
            return node;
        };
        
        const existed = this.bstSearch(value);
        this.bstRoot = deleteNode(this.bstRoot, value);
        await this.renderBST();
        return existed;
    }

    bstSearch(value) {
        let current = this.bstRoot;
        while (current) {
            if (value === current.value) return true;
            current = value < current.value ? current.left : current.right;
        }
        return false;
    }

    bstInorder() {
        const result = [];
        const traverse = (node) => {
            if (!node) return;
            traverse(node.left);
            result.push(node.value);
            traverse(node.right);
        };
        traverse(this.bstRoot);
        return result;
    }

    async renderBST() {
        const container = document.getElementById('visual-canvas');
        
        let html = `<div class="ds-container bst-container">`;
        html += `<div class="ds-title">🌳 Binary Search Tree</div>`;
        
        if (!this.bstRoot) {
            html += `<div class="ds-empty">BST is Empty</div>`;
        } else {
            html += `<div class="bst-visual">`;
            html += this.renderBSTNode(this.bstRoot, 0);
            html += `</div>`;
            
            // Show inorder traversal
            const inorder = this.bstInorder();
            html += `<div class="bst-traversal">Inorder: ${inorder.join(' → ')}</div>`;
        }
        html += `</div>`;
        
        container.innerHTML = html;
        await this.sleep(100);
    }

    renderBSTNode(node, level) {
        if (!node) return '';
        
        let html = `<div class="bst-level" style="--level: ${level}">`;
        html += `<div class="bst-node-wrapper">`;
        
        // Left subtree
        if (node.left || node.right) {
            html += `<div class="bst-children">`;
            html += `<div class="bst-child left">`;
            if (node.left) {
                html += `<div class="bst-edge left-edge"></div>`;
                html += this.renderBSTNode(node.left, level + 1);
            }
            html += `</div>`;
            html += `<div class="bst-child right">`;
            if (node.right) {
                html += `<div class="bst-edge right-edge"></div>`;
                html += this.renderBSTNode(node.right, level + 1);
            }
            html += `</div>`;
            html += `</div>`;
        }
        
        html += `<div class="bst-node">${node.value}</div>`;
        html += `</div></div>`;
        
        return html;
    }

    // ═══════════════════════════════════════════════════════════════
    // HEAP (MIN-HEAP) VISUALIZATION
    // ═══════════════════════════════════════════════════════════════
    
    heapClear() {
        this.heapArray = [];
    }

    async heapInsert(value) {
        if (!this.heapArray) this.heapArray = [];
        this.heapArray.push(value);
        
        // Heapify up
        let i = this.heapArray.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heapArray[parent] <= this.heapArray[i]) break;
            [this.heapArray[parent], this.heapArray[i]] = [this.heapArray[i], this.heapArray[parent]];
            i = parent;
        }
        
        await this.renderHeap();
    }

    async heapExtractMin() {
        if (!this.heapArray || this.heapArray.length === 0) return null;
        
        const min = this.heapArray[0];
        const last = this.heapArray.pop();
        
        if (this.heapArray.length > 0) {
            this.heapArray[0] = last;
            // Heapify down
            let i = 0;
            while (true) {
                const left = 2 * i + 1;
                const right = 2 * i + 2;
                let smallest = i;
                
                if (left < this.heapArray.length && this.heapArray[left] < this.heapArray[smallest]) {
                    smallest = left;
                }
                if (right < this.heapArray.length && this.heapArray[right] < this.heapArray[smallest]) {
                    smallest = right;
                }
                if (smallest === i) break;
                
                [this.heapArray[i], this.heapArray[smallest]] = [this.heapArray[smallest], this.heapArray[i]];
                i = smallest;
            }
        }
        
        await this.renderHeap();
        return min;
    }

    heapGetMin() {
        if (!this.heapArray || this.heapArray.length === 0) return null;
        return this.heapArray[0];
    }

    async renderHeap() {
        const container = document.getElementById('visual-canvas');
        
        let html = `<div class="ds-container heap-container">`;
        html += `<div class="ds-title">⛰️ Min Heap</div>`;
        
        if (!this.heapArray || this.heapArray.length === 0) {
            html += `<div class="ds-empty">Heap is Empty</div>`;
        } else {
            // Tree visualization
            html += `<div class="heap-tree">`;
            html += this.renderHeapTree(0, 0);
            html += `</div>`;
            
            // Array representation
            html += `<div class="heap-array">`;
            html += `<div class="heap-array-label">Array: </div>`;
            html += `<div class="heap-array-cells">`;
            this.heapArray.forEach((val, i) => {
                html += `<div class="heap-cell">${val}</div>`;
            });
            html += `</div></div>`;
        }
        html += `</div>`;
        
        container.innerHTML = html;
        await this.sleep(100);
    }

    renderHeapTree(index, level) {
        if (index >= this.heapArray.length) return '';
        
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        
        let html = `<div class="heap-node-container">`;
        html += `<div class="heap-node">${this.heapArray[index]}</div>`;
        
        if (left < this.heapArray.length || right < this.heapArray.length) {
            html += `<div class="heap-children">`;
            html += `<div class="heap-child">${this.renderHeapTree(left, level + 1)}</div>`;
            html += `<div class="heap-child">${this.renderHeapTree(right, level + 1)}</div>`;
            html += `</div>`;
        }
        
        html += `</div>`;
        return html;
    }

    clear() {
        this.nodes = [];
        this.trieRoot = null;
        this.graphNodes = 0;
        this.graphAdj = [];
        this.hashTable = null;
        this.setData = null;
        this.bstRoot = null;
        this.heapArray = [];
        this.render();
    }
}

// Code Execution Engine with Input Prompts
class CodeEngine {
    constructor(visualizer, consoleEl, inputPanel, inputPrompt, inputField) {
        this.viz = visualizer;
        this.console = consoleEl;
        this.inputPanel = inputPanel;
        this.inputPrompt = inputPrompt;
        this.inputField = inputField;
        this.isRunning = false;
        this.inputResolver = null;
    }

    log(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `console-line console-${type}`;
        line.innerHTML = message;
        this.console.appendChild(line);
        this.console.scrollTop = this.console.scrollHeight;
    }

    clearConsole() {
        this.console.innerHTML = '';
    }

    async getInput(prompt) {
        return new Promise(resolve => {
            this.inputPanel.style.display = 'block';
            this.inputPrompt.textContent = prompt;
            this.inputField.value = '';
            this.inputField.focus();
            this.inputResolver = resolve;
        });
    }

    submitInput() {
        if (this.inputResolver) {
            const value = this.inputField.value;
            this.inputPanel.style.display = 'none';
            this.log('» ' + value, 'input');
            this.inputResolver(value);
            this.inputResolver = null;
        }
    }

    async runCode(code) {
        this.clearConsole();
        this.viz.clear();
        this.isRunning = true;

        this.log('🚀 Starting execution...', 'system');

        // Detect data structure type
        const isArray = /class\s+Array|int\s*\*?\s*arr\s*\[|Array Menu/i.test(code);
        const isDLL = /struct\s+Node[\s\S]*?prev[\s\S]*?next|doubly|DLL/i.test(code);
        const isSLL = /struct\s+Node[\s\S]*?next(?![\s\S]*prev)|Linked List Menu/i.test(code) && !isDLL;
        const isStack = /class\s+Stack|Stack Menu|\.push\(|s\.push|stack\.push/i.test(code) && !isArray;
        const isQueue = /class\s+Queue|Queue Menu|enqueue|dequeue/i.test(code);
        const isBST = /struct\s+.*left[\s\S]*?right|BST|Binary.*Search.*Tree|bst\./i.test(code);
        const isHeap = /class\s+.*Heap|MinHeap|MaxHeap|heapify|heap\./i.test(code);
        const isTrie = /class\s+Trie|TrieNode|Trie Menu|trie\./i.test(code);
        const isGraph = /class\s+Graph|Graph Menu|addEdge|BFS|DFS|graph\./i.test(code);
        const isHashMap = /class\s+HashMap|HashMap Menu|map\.put|map\.get/i.test(code);
        const isSet = /class\s+Set|Set Menu|set\.add|set\.contains/i.test(code) && !isHashMap;
        const hasMenu = /while\s*\(\s*(true|1)\s*\)|switch\s*\(\s*choice/i.test(code);

        // First try to parse and execute inline operations from main()
        const mainMatch = code.match(/int\s+main\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*return/);
        const mainCode = mainMatch ? mainMatch[1] : code;
        
        // Check for direct operations (not menu-driven)
        const hasDirectOps = this.hasDirectOperations(mainCode, { isDLL, isSLL, isStack, isQueue, isBST, isHeap, isTrie, isGraph, isHashMap, isSet });

        if (hasDirectOps && !hasMenu) {
            // Parse and execute the code directly
            await this.parseAndExecuteCode(code, mainCode, { isDLL, isSLL, isStack, isQueue, isBST, isHeap, isTrie, isGraph, isHashMap, isSet, isArray });
        } else if (isArray && hasMenu) {
            this.viz.dsType = 'array';
            await this.runArrayMenuMode();
        } else if (isDLL && hasMenu) {
            this.viz.dsType = 'dll';
            await this.runDLLMenuMode();
        } else if (isSLL && hasMenu) {
            this.viz.dsType = 'sll';
            await this.runSLLMenuMode();
        } else if (isStack && hasMenu) {
            this.viz.dsType = 'stack';
            await this.runStackMenuMode();
        } else if (isQueue && hasMenu) {
            this.viz.dsType = 'queue';
            await this.runQueueMenuMode();
        } else if (isBST && hasMenu) {
            this.viz.dsType = 'bst';
            await this.runBSTMenuMode();
        } else if (isHeap && hasMenu) {
            this.viz.dsType = 'heap';
            await this.runHeapMenuMode();
        } else if (isTrie && hasMenu) {
            this.viz.dsType = 'trie';
            await this.runTrieMenuMode();
        } else if (isGraph && hasMenu) {
            this.viz.dsType = 'graph';
            await this.runGraphMenuMode();
        } else if (isHashMap && hasMenu) {
            this.viz.dsType = 'hashmap';
            await this.runHashMapMenuMode();
        } else if (isSet && hasMenu) {
            this.viz.dsType = 'set';
            await this.runSetMenuMode();
        } else {
            // Try to auto-detect and parse
            await this.parseAndExecuteCode(code, mainCode, { isDLL, isSLL, isStack, isQueue, isBST, isHeap, isTrie, isGraph, isHashMap, isSet, isArray });
        }

        this.isRunning = false;
        this.log('✅ Execution complete', 'system');
    }

    hasDirectOperations(code, types) {
        // Check for direct function calls outside of menu loop
        if (types.isDLL || types.isSLL) {
            return /insertBegin\s*\(\d+\)|insertEnd\s*\(\d+\)|deleteBegin|deleteEnd/i.test(code);
        }
        if (types.isStack) {
            return /\.push\s*\(\d+\)|s\.push|stack\.push/i.test(code);
        }
        if (types.isQueue) {
            return /\.enqueue\s*\(\d+\)|q\.enqueue/i.test(code);
        }
        if (types.isBST) {
            return /\.insert\s*\(\d+\)|bst\.insert|tree\.insert/i.test(code);
        }
        if (types.isGraph) {
            return /addEdge\s*\(\d+\s*,\s*\d+\)|g\.addEdge/i.test(code);
        }
        if (types.isTrie) {
            return /\.insert\s*\(\s*["'][^"']+["']\s*\)|trie\.insert/i.test(code);
        }
        return false;
    }

    async parseAndExecuteCode(fullCode, mainCode, types) {
        this.log('📝 Parsing your code...', 'info');

        // ═══════════════════════════════════════════════════════════
        // DOUBLY LINKED LIST
        // ═══════════════════════════════════════════════════════════
        if (types.isDLL || types.isSLL) {
            this.log('🔗 Detected Linked List operations', 'system');
            await this.viz.render();

            // Find all insertBegin calls
            const insertBeginMatches = mainCode.matchAll(/insertBegin\s*\(\s*(\d+)\s*\)/g);
            for (const match of insertBeginMatches) {
                const val = parseInt(match[1]);
                this.log(`📥 insertBegin(${val})`, 'action');
                await this.viz.insertBegin(val);
                this.log(`✓ Inserted ${val} at beginning`, 'success');
            }

            // Find all insertEnd calls
            const insertEndMatches = mainCode.matchAll(/insertEnd\s*\(\s*(\d+)\s*\)/g);
            for (const match of insertEndMatches) {
                const val = parseInt(match[1]);
                this.log(`📥 insertEnd(${val})`, 'action');
                await this.viz.insertEnd(val);
                this.log(`✓ Inserted ${val} at end`, 'success');
            }

            // Find all deleteBegin calls
            const deleteBeginMatches = mainCode.matchAll(/deleteBegin\s*\(\s*\)/g);
            for (const match of deleteBeginMatches) {
                this.log(`🗑️ deleteBegin()`, 'action');
                const deleted = await this.viz.deleteBegin();
                this.log(deleted ? `✓ Deleted ${deleted.value}` : '⚠ List empty', deleted ? 'success' : 'warning');
            }

            // Find all deleteEnd calls
            const deleteEndMatches = mainCode.matchAll(/deleteEnd\s*\(\s*\)/g);
            for (const match of deleteEndMatches) {
                this.log(`🗑️ deleteEnd()`, 'action');
                const deleted = await this.viz.deleteEnd();
                this.log(deleted ? `✓ Deleted ${deleted.value}` : '⚠ List empty', deleted ? 'success' : 'warning');
            }

            // Find display calls
            if (/display\s*\(\s*\)/.test(mainCode)) {
                const vals = this.viz.nodes.map(n => n.value).join(' ⟷ ');
                this.log(`📋 List: ${vals || 'Empty'}`, 'output');
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // STACK
        // ═══════════════════════════════════════════════════════════
        if (types.isStack) {
            this.log('📚 Detected Stack operations', 'system');
            this.viz.clear();
            await this.viz.renderStack();

            // Find push operations: s.push(5) or stack.push(10) or push(value)
            const pushMatches = mainCode.matchAll(/(?:s|stack)?\.?push\s*\(\s*(\d+)\s*\)/gi);
            for (const match of pushMatches) {
                const val = parseInt(match[1]);
                this.log(`📥 push(${val})`, 'action');
                await this.viz.push(val);
                await this.viz.renderStack();
                this.log(`✓ Pushed ${val}`, 'success');
            }

            // Find pop operations
            const popMatches = mainCode.matchAll(/(?:s|stack)?\.?pop\s*\(\s*\)/gi);
            for (const match of popMatches) {
                this.log(`📤 pop()`, 'action');
                const popped = await this.viz.pop();
                await this.viz.renderStack();
                this.log(popped ? `✓ Popped ${popped.value}` : '⚠ Stack empty', popped ? 'success' : 'warning');
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // QUEUE
        // ═══════════════════════════════════════════════════════════
        if (types.isQueue) {
            this.log('🚶 Detected Queue operations', 'system');
            this.viz.clear();
            await this.viz.renderQueue();

            // Find enqueue operations
            const enqueueMatches = mainCode.matchAll(/(?:q|queue)?\.?enqueue\s*\(\s*(\d+)\s*\)/gi);
            for (const match of enqueueMatches) {
                const val = parseInt(match[1]);
                this.log(`📥 enqueue(${val})`, 'action');
                await this.viz.enqueue(val);
                await this.viz.renderQueue();
                this.log(`✓ Enqueued ${val}`, 'success');
            }

            // Find dequeue operations
            const dequeueMatches = mainCode.matchAll(/(?:q|queue)?\.?dequeue\s*\(\s*\)/gi);
            for (const match of dequeueMatches) {
                this.log(`📤 dequeue()`, 'action');
                const dequeued = await this.viz.dequeue();
                await this.viz.renderQueue();
                this.log(dequeued ? `✓ Dequeued ${dequeued.value}` : '⚠ Queue empty', dequeued ? 'success' : 'warning');
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // BINARY SEARCH TREE
        // ═══════════════════════════════════════════════════════════
        if (types.isBST) {
            this.log('🌳 Detected BST operations', 'system');
            this.viz.bstClear();
            await this.viz.renderBST();

            // Find insert operations
            const insertMatches = mainCode.matchAll(/(?:bst|tree)?\.?insert\s*\(\s*(\d+)\s*\)/gi);
            for (const match of insertMatches) {
                const val = parseInt(match[1]);
                this.log(`📥 insert(${val})`, 'action');
                await this.viz.bstInsert(val);
                await this.viz.renderBST();
                this.log(`✓ Inserted ${val}`, 'success');
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // HEAP
        // ═══════════════════════════════════════════════════════════
        if (types.isHeap) {
            this.log('⛰️ Detected Heap operations', 'system');
            this.viz.heapClear();
            await this.viz.renderHeap();

            // Find insert operations
            const insertMatches = mainCode.matchAll(/(?:heap)?\.?insert\s*\(\s*(\d+)\s*\)/gi);
            for (const match of insertMatches) {
                const val = parseInt(match[1]);
                this.log(`📥 insert(${val})`, 'action');
                await this.viz.heapInsert(val);
                await this.viz.renderHeap();
                this.log(`✓ Inserted ${val}`, 'success');
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // TRIE
        // ═══════════════════════════════════════════════════════════
        if (types.isTrie) {
            this.log('🔤 Detected Trie operations', 'system');
            this.viz.trieClear();
            await this.viz.renderTrie();

            // Find insert operations: trie.insert("word")
            const insertMatches = mainCode.matchAll(/(?:trie)?\.?insert\s*\(\s*["']([^"']+)["']\s*\)/gi);
            for (const match of insertMatches) {
                const word = match[1];
                this.log(`📥 insert("${word}")`, 'action');
                await this.viz.trieInsert(word.toLowerCase());
                await this.viz.renderTrie();
                this.log(`✓ Inserted "${word}"`, 'success');
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // GRAPH
        // ═══════════════════════════════════════════════════════════
        if (types.isGraph) {
            this.log('🕸️ Detected Graph operations', 'system');
            
            // Try to detect number of nodes from Graph g(n) or Graph(n)
            const graphInitMatch = fullCode.match(/Graph\s*(?:g|graph)?\s*\(\s*(\d+)\s*\)/i);
            const numNodes = graphInitMatch ? parseInt(graphInitMatch[1]) : 6;
            
            this.viz.graphInit(numNodes);
            await this.viz.renderGraph();

            // Find addEdge operations
            const edgeMatches = mainCode.matchAll(/(?:g|graph)?\.?addEdge\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/gi);
            for (const match of edgeMatches) {
                const u = parseInt(match[1]);
                const v = parseInt(match[2]);
                this.log(`📥 addEdge(${u}, ${v})`, 'action');
                await this.viz.graphAddEdge(u, v);
                await this.viz.renderGraph();
                this.log(`✓ Added edge ${u} — ${v}`, 'success');
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // HASHMAP
        // ═══════════════════════════════════════════════════════════
        if (types.isHashMap) {
            this.log('🗂️ Detected HashMap operations', 'system');
            this.viz.hashMapClear();
            await this.viz.renderHashMap();

            // Find put operations: map.put("key", value)
            const putMatches = mainCode.matchAll(/(?:map)?\.?put\s*\(\s*["']([^"']+)["']\s*,\s*(\d+)\s*\)/gi);
            for (const match of putMatches) {
                const key = match[1];
                const val = parseInt(match[2]);
                this.log(`📥 put("${key}", ${val})`, 'action');
                await this.viz.hashMapPut(key, val);
                await this.viz.renderHashMap();
                this.log(`✓ Put [${key}] = ${val}`, 'success');
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // SET
        // ═══════════════════════════════════════════════════════════
        if (types.isSet) {
            this.log('🎯 Detected Set operations', 'system');
            this.viz.setClear();
            await this.viz.renderSet();

            // Find add operations
            const addMatches = mainCode.matchAll(/(?:s|set)?\.?add\s*\(\s*(\d+)\s*\)/gi);
            for (const match of addMatches) {
                const val = parseInt(match[1]);
                this.log(`📥 add(${val})`, 'action');
                await this.viz.setAdd(val);
                await this.viz.renderSet();
                this.log(`✓ Added ${val}`, 'success');
            }
            return;
        }

        // ═══════════════════════════════════════════════════════════
        // ARRAY
        // ═══════════════════════════════════════════════════════════
        if (types.isArray) {
            this.log('📊 Detected Array operations', 'system');
            this.viz.clear();
            await this.viz.renderArray();

            // Find insert operations
            const insertMatches = mainCode.matchAll(/(?:arr)?\.?insert\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/gi);
            for (const match of insertMatches) {
                const idx = parseInt(match[1]);
                const val = parseInt(match[2]);
                this.log(`📥 insert(${idx}, ${val})`, 'action');
                await this.viz.arrayInsert(idx, val);
                await this.viz.renderArray();
                this.log(`✓ Inserted ${val} at index ${idx}`, 'success');
            }
            return;
        }

        this.log('ℹ️ No recognizable operations found in code', 'info');
        this.log('💡 Try using function calls like: insertBegin(5), push(10), addEdge(0,1)', 'info');
    }

    async runDLLMenuMode() {
        this.log('📋 <b>DLL Menu Mode Active</b>', 'system');
        this.log('Simulating your code\'s menu loop...', 'info');

        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── DLL Menu ───</b>', 'menu');
            this.log('1. Insert at Beginning', 'menu');
            this.log('2. Insert at End', 'menu');
            this.log('3. Delete from Beginning', 'menu');
            this.log('4. Delete from End', 'menu');
            this.log('5. Display List', 'menu');
            this.log('6. Exit', 'menu');

            const choiceStr = await this.getInput('Enter your choice (1-6):');
            const choice = parseInt(choiceStr);

            switch (choice) {
                case 1: {
                    const valStr = await this.getInput('Enter value to insert at beginning:');
                    const val = parseInt(valStr) || 0;
                    this.log(`📥 Inserting ${val} at beginning...`, 'action');
                    await this.viz.insertBegin(val);
                    this.log('✓ Node inserted successfully', 'success');
                    break;
                }
                case 2: {
                    const valStr = await this.getInput('Enter value to insert at end:');
                    const val = parseInt(valStr) || 0;
                    this.log(`📥 Inserting ${val} at end...`, 'action');
                    await this.viz.insertEnd(val);
                    this.log('✓ Node inserted successfully', 'success');
                    break;
                }
                case 3: {
                    this.log('🗑️ Deleting from beginning...', 'action');
                    const deleted = await this.viz.deleteBegin();
                    if (deleted) {
                        this.log(`✓ Deleted node with value ${deleted.value}`, 'success');
                    } else {
                        this.log('⚠ List is empty!', 'warning');
                    }
                    break;
                }
                case 4: {
                    this.log('🗑️ Deleting from end...', 'action');
                    const deleted = await this.viz.deleteEnd();
                    if (deleted) {
                        this.log(`✓ Deleted node with value ${deleted.value}`, 'success');
                    } else {
                        this.log('⚠ List is empty!', 'warning');
                    }
                    break;
                }
                case 5: {
                    if (this.viz.nodes.length === 0) {
                        this.log('📋 List is empty', 'output');
                    } else {
                        const values = this.viz.nodes.map(n => n.value).join(' ⇄ ');
                        this.log(`📋 List: ${values}`, 'output');
                        this.log(`   Length: ${this.viz.nodes.length} nodes`, 'output');
                    }
                    break;
                }
                case 6: {
                    this.log('👋 Exiting menu...', 'info');
                    this.isRunning = false;
                    break;
                }
                default: {
                    this.log('❌ Invalid choice! Please enter 1-6', 'error');
                }
            }
        }
    }

    // SLL Menu Mode
    async runSLLMenuMode() {
        this.log('📋 <b>Singly Linked List Mode</b>', 'system');
        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── SLL Menu ───</b>', 'menu');
            this.log('1. Insert at Beginning', 'menu');
            this.log('2. Insert at End', 'menu');
            this.log('3. Delete from Beginning', 'menu');
            this.log('4. Delete from End', 'menu');
            this.log('5. Display', 'menu');
            this.log('6. Exit', 'menu');

            const choice = parseInt(await this.getInput('Choice (1-6):'));
            switch (choice) {
                case 1: {
                    const val = parseInt(await this.getInput('Value:')) || 0;
                    this.log(`📥 Inserting ${val} at beginning...`, 'action');
                    await this.viz.insertBegin(val);
                    this.log('✓ Done', 'success');
                    break;
                }
                case 2: {
                    const val = parseInt(await this.getInput('Value:')) || 0;
                    this.log(`📥 Inserting ${val} at end...`, 'action');
                    await this.viz.insertEnd(val);
                    this.log('✓ Done', 'success');
                    break;
                }
                case 3: {
                    const d = await this.viz.deleteBegin();
                    this.log(d ? `✓ Deleted ${d.value}` : '⚠ Empty!', d ? 'success' : 'warning');
                    break;
                }
                case 4: {
                    const d = await this.viz.deleteEnd();
                    this.log(d ? `✓ Deleted ${d.value}` : '⚠ Empty!', d ? 'success' : 'warning');
                    break;
                }
                case 5: {
                    const vals = this.viz.nodes.map(n => n.value).join(' → ');
                    this.log(`📋 List: ${vals || 'Empty'} → NULL`, 'output');
                    break;
                }
                case 6: this.isRunning = false; break;
                default: this.log('❌ Invalid choice!', 'error');
            }
        }
    }

    // Stack Menu Mode
    async runStackMenuMode() {
        this.log('📋 <b>Stack Mode (LIFO)</b>', 'system');
        this.viz.clear();
        await this.viz.renderStack();
        
        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── Stack Menu ───</b>', 'menu');
            this.log('1. Push', 'menu');
            this.log('2. Pop', 'menu');
            this.log('3. Peek', 'menu');
            this.log('4. Display', 'menu');
            this.log('5. Exit', 'menu');

            const choice = parseInt(await this.getInput('Choice (1-5):'));
            switch (choice) {
                case 1: {
                    const val = parseInt(await this.getInput('Value to push:')) || 0;
                    this.log(`📥 Pushing ${val}...`, 'action');
                    await this.viz.push(val);
                    await this.viz.renderStack();
                    this.log(`✓ Pushed ${val}`, 'success');
                    break;
                }
                case 2: {
                    const d = await this.viz.pop();
                    await this.viz.renderStack();
                    this.log(d !== null ? `✓ Popped ${d.value}` : '⚠ Stack underflow!', d !== null ? 'success' : 'warning');
                    break;
                }
                case 3: {
                    const top = await this.viz.peek();
                    await this.viz.renderStack(top?.id, 'highlight');
                    this.log(top !== null ? `🔍 Top: ${top.value}` : '⚠ Stack empty!', top !== null ? 'output' : 'warning');
                    break;
                }
                case 4: {
                    const vals = [...this.viz.nodes].reverse().map(n => n.value).join(' ← ');
                    this.log(`📋 Stack (top→bottom): ${vals || 'Empty'}`, 'output');
                    await this.viz.renderStack();
                    break;
                }
                case 5: this.isRunning = false; break;
                default: this.log('❌ Invalid choice!', 'error');
            }
        }
    }

    // Queue Menu Mode
    async runQueueMenuMode() {
        this.log('📋 <b>Queue Mode (FIFO)</b>', 'system');
        this.viz.clear();
        await this.viz.renderQueue();
        
        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── Queue Menu ───</b>', 'menu');
            this.log('1. Enqueue', 'menu');
            this.log('2. Dequeue', 'menu');
            this.log('3. Peek Front', 'menu');
            this.log('4. Display', 'menu');
            this.log('5. Exit', 'menu');

            const choice = parseInt(await this.getInput('Choice (1-5):'));
            switch (choice) {
                case 1: {
                    const val = parseInt(await this.getInput('Value to enqueue:')) || 0;
                    this.log(`📥 Enqueuing ${val}...`, 'action');
                    await this.viz.enqueue(val);
                    await this.viz.renderQueue();
                    this.log(`✓ Enqueued ${val}`, 'success');
                    break;
                }
                case 2: {
                    const d = await this.viz.dequeue();
                    await this.viz.renderQueue();
                    this.log(d !== null ? `✓ Dequeued ${d.value}` : '⚠ Queue underflow!', d !== null ? 'success' : 'warning');
                    break;
                }
                case 3: {
                    const front = await this.viz.front();
                    await this.viz.renderQueue(front?.id, 'highlight');
                    this.log(front !== null ? `🔍 Front: ${front.value}` : '⚠ Queue empty!', front !== null ? 'output' : 'warning');
                    break;
                }
                case 4: {
                    const vals = this.viz.nodes.map(n => n.value).join(' ← ');
                    this.log(`📋 Queue (front→rear): ${vals || 'Empty'}`, 'output');
                    await this.viz.renderQueue();
                    break;
                }
                case 5: this.isRunning = false; break;
                default: this.log('❌ Invalid choice!', 'error');
            }
        }
    }

    // BST Menu Mode
    async runBSTMenuMode() {
        this.log('📋 <b>BST Mode</b>', 'system');
        this.viz.bstRoot = null;
        await this.viz.renderBST();
        
        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── BST Menu ───</b>', 'menu');
            this.log('1. Insert', 'menu');
            this.log('2. Delete', 'menu');
            this.log('3. Search', 'menu');
            this.log('4. Inorder Traversal', 'menu');
            this.log('5. Exit', 'menu');

            const choice = parseInt(await this.getInput('Choice (1-5):'));
            switch (choice) {
                case 1: {
                    const val = parseInt(await this.getInput('Value to insert:')) || 0;
                    this.log(`🌳 Inserting ${val}...`, 'action');
                    await this.viz.bstInsert(val);
                    this.log('✓ Inserted', 'success');
                    break;
                }
                case 2: {
                    const val = parseInt(await this.getInput('Value to delete:')) || 0;
                    this.log(`🗑️ Deleting ${val}...`, 'action');
                    const d = await this.viz.bstDelete(val);
                    this.log(d ? `✓ Deleted ${val}` : `⚠ ${val} not found`, d ? 'success' : 'warning');
                    break;
                }
                case 3: {
                    const val = parseInt(await this.getInput('Value to search:')) || 0;
                    const found = this.viz.bstSearch(val);
                    this.log(found ? `✓ ${val} found!` : `✗ ${val} not found`, found ? 'success' : 'warning');
                    break;
                }
                case 4: {
                    const vals = this.viz.bstInorder();
                    this.log(`📋 Inorder: ${vals.join(' → ') || 'Empty'}`, 'output');
                    break;
                }
                case 5: this.isRunning = false; break;
                default: this.log('❌ Invalid choice!', 'error');
            }
        }
    }

    // Heap Menu Mode
    async runHeapMenuMode() {
        this.log('📋 <b>Min Heap Mode</b>', 'system');
        this.viz.heapArray = [];
        await this.viz.renderHeap();
        
        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── Heap Menu ───</b>', 'menu');
            this.log('1. Insert', 'menu');
            this.log('2. Extract Min', 'menu');
            this.log('3. Get Min', 'menu');
            this.log('4. Display', 'menu');
            this.log('5. Exit', 'menu');

            const choice = parseInt(await this.getInput('Choice (1-5):'));
            switch (choice) {
                case 1: {
                    const val = parseInt(await this.getInput('Value to insert:')) || 0;
                    this.log(`📥 Inserting ${val}...`, 'action');
                    await this.viz.heapInsert(val);
                    this.log('✓ Inserted', 'success');
                    break;
                }
                case 2: {
                    const d = await this.viz.heapExtractMin();
                    this.log(d !== null ? `✓ Extracted min: ${d}` : '⚠ Heap empty!', d !== null ? 'success' : 'warning');
                    break;
                }
                case 3: {
                    const min = this.viz.heapGetMin();
                    this.log(min !== null ? `🔍 Min: ${min}` : '⚠ Heap empty!', min !== null ? 'output' : 'warning');
                    break;
                }
                case 4: {
                    const vals = (this.viz.heapArray || []).join(', ');
                    this.log(`📋 Heap array: [${vals || 'Empty'}]`, 'output');
                    await this.viz.renderHeap();
                    break;
                }
                case 5: this.isRunning = false; break;
                default: this.log('❌ Invalid choice!', 'error');
            }
        }
    }

    // Array Menu Mode
    async runArrayMenuMode() {
        this.log('📋 <b>Array Mode</b>', 'system');
        this.viz.clear();
        await this.viz.renderArray();
        
        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── Array Menu ───</b>', 'menu');
            this.log('1. Insert at index', 'menu');
            this.log('2. Remove at index', 'menu');
            this.log('3. Get element', 'menu');
            this.log('4. Display', 'menu');
            this.log('5. Exit', 'menu');

            const choice = parseInt(await this.getInput('Choice (1-5):'));
            switch (choice) {
                case 1: {
                    const idx = parseInt(await this.getInput('Enter index:')) || 0;
                    const val = parseInt(await this.getInput('Enter value:')) || 0;
                    this.log(`📥 Inserting ${val} at index ${idx}...`, 'action');
                    await this.viz.arrayInsert(idx, val);
                    await this.viz.renderArray();
                    this.log(`✓ Inserted ${val} at index ${idx}`, 'success');
                    break;
                }
                case 2: {
                    const idx = parseInt(await this.getInput('Enter index:')) || 0;
                    const d = await this.viz.arrayRemove(idx);
                    await this.viz.renderArray();
                    this.log(d !== null ? `✓ Removed ${d}` : '⚠ Invalid index!', d !== null ? 'success' : 'warning');
                    break;
                }
                case 3: {
                    const idx = parseInt(await this.getInput('Enter index:')) || 0;
                    const val = this.viz.arrayGet(idx);
                    if (val !== null) {
                        await this.viz.renderArray(idx);
                        this.log(`🔍 Element at index ${idx}: ${val}`, 'output');
                    } else {
                        this.log('⚠ Invalid index!', 'warning');
                    }
                    break;
                }
                case 4: {
                    const vals = this.viz.nodes.map(n => n.value).join(', ');
                    this.log(`📋 Array: [${vals || 'Empty'}]`, 'output');
                    await this.viz.renderArray();
                    break;
                }
                case 5: this.isRunning = false; break;
                default: this.log('❌ Invalid choice!', 'error');
            }
        }
    }

    // Trie Menu Mode
    async runTrieMenuMode() {
        this.log('📋 <b>Trie Mode</b>', 'system');
        this.viz.trieClear();
        await this.viz.renderTrie();
        
        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── Trie Menu ───</b>', 'menu');
            this.log('1. Insert word', 'menu');
            this.log('2. Search word', 'menu');
            this.log('3. Check prefix', 'menu');
            this.log('4. Display all', 'menu');
            this.log('5. Exit', 'menu');

            const choice = parseInt(await this.getInput('Choice (1-5):'));
            switch (choice) {
                case 1: {
                    const word = await this.getInput('Enter word (lowercase):');
                    this.log(`📥 Inserting "${word}"...`, 'action');
                    await this.viz.trieInsert(word.toLowerCase());
                    await this.viz.renderTrie();
                    this.log(`✓ Inserted "${word}"`, 'success');
                    break;
                }
                case 2: {
                    const word = await this.getInput('Enter word:');
                    const found = this.viz.trieSearch(word.toLowerCase());
                    this.log(found ? `✓ "${word}" found!` : `✗ "${word}" not found`, found ? 'success' : 'warning');
                    break;
                }
                case 3: {
                    const prefix = await this.getInput('Enter prefix:');
                    const exists = this.viz.trieStartsWith(prefix.toLowerCase());
                    this.log(exists ? `✓ Prefix "${prefix}" exists!` : `✗ No such prefix`, exists ? 'success' : 'warning');
                    break;
                }
                case 4: {
                    const words = this.viz.trieGetAllWords();
                    this.log(`📋 Words: ${words.length > 0 ? words.join(', ') : 'Empty'}`, 'output');
                    break;
                }
                case 5: this.isRunning = false; break;
                default: this.log('❌ Invalid choice!', 'error');
            }
        }
    }

    // Graph Menu Mode
    async runGraphMenuMode() {
        this.log('📋 <b>Graph Mode</b>', 'system');
        const numNodes = parseInt(await this.getInput('Enter number of nodes:')) || 5;
        this.viz.graphInit(numNodes);
        await this.viz.renderGraph();
        
        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── Graph Menu ───</b>', 'menu');
            this.log('1. Add Edge', 'menu');
            this.log('2. BFS Traversal', 'menu');
            this.log('3. DFS Traversal', 'menu');
            this.log('4. Display', 'menu');
            this.log('5. Exit', 'menu');

            const choice = parseInt(await this.getInput('Choice (1-5):'));
            switch (choice) {
                case 1: {
                    const u = parseInt(await this.getInput('Enter node u:')) || 0;
                    const v = parseInt(await this.getInput('Enter node v:')) || 0;
                    this.log(`📥 Adding edge ${u} -- ${v}...`, 'action');
                    await this.viz.graphAddEdge(u, v);
                    await this.viz.renderGraph();
                    this.log(`✓ Added edge ${u} -- ${v}`, 'success');
                    break;
                }
                case 2: {
                    const start = parseInt(await this.getInput('Start node:')) || 0;
                    const traversal = await this.viz.graphBFS(start);
                    this.log(`🔍 BFS from ${start}: ${traversal.join(' → ')}`, 'output');
                    break;
                }
                case 3: {
                    const start = parseInt(await this.getInput('Start node:')) || 0;
                    const traversal = await this.viz.graphDFS(start);
                    this.log(`🔍 DFS from ${start}: ${traversal.join(' → ')}`, 'output');
                    break;
                }
                case 4: {
                    this.viz.graphDisplay(this);
                    await this.viz.renderGraph();
                    break;
                }
                case 5: this.isRunning = false; break;
                default: this.log('❌ Invalid choice!', 'error');
            }
        }
    }

    // HashMap Menu Mode
    async runHashMapMenuMode() {
        this.log('📋 <b>HashMap Mode</b>', 'system');
        this.viz.hashMapClear();
        await this.viz.renderHashMap();
        
        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── HashMap Menu ───</b>', 'menu');
            this.log('1. Put (key, value)', 'menu');
            this.log('2. Get (key)', 'menu');
            this.log('3. Remove (key)', 'menu');
            this.log('4. Display', 'menu');
            this.log('5. Exit', 'menu');

            const choice = parseInt(await this.getInput('Choice (1-5):'));
            switch (choice) {
                case 1: {
                    const key = await this.getInput('Enter key:');
                    const val = parseInt(await this.getInput('Enter value:')) || 0;
                    this.log(`📥 Putting [${key}] = ${val}...`, 'action');
                    await this.viz.hashMapPut(key, val);
                    await this.viz.renderHashMap();
                    this.log(`✓ Put [${key}] = ${val}`, 'success');
                    break;
                }
                case 2: {
                    const key = await this.getInput('Enter key:');
                    const val = this.viz.hashMapGet(key);
                    this.log(val !== null ? `🔍 [${key}] = ${val}` : `⚠ Key "${key}" not found!`, val !== null ? 'output' : 'warning');
                    break;
                }
                case 3: {
                    const key = await this.getInput('Enter key:');
                    const removed = await this.viz.hashMapRemove(key);
                    await this.viz.renderHashMap();
                    this.log(removed ? `✓ Removed "${key}"` : `⚠ Key not found!`, removed ? 'success' : 'warning');
                    break;
                }
                case 4: {
                    this.viz.hashMapDisplay(this);
                    await this.viz.renderHashMap();
                    break;
                }
                case 5: this.isRunning = false; break;
                default: this.log('❌ Invalid choice!', 'error');
            }
        }
    }

    // Set Menu Mode
    async runSetMenuMode() {
        this.log('📋 <b>Set Mode</b>', 'system');
        this.viz.setClear();
        await this.viz.renderSet();
        
        while (this.isRunning) {
            this.log('', 'divider');
            this.log('<b>─── Set Menu ───</b>', 'menu');
            this.log('1. Add element', 'menu');
            this.log('2. Remove element', 'menu');
            this.log('3. Contains', 'menu');
            this.log('4. Display', 'menu');
            this.log('5. Exit', 'menu');

            const choice = parseInt(await this.getInput('Choice (1-5):'));
            switch (choice) {
                case 1: {
                    const val = parseInt(await this.getInput('Enter value:')) || 0;
                    const added = await this.viz.setAdd(val);
                    await this.viz.renderSet();
                    this.log(added ? `✓ Added ${val}` : `⚠ ${val} already exists!`, added ? 'success' : 'warning');
                    break;
                }
                case 2: {
                    const val = parseInt(await this.getInput('Enter value:')) || 0;
                    const removed = await this.viz.setRemove(val);
                    await this.viz.renderSet();
                    this.log(removed ? `✓ Removed ${val}` : `⚠ ${val} not found!`, removed ? 'success' : 'warning');
                    break;
                }
                case 3: {
                    const val = parseInt(await this.getInput('Enter value:')) || 0;
                    const exists = this.viz.setContains(val);
                    this.log(exists ? `✓ ${val} exists!` : `✗ ${val} not found!`, exists ? 'success' : 'warning');
                    break;
                }
                case 4: {
                    const vals = this.viz.setGetAll();
                    this.log(`📋 Set: { ${vals.join(', ') || 'Empty'} }`, 'output');
                    await this.viz.renderSet();
                    break;
                }
                case 5: this.isRunning = false; break;
                default: this.log('❌ Invalid choice!', 'error');
            }
        }
    }

    stop() {
        this.isRunning = false;
        this.inputPanel.style.display = 'none';
        if (this.inputResolver) {
            this.inputResolver('');
            this.inputResolver = null;
        }
    }
}

export function initVisualizer() {
    const canvas = document.getElementById('visual-canvas');
    const consoleOutput = document.getElementById('console-output');
    const inputPanel = document.getElementById('input-panel');
    const inputPrompt = document.getElementById('input-prompt');
    const inputField = document.getElementById('input-field');
    const inputSubmit = document.getElementById('input-submit');
    const runBtn = document.getElementById('run-btn');
    const clearBtn = document.getElementById('clear-btn');
    const speedSlider = document.getElementById('speed-slider');
    const langSelect = document.getElementById('lang-select');

    if (!canvas) return;

    let editor = null;
    const visualizer = new DLLVisualizer(canvas);
    const engine = new CodeEngine(visualizer, consoleOutput, inputPanel, inputPrompt, inputField);

    // Load Ace Editor
    function loadAceEditor() {
        return new Promise(resolve => {
            if (window.ace) {
                resolve(window.ace);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.6/ace.min.js';
            script.onload = () => resolve(window.ace);
            script.onerror = () => resolve(null);
            document.head.appendChild(script);
        });
    }

    async function initEditor() {
        const ace = await loadAceEditor();
        if (!ace) {
            console.error('Failed to load Ace editor');
            return;
        }

        editor = ace.edit('ace-editor');
        editor.setTheme('ace/theme/one_dark');
        editor.session.setMode('ace/mode/c_cpp');
        editor.setOptions({
            fontSize: '14px',
            fontFamily: "'Fira Code', 'Consolas', monospace",
            showPrintMargin: false,
            tabSize: 4,
            useSoftTabs: true
        });
        editor.setValue(getDefaultDLLCode(), -1);
        editor.focus();
    }

    // Event Handlers
    if (runBtn) {
        runBtn.addEventListener('click', async () => {
            if (!editor) return;
            runBtn.disabled = true;
            runBtn.textContent = '⏳ Running...';
            await engine.runCode(editor.getValue());
            runBtn.disabled = false;
            runBtn.textContent = '▶ Run & Visualize';
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            engine.stop();
            engine.clearConsole();
            visualizer.clear();
        });
    }

    if (speedSlider) {
        speedSlider.addEventListener('input', () => {
            visualizer.setSpeed(parseInt(speedSlider.value));
        });
    }

    if (inputSubmit) {
        inputSubmit.addEventListener('click', () => engine.submitInput());
    }

    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') engine.submitInput();
        });
    }

    if (langSelect) {
        langSelect.addEventListener('change', () => {
            if (!editor) return;
            const modeMap = {
                'cpp': 'c_cpp',
                'python': 'python',
                'java': 'java'
            };
            editor.session.setMode('ace/mode/' + (modeMap[langSelect.value] || 'c_cpp'));
        });
    }

    // Sample buttons
    document.querySelectorAll('.sample-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!editor) return;
            
            // Update active state
            document.querySelectorAll('.sample-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const sample = btn.dataset.sample;
            const sampleCodes = {
                'array': getArrayCode(),
                'll': getLinkedListCode(),
                'dll': getDefaultDLLCode(),
                'stack': getStackCode(),
                'queue': getQueueCode(),
                'bst': getBSTCode(),
                'heap': getHeapCode(),
                'trie': getTrieCode(),
                'graph': getGraphCode(),
                'hashmap': getHashMapCode(),
                'set': getSetCode()
            };
            
            if (sampleCodes[sample]) {
                editor.setValue(sampleCodes[sample], -1);
                // Stop any running visualization
                engine.stop();
                engine.clearConsole();
                visualizer.clear();
            }
        });
    });

    // Initialize
    initEditor();
    visualizer.render();
    
    // Check for URL sample parameter (from explorer page)
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const sampleParam = urlParams.get('sample');
    if (sampleParam && editor) {
        setTimeout(() => {
            const sampleCodes = {
                'array': getArrayCode(),
                'll': getLinkedListCode(),
                'dll': getDefaultDLLCode(),
                'stack': getStackCode(),
                'queue': getQueueCode(),
                'bst': getBSTCode(),
                'heap': getHeapCode(),
                'trie': getTrieCode(),
                'graph': getGraphCode(),
                'hashmap': getHashMapCode(),
                'set': getSetCode()
            };
            
            if (sampleCodes[sampleParam]) {
                editor.setValue(sampleCodes[sampleParam], -1);
                // Update active button
                document.querySelectorAll('.sample-btn').forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.sample === sampleParam) {
                        b.classList.add('active');
                    }
                });
            }
        }, 500);
    }
}

function getDefaultDLLCode() {
    return `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* prev;
    Node* next;
};

Node* head = NULL;
Node* tail = NULL;

void insertBegin(int value) {
    Node* newNode = new Node();
    newNode->data = value;
    newNode->prev = NULL;
    newNode->next = head;
    if (head != NULL) {
        head->prev = newNode;
    } else {
        tail = newNode;
    }
    head = newNode;
    cout << "Inserted " << value << " at beginning" << endl;
}

void insertEnd(int value) {
    Node* newNode = new Node();
    newNode->data = value;
    newNode->next = NULL;
    if (head == NULL) {
        newNode->prev = NULL;
        head = tail = newNode;
        return;
    }
    tail->next = newNode;
    newNode->prev = tail;
    tail = newNode;
    cout << "Inserted " << value << " at end" << endl;
}

void deleteBegin() {
    if (head == NULL) {
        cout << "List is empty!" << endl;
        return;
    }
    Node* temp = head;
    head = head->next;
    if (head != NULL) {
        head->prev = NULL;
    } else {
        tail = NULL;
    }
    cout << "Deleted " << temp->data << " from beginning" << endl;
    delete temp;
}

void deleteEnd() {
    if (head == NULL) {
        cout << "List is empty!" << endl;
        return;
    }
    Node* temp = tail;
    tail = tail->prev;
    if (tail != NULL) {
        tail->next = NULL;
    } else {
        head = NULL;
    }
    cout << "Deleted " << temp->data << " from end" << endl;
    delete temp;
}

void display() {
    if (head == NULL) {
        cout << "List is empty!" << endl;
        return;
    }
    Node* temp = head;
    cout << "List: ";
    while (temp != NULL) {
        cout << temp->data;
        if (temp->next != NULL) cout << " <-> ";
        temp = temp->next;
    }
    cout << endl;
}

int main() {
    int choice, value;
    
    while (true) {
        cout << "\\n--- Doubly Linked List Menu ---" << endl;
        cout << "1. Insert at Beginning" << endl;
        cout << "2. Insert at End" << endl;
        cout << "3. Delete from Beginning" << endl;
        cout << "4. Delete from End" << endl;
        cout << "5. Display List" << endl;
        cout << "6. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter value: ";
                cin >> value;
                insertBegin(value);
                break;
            case 2:
                cout << "Enter value: ";
                cin >> value;
                insertEnd(value);
                break;
            case 3:
                deleteBegin();
                break;
            case 4:
                deleteEnd();
                break;
            case 5:
                display();
                break;
            case 6:
                cout << "Exiting..." << endl;
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    
    return 0;
}`;
}

function getStackCode() {
    return `#include <iostream>
using namespace std;

#define MAX 100

class Stack {
    int arr[MAX];
    int top;
public:
    Stack() { top = -1; }
    
    bool isEmpty() { return top == -1; }
    bool isFull() { return top == MAX - 1; }
    
    void push(int value) {
        if (isFull()) {
            cout << "Stack Overflow!" << endl;
            return;
        }
        arr[++top] = value;
        cout << "Pushed " << value << " to stack" << endl;
    }
    
    int pop() {
        if (isEmpty()) {
            cout << "Stack Underflow!" << endl;
            return -1;
        }
        int val = arr[top--];
        cout << "Popped " << val << " from stack" << endl;
        return val;
    }
    
    int peek() {
        if (isEmpty()) {
            cout << "Stack is empty!" << endl;
            return -1;
        }
        return arr[top];
    }
    
    void display() {
        if (isEmpty()) {
            cout << "Stack is empty!" << endl;
            return;
        }
        cout << "Stack (top to bottom): ";
        for (int i = top; i >= 0; i--)
            cout << arr[i] << " ";
        cout << endl;
    }
};

int main() {
    Stack s;
    int choice, value;
    
    while (true) {
        cout << "\\n--- Stack Menu ---" << endl;
        cout << "1. Push" << endl;
        cout << "2. Pop" << endl;
        cout << "3. Peek" << endl;
        cout << "4. Display" << endl;
        cout << "5. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter value: ";
                cin >> value;
                s.push(value);
                break;
            case 2:
                s.pop();
                break;
            case 3:
                value = s.peek();
                if (value != -1)
                    cout << "Top element: " << value << endl;
                break;
            case 4:
                s.display();
                break;
            case 5:
                cout << "Exiting..." << endl;
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}

function getQueueCode() {
    return `#include <iostream>
using namespace std;

#define MAX 100

class Queue {
    int arr[MAX];
    int front, rear;
public:
    Queue() { front = rear = -1; }
    
    bool isEmpty() { return front == -1; }
    bool isFull() { return rear == MAX - 1; }
    
    void enqueue(int value) {
        if (isFull()) {
            cout << "Queue Overflow!" << endl;
            return;
        }
        if (front == -1) front = 0;
        arr[++rear] = value;
        cout << "Enqueued " << value << " to queue" << endl;
    }
    
    int dequeue() {
        if (isEmpty()) {
            cout << "Queue Underflow!" << endl;
            return -1;
        }
        int val = arr[front];
        if (front == rear) {
            front = rear = -1;
        } else {
            front++;
        }
        cout << "Dequeued " << val << " from queue" << endl;
        return val;
    }
    
    int peek() {
        if (isEmpty()) {
            cout << "Queue is empty!" << endl;
            return -1;
        }
        return arr[front];
    }
    
    void display() {
        if (isEmpty()) {
            cout << "Queue is empty!" << endl;
            return;
        }
        cout << "Queue (front to rear): ";
        for (int i = front; i <= rear; i++)
            cout << arr[i] << " ";
        cout << endl;
    }
};

int main() {
    Queue q;
    int choice, value;
    
    while (true) {
        cout << "\\n--- Queue Menu ---" << endl;
        cout << "1. Enqueue" << endl;
        cout << "2. Dequeue" << endl;
        cout << "3. Peek Front" << endl;
        cout << "4. Display" << endl;
        cout << "5. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter value: ";
                cin >> value;
                q.enqueue(value);
                break;
            case 2:
                q.dequeue();
                break;
            case 3:
                value = q.peek();
                if (value != -1)
                    cout << "Front element: " << value << endl;
                break;
            case 4:
                q.display();
                break;
            case 5:
                cout << "Exiting..." << endl;
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}

function getSLLCode() {
    return `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

Node* head = NULL;

void insertBegin(int value) {
    Node* newNode = new Node();
    newNode->data = value;
    newNode->next = head;
    head = newNode;
    cout << "Inserted " << value << " at beginning" << endl;
}

void insertEnd(int value) {
    Node* newNode = new Node();
    newNode->data = value;
    newNode->next = NULL;
    
    if (head == NULL) {
        head = newNode;
        return;
    }
    
    Node* temp = head;
    while (temp->next != NULL)
        temp = temp->next;
    temp->next = newNode;
    cout << "Inserted " << value << " at end" << endl;
}

void deleteBegin() {
    if (head == NULL) {
        cout << "List is empty!" << endl;
        return;
    }
    Node* temp = head;
    head = head->next;
    cout << "Deleted " << temp->data << " from beginning" << endl;
    delete temp;
}

void deleteEnd() {
    if (head == NULL) {
        cout << "List is empty!" << endl;
        return;
    }
    if (head->next == NULL) {
        cout << "Deleted " << head->data << " from end" << endl;
        delete head;
        head = NULL;
        return;
    }
    Node* temp = head;
    while (temp->next->next != NULL)
        temp = temp->next;
    cout << "Deleted " << temp->next->data << " from end" << endl;
    delete temp->next;
    temp->next = NULL;
}

void display() {
    if (head == NULL) {
        cout << "List is empty!" << endl;
        return;
    }
    Node* temp = head;
    cout << "List: ";
    while (temp != NULL) {
        cout << temp->data;
        if (temp->next != NULL) cout << " -> ";
        temp = temp->next;
    }
    cout << " -> NULL" << endl;
}

int main() {
    int choice, value;
    
    while (true) {
        cout << "\\n--- Singly Linked List Menu ---" << endl;
        cout << "1. Insert at Beginning" << endl;
        cout << "2. Insert at End" << endl;
        cout << "3. Delete from Beginning" << endl;
        cout << "4. Delete from End" << endl;
        cout << "5. Display List" << endl;
        cout << "6. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter value: ";
                cin >> value;
                insertBegin(value);
                break;
            case 2:
                cout << "Enter value: ";
                cin >> value;
                insertEnd(value);
                break;
            case 3:
                deleteBegin();
                break;
            case 4:
                deleteEnd();
                break;
            case 5:
                display();
                break;
            case 6:
                cout << "Exiting..." << endl;
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}

function getBSTCode() {
    return `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* left;
    Node* right;
};

Node* root = NULL;

Node* createNode(int value) {
    Node* newNode = new Node();
    newNode->data = value;
    newNode->left = newNode->right = NULL;
    return newNode;
}

Node* insert(Node* node, int value) {
    if (node == NULL) {
        cout << "Inserted " << value << " into BST" << endl;
        return createNode(value);
    }
    if (value < node->data)
        node->left = insert(node->left, value);
    else if (value > node->data)
        node->right = insert(node->right, value);
    return node;
}

Node* minValueNode(Node* node) {
    Node* current = node;
    while (current && current->left != NULL)
        current = current->left;
    return current;
}

Node* deleteNode(Node* node, int value) {
    if (node == NULL) return node;
    
    if (value < node->data)
        node->left = deleteNode(node->left, value);
    else if (value > node->data)
        node->right = deleteNode(node->right, value);
    else {
        if (node->left == NULL) {
            Node* temp = node->right;
            delete node;
            cout << "Deleted " << value << " from BST" << endl;
            return temp;
        }
        else if (node->right == NULL) {
            Node* temp = node->left;
            delete node;
            cout << "Deleted " << value << " from BST" << endl;
            return temp;
        }
        Node* temp = minValueNode(node->right);
        node->data = temp->data;
        node->right = deleteNode(node->right, temp->data);
    }
    return node;
}

bool search(Node* node, int value) {
    if (node == NULL) return false;
    if (node->data == value) return true;
    if (value < node->data)
        return search(node->left, value);
    return search(node->right, value);
}

void inorder(Node* node) {
    if (node != NULL) {
        inorder(node->left);
        cout << node->data << " ";
        inorder(node->right);
    }
}

void preorder(Node* node) {
    if (node != NULL) {
        cout << node->data << " ";
        preorder(node->left);
        preorder(node->right);
    }
}

void postorder(Node* node) {
    if (node != NULL) {
        postorder(node->left);
        postorder(node->right);
        cout << node->data << " ";
    }
}

int main() {
    int choice, value;
    
    while (true) {
        cout << "\\n--- BST Menu ---" << endl;
        cout << "1. Insert" << endl;
        cout << "2. Delete" << endl;
        cout << "3. Search" << endl;
        cout << "4. Inorder Traversal" << endl;
        cout << "5. Preorder Traversal" << endl;
        cout << "6. Postorder Traversal" << endl;
        cout << "7. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter value: ";
                cin >> value;
                root = insert(root, value);
                break;
            case 2:
                cout << "Enter value: ";
                cin >> value;
                root = deleteNode(root, value);
                break;
            case 3:
                cout << "Enter value: ";
                cin >> value;
                if (search(root, value))
                    cout << value << " found in BST" << endl;
                else
                    cout << value << " not found in BST" << endl;
                break;
            case 4:
                cout << "Inorder: ";
                inorder(root);
                cout << endl;
                break;
            case 5:
                cout << "Preorder: ";
                preorder(root);
                cout << endl;
                break;
            case 6:
                cout << "Postorder: ";
                postorder(root);
                cout << endl;
                break;
            case 7:
                cout << "Exiting..." << endl;
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}

function getHeapCode() {
    return `#include <iostream>
using namespace std;

class MinHeap {
    int* arr;
    int capacity;
    int size;
    
    int parent(int i) { return (i - 1) / 2; }
    int left(int i) { return 2 * i + 1; }
    int right(int i) { return 2 * i + 2; }
    
    void heapifyUp(int i) {
        while (i > 0 && arr[parent(i)] > arr[i]) {
            swap(arr[i], arr[parent(i)]);
            i = parent(i);
        }
    }
    
    void heapifyDown(int i) {
        int smallest = i;
        int l = left(i);
        int r = right(i);
        
        if (l < size && arr[l] < arr[smallest])
            smallest = l;
        if (r < size && arr[r] < arr[smallest])
            smallest = r;
        
        if (smallest != i) {
            swap(arr[i], arr[smallest]);
            heapifyDown(smallest);
        }
    }
    
public:
    MinHeap(int cap) {
        capacity = cap;
        size = 0;
        arr = new int[cap];
    }
    
    void insert(int value) {
        if (size == capacity) {
            cout << "Heap Overflow!" << endl;
            return;
        }
        arr[size] = value;
        size++;
        heapifyUp(size - 1);
        cout << "Inserted " << value << " into heap" << endl;
    }
    
    int extractMin() {
        if (size == 0) {
            cout << "Heap is empty!" << endl;
            return -1;
        }
        int root = arr[0];
        arr[0] = arr[size - 1];
        size--;
        heapifyDown(0);
        cout << "Extracted min: " << root << endl;
        return root;
    }
    
    int getMin() {
        if (size == 0) {
            cout << "Heap is empty!" << endl;
            return -1;
        }
        return arr[0];
    }
    
    void display() {
        if (size == 0) {
            cout << "Heap is empty!" << endl;
            return;
        }
        cout << "Heap array: ";
        for (int i = 0; i < size; i++)
            cout << arr[i] << " ";
        cout << endl;
    }
};

int main() {
    MinHeap heap(100);
    int choice, value;
    
    while (true) {
        cout << "\\n--- Min Heap Menu ---" << endl;
        cout << "1. Insert" << endl;
        cout << "2. Extract Min" << endl;
        cout << "3. Get Min" << endl;
        cout << "4. Display" << endl;
        cout << "5. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter value: ";
                cin >> value;
                heap.insert(value);
                break;
            case 2:
                heap.extractMin();
                break;
            case 3:
                value = heap.getMin();
                if (value != -1)
                    cout << "Min element: " << value << endl;
                break;
            case 4:
                heap.display();
                break;
            case 5:
                cout << "Exiting..." << endl;
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}

function getArrayCode() {
    return `#include <iostream>
using namespace std;

class Array {
    int* arr;
    int size;
    int capacity;
public:
    Array(int cap) {
        capacity = cap;
        size = 0;
        arr = new int[cap];
    }
    
    void insert(int index, int value) {
        if (size >= capacity) {
            cout << "Array is full!" << endl;
            return;
        }
        if (index < 0 || index > size) {
            cout << "Invalid index!" << endl;
            return;
        }
        for (int i = size; i > index; i--)
            arr[i] = arr[i-1];
        arr[index] = value;
        size++;
        cout << "Inserted " << value << " at index " << index << endl;
    }
    
    void remove(int index) {
        if (size == 0) {
            cout << "Array is empty!" << endl;
            return;
        }
        if (index < 0 || index >= size) {
            cout << "Invalid index!" << endl;
            return;
        }
        int val = arr[index];
        for (int i = index; i < size - 1; i++)
            arr[i] = arr[i+1];
        size--;
        cout << "Removed " << val << " from index " << index << endl;
    }
    
    int get(int index) {
        if (index < 0 || index >= size) return -1;
        return arr[index];
    }
    
    void display() {
        if (size == 0) {
            cout << "Array is empty!" << endl;
            return;
        }
        cout << "Array: [";
        for (int i = 0; i < size; i++) {
            cout << arr[i];
            if (i < size - 1) cout << ", ";
        }
        cout << "]" << endl;
    }
};

int main() {
    Array arr(10);
    int choice, index, value;
    
    while (true) {
        cout << "\\n--- Array Menu ---" << endl;
        cout << "1. Insert at index" << endl;
        cout << "2. Remove at index" << endl;
        cout << "3. Get element" << endl;
        cout << "4. Display" << endl;
        cout << "5. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter index: ";
                cin >> index;
                cout << "Enter value: ";
                cin >> value;
                arr.insert(index, value);
                break;
            case 2:
                cout << "Enter index: ";
                cin >> index;
                arr.remove(index);
                break;
            case 3:
                cout << "Enter index: ";
                cin >> index;
                value = arr.get(index);
                if (value != -1)
                    cout << "Element: " << value << endl;
                else
                    cout << "Invalid index!" << endl;
                break;
            case 4:
                arr.display();
                break;
            case 5:
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}

function getLinkedListCode() {
    return `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

Node* head = NULL;

void insertBegin(int value) {
    Node* newNode = new Node();
    newNode->data = value;
    newNode->next = head;
    head = newNode;
    cout << "Inserted " << value << " at beginning" << endl;
}

void insertEnd(int value) {
    Node* newNode = new Node();
    newNode->data = value;
    newNode->next = NULL;
    
    if (head == NULL) {
        head = newNode;
    } else {
        Node* temp = head;
        while (temp->next != NULL)
            temp = temp->next;
        temp->next = newNode;
    }
    cout << "Inserted " << value << " at end" << endl;
}

void deleteBegin() {
    if (head == NULL) {
        cout << "List is empty!" << endl;
        return;
    }
    Node* temp = head;
    head = head->next;
    cout << "Deleted " << temp->data << endl;
    delete temp;
}

void deleteEnd() {
    if (head == NULL) {
        cout << "List is empty!" << endl;
        return;
    }
    if (head->next == NULL) {
        cout << "Deleted " << head->data << endl;
        delete head;
        head = NULL;
        return;
    }
    Node* temp = head;
    while (temp->next->next != NULL)
        temp = temp->next;
    cout << "Deleted " << temp->next->data << endl;
    delete temp->next;
    temp->next = NULL;
}

void display() {
    if (head == NULL) {
        cout << "List: NULL" << endl;
        return;
    }
    cout << "List: head -> ";
    Node* temp = head;
    while (temp != NULL) {
        cout << "[" << temp->data << "] -> ";
        temp = temp->next;
    }
    cout << "NULL" << endl;
}

int main() {
    int choice, value;
    
    while (true) {
        cout << "\\n--- Linked List Menu ---" << endl;
        cout << "1. Insert at Beginning" << endl;
        cout << "2. Insert at End" << endl;
        cout << "3. Delete from Beginning" << endl;
        cout << "4. Delete from End" << endl;
        cout << "5. Display" << endl;
        cout << "6. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter value: ";
                cin >> value;
                insertBegin(value);
                break;
            case 2:
                cout << "Enter value: ";
                cin >> value;
                insertEnd(value);
                break;
            case 3:
                deleteBegin();
                break;
            case 4:
                deleteEnd();
                break;
            case 5:
                display();
                break;
            case 6:
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}

function getTrieCode() {
    return `#include <iostream>
#include <string>
using namespace std;

#define ALPHABET_SIZE 26

struct TrieNode {
    TrieNode* children[ALPHABET_SIZE];
    bool isEndOfWord;
    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < ALPHABET_SIZE; i++)
            children[i] = NULL;
    }
};

class Trie {
    TrieNode* root;
public:
    Trie() { root = new TrieNode(); }
    
    void insert(string word) {
        TrieNode* curr = root;
        for (char c : word) {
            int i = c - 'a';
            if (!curr->children[i])
                curr->children[i] = new TrieNode();
            curr = curr->children[i];
        }
        curr->isEndOfWord = true;
        cout << "Inserted '" << word << "'" << endl;
    }
    
    bool search(string word) {
        TrieNode* curr = root;
        for (char c : word) {
            int i = c - 'a';
            if (!curr->children[i]) return false;
            curr = curr->children[i];
        }
        return curr->isEndOfWord;
    }
    
    bool startsWith(string prefix) {
        TrieNode* curr = root;
        for (char c : prefix) {
            int i = c - 'a';
            if (!curr->children[i]) return false;
            curr = curr->children[i];
        }
        return true;
    }
    
    void showAll(TrieNode* node, string word) {
        if (node->isEndOfWord)
            cout << "  " << word << endl;
        for (int i = 0; i < ALPHABET_SIZE; i++)
            if (node->children[i])
                showAll(node->children[i], word + char('a' + i));
    }
    
    void display() {
        cout << "Words in Trie:" << endl;
        showAll(root, "");
    }
};

int main() {
    Trie trie;
    int choice;
    string word;
    
    while (true) {
        cout << "\\n--- Trie Menu ---" << endl;
        cout << "1. Insert word" << endl;
        cout << "2. Search word" << endl;
        cout << "3. Check prefix" << endl;
        cout << "4. Display all" << endl;
        cout << "5. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter word (lowercase): ";
                cin >> word;
                trie.insert(word);
                break;
            case 2:
                cout << "Enter word: ";
                cin >> word;
                cout << (trie.search(word) ? "Found!" : "Not found") << endl;
                break;
            case 3:
                cout << "Enter prefix: ";
                cin >> word;
                cout << (trie.startsWith(word) ? "Prefix exists!" : "No such prefix") << endl;
                break;
            case 4:
                trie.display();
                break;
            case 5:
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}

function getGraphCode() {
    return `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

class Graph {
    int V;
    vector<int>* adj;
public:
    Graph(int v) {
        V = v;
        adj = new vector<int>[v];
    }
    
    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
        cout << "Added edge: " << u << " -- " << v << endl;
    }
    
    void BFS(int start) {
        vector<bool> visited(V, false);
        queue<int> q;
        visited[start] = true;
        q.push(start);
        
        cout << "BFS from " << start << ": ";
        while (!q.empty()) {
            int node = q.front();
            q.pop();
            cout << node << " ";
            
            for (int n : adj[node]) {
                if (!visited[n]) {
                    visited[n] = true;
                    q.push(n);
                }
            }
        }
        cout << endl;
    }
    
    void DFSUtil(int node, vector<bool>& visited) {
        visited[node] = true;
        cout << node << " ";
        for (int n : adj[node])
            if (!visited[n])
                DFSUtil(n, visited);
    }
    
    void DFS(int start) {
        vector<bool> visited(V, false);
        cout << "DFS from " << start << ": ";
        DFSUtil(start, visited);
        cout << endl;
    }
    
    void display() {
        cout << "Graph (Adjacency List):" << endl;
        for (int i = 0; i < V; i++) {
            cout << i << " -> ";
            for (int j : adj[i])
                cout << j << " ";
            cout << endl;
        }
    }
};

int main() {
    int n;
    cout << "Enter number of nodes: ";
    cin >> n;
    
    Graph g(n);
    int choice, u, v;
    
    while (true) {
        cout << "\\n--- Graph Menu ---" << endl;
        cout << "1. Add Edge" << endl;
        cout << "2. BFS Traversal" << endl;
        cout << "3. DFS Traversal" << endl;
        cout << "4. Display" << endl;
        cout << "5. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter edge (u v): ";
                cin >> u >> v;
                g.addEdge(u, v);
                break;
            case 2:
                cout << "Start node: ";
                cin >> u;
                g.BFS(u);
                break;
            case 3:
                cout << "Start node: ";
                cin >> u;
                g.DFS(u);
                break;
            case 4:
                g.display();
                break;
            case 5:
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}

function getHashMapCode() {
    return `#include <iostream>
#include <string>
using namespace std;

#define SIZE 10

struct Entry {
    string key;
    int value;
    Entry* next;
    Entry(string k, int v) : key(k), value(v), next(NULL) {}
};

class HashMap {
    Entry* table[SIZE];
    
    int hash(string key) {
        int h = 0;
        for (char c : key)
            h = (h * 31 + c) % SIZE;
        return h;
    }
public:
    HashMap() {
        for (int i = 0; i < SIZE; i++)
            table[i] = NULL;
    }
    
    void put(string key, int value) {
        int idx = hash(key);
        Entry* e = table[idx];
        while (e) {
            if (e->key == key) {
                e->value = value;
                cout << "Updated [" << key << "] = " << value << endl;
                return;
            }
            e = e->next;
        }
        Entry* newEntry = new Entry(key, value);
        newEntry->next = table[idx];
        table[idx] = newEntry;
        cout << "Inserted [" << key << "] = " << value << endl;
    }
    
    int get(string key) {
        int idx = hash(key);
        Entry* e = table[idx];
        while (e) {
            if (e->key == key)
                return e->value;
            e = e->next;
        }
        return -1;
    }
    
    void remove(string key) {
        int idx = hash(key);
        Entry* e = table[idx];
        Entry* prev = NULL;
        while (e) {
            if (e->key == key) {
                if (prev) prev->next = e->next;
                else table[idx] = e->next;
                delete e;
                cout << "Removed key: " << key << endl;
                return;
            }
            prev = e;
            e = e->next;
        }
        cout << "Key not found!" << endl;
    }
    
    void display() {
        cout << "HashMap:" << endl;
        for (int i = 0; i < SIZE; i++) {
            cout << "[" << i << "]: ";
            Entry* e = table[i];
            while (e) {
                cout << "{" << e->key << ":" << e->value << "} -> ";
                e = e->next;
            }
            cout << "NULL" << endl;
        }
    }
};

int main() {
    HashMap map;
    int choice, value;
    string key;
    
    while (true) {
        cout << "\\n--- HashMap Menu ---" << endl;
        cout << "1. Put (key, value)" << endl;
        cout << "2. Get (key)" << endl;
        cout << "3. Remove (key)" << endl;
        cout << "4. Display" << endl;
        cout << "5. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter key: ";
                cin >> key;
                cout << "Enter value: ";
                cin >> value;
                map.put(key, value);
                break;
            case 2:
                cout << "Enter key: ";
                cin >> key;
                value = map.get(key);
                if (value != -1)
                    cout << "Value: " << value << endl;
                else
                    cout << "Key not found!" << endl;
                break;
            case 3:
                cout << "Enter key: ";
                cin >> key;
                map.remove(key);
                break;
            case 4:
                map.display();
                break;
            case 5:
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}

function getSetCode() {
    return `#include <iostream>
using namespace std;

#define SIZE 10

struct Node {
    int value;
    Node* next;
    Node(int v) : value(v), next(NULL) {}
};

class Set {
    Node* table[SIZE];
    int count;
    
    int hash(int v) { return abs(v) % SIZE; }
public:
    Set() {
        count = 0;
        for (int i = 0; i < SIZE; i++)
            table[i] = NULL;
    }
    
    bool contains(int v) {
        Node* n = table[hash(v)];
        while (n) {
            if (n->value == v) return true;
            n = n->next;
        }
        return false;
    }
    
    void add(int v) {
        if (contains(v)) {
            cout << v << " already exists!" << endl;
            return;
        }
        int idx = hash(v);
        Node* n = new Node(v);
        n->next = table[idx];
        table[idx] = n;
        count++;
        cout << "Added " << v << endl;
    }
    
    void remove(int v) {
        int idx = hash(v);
        Node* n = table[idx];
        Node* prev = NULL;
        while (n) {
            if (n->value == v) {
                if (prev) prev->next = n->next;
                else table[idx] = n->next;
                delete n;
                count--;
                cout << "Removed " << v << endl;
                return;
            }
            prev = n;
            n = n->next;
        }
        cout << v << " not found!" << endl;
    }
    
    void display() {
        if (count == 0) {
            cout << "Set is empty!" << endl;
            return;
        }
        cout << "Set: { ";
        bool first = true;
        for (int i = 0; i < SIZE; i++) {
            Node* n = table[i];
            while (n) {
                if (!first) cout << ", ";
                cout << n->value;
                first = false;
                n = n->next;
            }
        }
        cout << " } (size: " << count << ")" << endl;
    }
};

int main() {
    Set s;
    int choice, value;
    
    while (true) {
        cout << "\\n--- Set Menu ---" << endl;
        cout << "1. Add element" << endl;
        cout << "2. Remove element" << endl;
        cout << "3. Contains" << endl;
        cout << "4. Display" << endl;
        cout << "5. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                cout << "Enter value: ";
                cin >> value;
                s.add(value);
                break;
            case 2:
                cout << "Enter value: ";
                cin >> value;
                s.remove(value);
                break;
            case 3:
                cout << "Enter value: ";
                cin >> value;
                cout << (s.contains(value) ? "Exists!" : "Not found!") << endl;
                break;
            case 4:
                s.display();
                break;
            case 5:
                return 0;
            default:
                cout << "Invalid choice!" << endl;
        }
    }
    return 0;
}`;
}