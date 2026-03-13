// ════════════════════════════════════════════════════════════
//  MemViz — Interactive Data Structure Visualizer
//  Animated DLL, Stack, Queue, BST with user controls
// ════════════════════════════════════════════════════════════

export function renderInteractivePage() {
    return `
    <div class="interactive-page">
        <div class="interactive-header">
            <h1 class="interactive-title">🔗 Interactive Data Structures</h1>
            <p class="interactive-subtitle">Click buttons to manipulate data structures and watch the animations!</p>
        </div>
        
        <div class="ds-selector">
            <button class="ds-tab active" data-ds="dll">Doubly Linked List</button>
            <button class="ds-tab" data-ds="sll">Singly Linked List</button>
            <button class="ds-tab" data-ds="stack">Stack</button>
            <button class="ds-tab" data-ds="queue">Queue</button>
            <button class="ds-tab" data-ds="bst">BST</button>
        </div>

        <div class="interactive-container">
            <!-- Controls Panel -->
            <div class="controls-panel">
                <div class="control-group">
                    <label class="control-label">Value:</label>
                    <input type="number" id="node-value" class="value-input" value="10" min="0" max="999">
                </div>
                
                <div class="control-group" id="position-group" style="display:none">
                    <label class="control-label">Position:</label>
                    <input type="number" id="node-position" class="value-input" value="0" min="0" max="99">
                </div>

                <div class="button-group" id="dll-controls">
                    <button class="action-btn insert-btn" data-action="insertBegin">
                        <span class="btn-icon">⇤</span> Insert at Beginning
                    </button>
                    <button class="action-btn insert-btn" data-action="insertEnd">
                        Insert at End <span class="btn-icon">⇥</span>
                    </button>
                    <button class="action-btn insert-btn" data-action="insertMiddle">
                        <span class="btn-icon">⇟</span> Insert at Position
                    </button>
                    <button class="action-btn delete-btn" data-action="deleteBegin">
                        <span class="btn-icon">✕</span> Delete from Beginning
                    </button>
                    <button class="action-btn delete-btn" data-action="deleteEnd">
                        Delete from End <span class="btn-icon">✕</span>
                    </button>
                    <button class="action-btn delete-btn" data-action="deleteMiddle">
                        <span class="btn-icon">✕</span> Delete at Position
                    </button>
                    <button class="action-btn clear-btn" data-action="clear">
                        <span class="btn-icon">⟲</span> Clear All
                    </button>
                </div>
            </div>

            <!-- Visualization Area -->
            <div class="viz-area">
                <div class="viz-canvas" id="viz-canvas">
                    <div class="empty-dll">
                        <div class="null-marker">NULL</div>
                        <div class="head-pointer">head →</div>
                        <div class="empty-text">Click "Insert" to add nodes</div>
                    </div>
                </div>
            </div>

            <!-- Info Panel -->
            <div class="info-panel">
                <div class="info-title">📝 Operation Log</div>
                <div class="log-container" id="log-container">
                    <div class="log-item log-info">Ready. Enter a value and click an operation.</div>
                </div>
            </div>
        </div>

        <!-- Code Preview -->
        <div class="code-preview">
            <div class="code-title">💻 Equivalent C++ Code</div>
            <pre class="code-block" id="code-block">// Operations will show equivalent code here</pre>
        </div>
    </div>`;
}

// DLL Node class
class DLLNode {
    constructor(value) {
        this.value = value;
        this.prev = null;
        this.next = null;
        this.id = 'node-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    }
}

// DLL class with animations
class DoublyLinkedList {
    constructor(canvas, logContainer, codeBlock) {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.canvas = canvas;
        this.logContainer = logContainer;
        this.codeBlock = codeBlock;
    }

    log(message, type = 'info') {
        const item = document.createElement('div');
        item.className = 'log-item log-' + type;
        item.innerHTML = message;
        this.logContainer.appendChild(item);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    showCode(code) {
        this.codeBlock.textContent = code;
    }

    async insertBegin(value) {
        const newNode = new DLLNode(value);
        this.log(`<b>insertBegin(${value})</b> — Creating new node...`, 'action');
        
        this.showCode(`Node* newNode = new Node();
newNode->data = ${value};
newNode->prev = NULL;
newNode->next = head;

if (head != NULL)
    head->prev = newNode;

head = newNode;`);

        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        this.size++;

        await this.render('insert-begin', newNode.id);
        this.log(`✓ Node ${value} inserted at beginning. Size: ${this.size}`, 'success');
    }

    async insertEnd(value) {
        const newNode = new DLLNode(value);
        this.log(`<b>insertEnd(${value})</b> — Creating new node...`, 'action');

        this.showCode(`Node* newNode = new Node();
newNode->data = ${value};
newNode->next = NULL;

if (head == NULL) {
    newNode->prev = NULL;
    head = newNode;
} else {
    Node* temp = head;
    while (temp->next != NULL)
        temp = temp->next;
    temp->next = newNode;
    newNode->prev = temp;
}`);

        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size++;

        await this.render('insert-end', newNode.id);
        this.log(`✓ Node ${value} inserted at end. Size: ${this.size}`, 'success');
    }

    async insertAt(value, position) {
        if (position <= 0) return this.insertBegin(value);
        if (position >= this.size) return this.insertEnd(value);

        const newNode = new DLLNode(value);
        this.log(`<b>insertAt(${value}, ${position})</b> — Traversing to position...`, 'action');

        this.showCode(`Node* newNode = new Node();
newNode->data = ${value};

Node* temp = head;
for (int i = 0; i < ${position}; i++)
    temp = temp->next;

newNode->prev = temp->prev;
newNode->next = temp;
temp->prev->next = newNode;
temp->prev = newNode;`);

        let current = this.head;
        for (let i = 0; i < position; i++) {
            current = current.next;
        }

        newNode.prev = current.prev;
        newNode.next = current;
        current.prev.next = newNode;
        current.prev = newNode;
        this.size++;

        await this.render('insert-middle', newNode.id);
        this.log(`✓ Node ${value} inserted at position ${position}. Size: ${this.size}`, 'success');
    }

    async deleteBegin() {
        if (this.head === null) {
            this.log('⚠ List is empty! Cannot delete.', 'error');
            return;
        }

        const deletedValue = this.head.value;
        const deletedId = this.head.id;
        this.log(`<b>deleteBegin()</b> — Removing first node...`, 'action');

        this.showCode(`if (head == NULL) {
    cout << "List is empty\\n";
    return;
}

Node* temp = head;
head = head->next;

if (head != NULL)
    head->prev = NULL;

delete temp;`);

        // Animate deletion first
        await this.animateDelete(deletedId, 'begin');

        if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
        } else {
            this.head = this.head.next;
            this.head.prev = null;
        }
        this.size--;

        await this.render('delete-begin');
        this.log(`✓ Node ${deletedValue} deleted from beginning. Size: ${this.size}`, 'success');
    }

    async deleteEnd() {
        if (this.head === null) {
            this.log('⚠ List is empty! Cannot delete.', 'error');
            return;
        }

        const deletedValue = this.tail.value;
        const deletedId = this.tail.id;
        this.log(`<b>deleteEnd()</b> — Removing last node...`, 'action');

        this.showCode(`if (head == NULL) {
    cout << "List is empty\\n";
    return;
}

Node* temp = head;

if (temp->next == NULL) {
    head = NULL;
    delete temp;
    return;
}

while (temp->next != NULL)
    temp = temp->next;

temp->prev->next = NULL;
delete temp;`);

        await this.animateDelete(deletedId, 'end');

        if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
        this.size--;

        await this.render('delete-end');
        this.log(`✓ Node ${deletedValue} deleted from end. Size: ${this.size}`, 'success');
    }

    async deleteAt(position) {
        if (this.head === null) {
            this.log('⚠ List is empty! Cannot delete.', 'error');
            return;
        }
        if (position <= 0) return this.deleteBegin();
        if (position >= this.size - 1) return this.deleteEnd();

        this.log(`<b>deleteAt(${position})</b> — Traversing to position...`, 'action');

        let current = this.head;
        for (let i = 0; i < position; i++) {
            current = current.next;
        }

        const deletedValue = current.value;
        const deletedId = current.id;

        this.showCode(`Node* temp = head;
for (int i = 0; i < ${position}; i++)
    temp = temp->next;

temp->prev->next = temp->next;
temp->next->prev = temp->prev;
delete temp;`);

        await this.animateDelete(deletedId, 'middle');

        current.prev.next = current.next;
        current.next.prev = current.prev;
        this.size--;

        await this.render('delete-middle');
        this.log(`✓ Node ${deletedValue} deleted from position ${position}. Size: ${this.size}`, 'success');
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.render('clear');
        this.log('✓ List cleared.', 'info');
        this.showCode('// List cleared\nhead = NULL;');
    }

    async animateDelete(nodeId, type) {
        const nodeEl = document.getElementById(nodeId);
        if (nodeEl) {
            nodeEl.classList.add('deleting');
            await this.sleep(500);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async render(animationType = '', targetId = '') {
        if (this.head === null) {
            this.canvas.innerHTML = `
                <div class="empty-dll">
                    <div class="null-marker">NULL</div>
                    <div class="head-pointer">head →</div>
                    <div class="empty-text">List is empty. Click "Insert" to add nodes.</div>
                </div>`;
            return;
        }

        let html = '<div class="dll-container">';
        html += '<div class="head-label">head</div>';
        html += '<div class="pointer-arrow head-arrow">↓</div>';
        html += '<div class="dll-nodes">';
        html += '<div class="null-box">NULL</div>';
        html += '<div class="arrow-left">←</div>';

        let current = this.head;
        let index = 0;
        while (current) {
            const isNew = current.id === targetId;
            const animClass = isNew ? 'inserting' : '';
            
            html += `
                <div class="dll-node ${animClass}" id="${current.id}" data-index="${index}">
                    <div class="node-prev">prev</div>
                    <div class="node-data">${current.value}</div>
                    <div class="node-next">next</div>
                    <div class="node-addr">0x${(0x1000 + index * 12).toString(16).toUpperCase()}</div>
                </div>`;
            
            if (current.next) {
                html += '<div class="arrow-both">⇄</div>';
            }
            
            current = current.next;
            index++;
        }

        html += '<div class="arrow-right">→</div>';
        html += '<div class="null-box">NULL</div>';
        html += '</div>';
        
        html += '<div class="tail-label">tail</div>';
        html += '<div class="pointer-arrow tail-arrow">↑</div>';
        html += '</div>';

        this.canvas.innerHTML = html;

        // Trigger animation
        if (targetId) {
            await this.sleep(50);
            const newNode = document.getElementById(targetId);
            if (newNode) {
                newNode.classList.add('highlight');
                await this.sleep(800);
                newNode.classList.remove('highlight', 'inserting');
            }
        }
    }
}

export function initInteractive() {
    const canvas = document.getElementById('viz-canvas');
    const logContainer = document.getElementById('log-container');
    const codeBlock = document.getElementById('code-block');
    const valueInput = document.getElementById('node-value');
    const positionInput = document.getElementById('node-position');
    const positionGroup = document.getElementById('position-group');

    if (!canvas) return;

    const dll = new DoublyLinkedList(canvas, logContainer, codeBlock);

    // Handle action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action;
            const value = parseInt(valueInput.value) || 0;
            const position = parseInt(positionInput.value) || 0;

            btn.disabled = true;
            btn.classList.add('loading');

            try {
                switch (action) {
                    case 'insertBegin': await dll.insertBegin(value); break;
                    case 'insertEnd': await dll.insertEnd(value); break;
                    case 'insertMiddle': await dll.insertAt(value, position); break;
                    case 'deleteBegin': await dll.deleteBegin(); break;
                    case 'deleteEnd': await dll.deleteEnd(); break;
                    case 'deleteMiddle': await dll.deleteAt(position); break;
                    case 'clear': dll.clear(); break;
                }
            } catch (e) {
                console.error(e);
            }

            btn.disabled = false;
            btn.classList.remove('loading');

            // Increment value for next insert
            if (action.startsWith('insert')) {
                valueInput.value = parseInt(valueInput.value) + 10;
            }
        });
    });

    // Show/hide position input based on action
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const action = btn.dataset.action;
            if (action === 'insertMiddle' || action === 'deleteMiddle') {
                positionGroup.style.display = 'flex';
            }
        });
    });

    // DS Tab switching
    document.querySelectorAll('.ds-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.ds-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // For now, only DLL is implemented
            if (tab.dataset.ds !== 'dll') {
                logContainer.innerHTML = '<div class="log-item log-info">Coming soon: ' + tab.textContent + '</div>';
            }
        });
    });

    // Initial render
    dll.render();
}
