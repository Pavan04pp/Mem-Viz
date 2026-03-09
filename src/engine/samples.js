// ════════════════════════════════════════════════════════════
//  MemViz — Sample Code for All Languages
// ════════════════════════════════════════════════════════════

export const SAMPLES = {
    cpp: {
        vars: `int x = 5;
int y = x + 2;
float pi = 3.14f;
double e = 2.718;
bool flag = true;
char grade = 'A';
string name = "Alice";
int z = x * y;`,
        array: `int nums[6] = {10, 25, 7, 42, 3, 18};
nums[0] = 99;
nums[4] = 77;
float scores[4] = {9.5, 8.3, 7.1, 6.8};`,
        pointer: `int x = 10;
int y = 25;
int* p = &x;
*p = 42;
p = &y;
*p = 100;`,
        ll: `Node* head = new Node(10);
Node* n2 = new Node(20);
Node* n3 = new Node(30);
Node* n4 = new Node(40);
Node* n5 = new Node(50);
head->next = n2;
n2->next = n3;
n3->next = n4;
n4->next = n5;`,
        stack: `stack<int> s;
s.push(5);
s.push(12);
s.push(7);
s.push(3);
s.push(9);
s.pop();
s.pop();`,
        queue: `queue<int> q;
q.enqueue(3);
q.enqueue(9);
q.enqueue(15);
q.enqueue(6);
q.enqueue(21);
q.dequeue();
q.dequeue();`,
        bst: `BST t;
t.insert(50);
t.insert(30);
t.insert(70);
t.insert(20);
t.insert(40);
t.insert(60);
t.insert(80);
t.insert(10);
t.insert(45);`,
        graph: `Graph g;
g.addNode(1);
g.addNode(2);
g.addNode(3);
g.addNode(4);
g.addNode(5);
g.addEdge(1, 2);
g.addEdge(1, 3);
g.addEdge(2, 4);
g.addEdge(3, 4);
g.addEdge(4, 5);
g.addEdge(2, 5);`,
        hashmap: `unordered_map<string, int> scores;
scores["Alice"] = 95;
scores["Bob"] = 88;
scores["Carol"] = 92;
scores["Dave"] = 76;
scores["Alice"] = 99;
scores.erase("Dave");`,
        callstack: `int add(int a, int b) {
  int result = a + b;
  return result;
}
int multiply(int x, int y) {
  int product = x * y;
  return product;
}
int main() {
  int num1 = 5;
  int num2 = 3;
  int sum = 8;
  int product = 15;
}`,
        set: `set<int> mySet;
mySet.insert(10);
mySet.insert(20);
mySet.insert(30);
mySet.insert(20);
mySet.insert(40);
mySet.erase(30);`,
        heap: `MinHeap pq;
pq.push(15);
pq.push(5);
pq.push(20);
pq.push(1);
pq.push(10);
pq.pop();`,
        trie: `Trie trie;
trie.insert("apple");
trie.insert("app");
trie.insert("bear");
trie.insert("bell");
trie.insert("bat");`,
        dll: `DNode* head = new DNode(10);
DNode* n2 = new DNode(20);
DNode* n3 = new DNode(30);
DNode* n4 = new DNode(40);
head->next = n2;
n2->next = n3;
n3->next = n4;`,
        complex: `// Complex DS: BST + HashMap + Graph
BST tree;
tree.insert(10);
tree.insert(5);
tree.insert(15);
tree.insert(3);
tree.insert(7);

unordered_map<string, int> freq;
freq["hello"] = 3;
freq["world"] = 5;
freq["code"] = 7;

Graph g;
g.addNode(0);
g.addNode(1);
g.addNode(2);
g.addNode(3);
g.addEdge(0, 1);
g.addEdge(0, 2);
g.addEdge(1, 3);
g.addEdge(2, 3);

stack<int> dfsStack;
dfsStack.push(0);
dfsStack.push(1);
dfsStack.push(3);`
    },

    python: {
        vars: `x = 5
y = x + 2
pi = 3.14
flag = True
name = "Alice"
z = x * y`,
        array: `nums = [10, 25, 7, 42, 3]
nums[0] = 99
scores = [9.5, 8.3, 7.1]`,
        pointer: `x = 10
y = 25`,
        ll: `head = Node(10)
n2 = Node(20)
n3 = Node(30)
n4 = Node(40)
head.next = n2
n2.next = n3
n3.next = n4`,
        stack: `s = []
s.push(5)
s.push(12)
s.push(7)
s.push(3)
s.pop()`,
        queue: `q = Queue()
q.enqueue(3)
q.enqueue(9)
q.enqueue(15)
q.dequeue()`,
        bst: `t = BST()
t.insert(50)
t.insert(30)
t.insert(70)
t.insert(20)
t.insert(40)
t.insert(60)
t.insert(80)`,
        graph: `g = Graph()
g.addNode(1)
g.addNode(2)
g.addNode(3)
g.addNode(4)
g.addEdge(1, 2)
g.addEdge(1, 3)
g.addEdge(2, 4)
g.addEdge(3, 4)`,
        hashmap: `freq = dict()
freq["apple"] = 3
freq["banana"] = 5
freq["cherry"] = 2
freq["apple"] = 7
del freq["banana"]`,
        callstack: `def square(n):
  result = n * n
  return result

def add(a, b):
  total = a + b
  return total`,
        set: `mySet = set()
mySet.add(10)
mySet.add(20)
mySet.add(30)
mySet.add(20)
mySet.add(40)
mySet.remove(30)`,
        heap: `pq = MinHeap()
pq.push(15)
pq.push(5)
pq.push(20)
pq.push(1)
pq.push(10)
pq.pop()`,
        trie: `t = Trie()
t.insert("apple")
t.insert("app")
t.insert("bear")
t.insert("bell")`,
        dll: `head = DNode(10)
n2 = DNode(20)
n3 = DNode(30)
head.next = n2
n2.next = n3`,
        complex: `# BST + Dict + Graph
t = BST()
t.insert(10)
t.insert(5)
t.insert(15)
t.insert(3)

freq = dict()
freq["hello"] = 3
freq["world"] = 5

g = Graph()
g.addNode(0)
g.addNode(1)
g.addNode(2)
g.addEdge(0, 1)
g.addEdge(1, 2)

s = []
s.push(10)
s.push(20)
s.pop()`
    },

    java: {
        vars: `int x = 5;
int y = x + 2;
float pi = 3.14f;
double e = 2.718;
boolean flag = true;
char grade = 'A';
String name = "Alice";`,
        array: `int[] nums = {10, 25, 7, 42, 3};
nums[0] = 99;`,
        pointer: `int x = 10;
int y = 25;`,
        ll: `Node head = new Node(10);
Node n2 = new Node(20);
Node n3 = new Node(30);
head.next = n2;
n2.next = n3;`,
        stack: `Stack s;
s.push(5);
s.push(12);
s.push(7);
s.pop();`,
        queue: `Queue q;
q.enqueue(3);
q.enqueue(9);
q.enqueue(15);
q.dequeue();`,
        bst: `BST t;
t.insert(50);
t.insert(30);
t.insert(70);
t.insert(20);
t.insert(40);`,
        graph: `Graph g;
g.addNode(1);
g.addNode(2);
g.addNode(3);
g.addEdge(1, 2);
g.addEdge(2, 3);
g.addEdge(1, 3);`,
        hashmap: `HashMap<String, Integer> map;
map["Alice"] = 95;
map["Bob"] = 88;
map["Carol"] = 92;`,
        callstack: `int add(int a, int b) {
  int result = a + b;
  return result;
}
int main() {
  int x = 5;
  int y = 3;
}`,
        set: `HashSet<Integer> mySet;
mySet.add(10);
mySet.add(20);
mySet.add(30);
mySet.add(20);
mySet.remove(30);`,
        heap: `PriorityQueue pq;
pq.push(15);
pq.push(5);
pq.push(20);
pq.push(1);
pq.pop();`,
        trie: `Trie trie;
trie.insert("apple");
trie.insert("app");
trie.insert("bear");`,
        dll: `DNode head = new DNode(10);
DNode n2 = new DNode(20);
DNode n3 = new DNode(30);
head.next = n2;
n2.next = n3;`,
        complex: `BST tree;
tree.insert(10);
tree.insert(5);
tree.insert(15);

HashMap<String, Integer> freq;
freq["key1"] = 1;
freq["key2"] = 2;

Graph g;
g.addNode(1);
g.addNode(2);
g.addEdge(1, 2);`
    },

    javascript: {
        vars: `let x = 5;
let y = x + 2;
const pi = 3.14;
let flag = true;
const name = "Alice";
let z = x * y;`,
        array: `const nums = [10, 25, 7, 42, 3];
nums[0] = 99;
const words = ["hello", "world"];`,
        pointer: `let x = 10;
let y = 25;`,
        ll: `Node n1 = new Node(10);
Node n2 = new Node(20);
Node n3 = new Node(30);
n1.next = n2;
n2.next = n3;`,
        stack: `Stack s;
s.push(5);
s.push(12);
s.push(7);
s.push(3);
s.pop();`,
        queue: `Queue q;
q.enqueue(3);
q.enqueue(9);
q.enqueue(15);
q.dequeue();`,
        bst: `BST t;
t.insert(50);
t.insert(30);
t.insert(70);
t.insert(20);
t.insert(40);`,
        graph: `Graph g;
g.addNode(1);
g.addNode(2);
g.addNode(3);
g.addEdge(1, 2);
g.addEdge(2, 3);`,
        hashmap: `const map = new Map();
map.set("Alice", 95);
map.set("Bob", 88);
map.set("Carol", 92);
map.set("Alice", 99);`,
        callstack: `function add(a, b) {
  let result = a + b;
  return result;
}
function multiply(x, y) {
  let product = x * y;
  return product;
}`,
        set: `const mySet = new Set();
mySet.add(10);
mySet.add(20);
mySet.add(30);
mySet.add(20);
mySet.delete(30);`,
        heap: `MinHeap pq;
pq.push(15);
pq.push(5);
pq.push(20);
pq.push(1);
pq.pop();`,
        trie: `Trie trie;
trie.insert("apple");
trie.insert("app");
trie.insert("bear");`,
        dll: `DNode n1 = new DNode(10);
DNode n2 = new DNode(20);
DNode n3 = new DNode(30);
n1.next = n2;
n2.next = n3;`,
        complex: `BST tree;
tree.insert(10);
tree.insert(5);
tree.insert(15);

const freq = new Map();
freq.set("hello", 3);
freq.set("world", 5);

Graph g;
g.addNode(0);
g.addNode(1);
g.addEdge(0, 1);

Stack s;
s.push(100);
s.push(200);`
    },

    csharp: {
        vars: `int x = 5;
int y = x + 2;
float pi = 3.14f;
double e = 2.718;
bool flag = true;
char grade = 'A';
string name = "Alice";
var z = x * y;`,
        array: `int[] nums = {10, 25, 7, 42, 3};
nums[0] = 99;
nums[3] = 77;`,
        pointer: `int x = 10;
int y = 25;`,
        ll: `Node head = new Node(10);
Node n2 = new Node(20);
Node n3 = new Node(30);
Node n4 = new Node(40);
head.next = n2;
n2.next = n3;
n3.next = n4;`,
        stack: `Stack<int> s;
s.Push(5);
s.Push(12);
s.Push(7);
s.Push(3);
s.Pop();`,
        queue: `Queue<int> q;
q.Enqueue(3);
q.Enqueue(9);
q.Enqueue(15);
q.Enqueue(6);
q.Dequeue();`,
        bst: `BST t;
t.insert(50);
t.insert(30);
t.insert(70);
t.insert(20);
t.insert(40);
t.insert(60);`,
        graph: `Graph g;
g.addNode(1);
g.addNode(2);
g.addNode(3);
g.addNode(4);
g.addEdge(1, 2);
g.addEdge(1, 3);
g.addEdge(2, 4);
g.addEdge(3, 4);`,
        hashmap: `Dictionary<string, int> scores;
scores["Alice"] = 95;
scores["Bob"] = 88;
scores["Carol"] = 92;
scores["Dave"] = 76;
scores.Remove("Dave");`,
        callstack: `int Add(int a, int b) {
  int result = a + b;
  return result;
}
void Main() {
  int x = 5;
  int y = 3;
}`,
        set: `HashSet<int> mySet;
mySet.Add(10);
mySet.Add(20);
mySet.Add(30);
mySet.Add(20);
mySet.Remove(30);`,
        heap: `PriorityQueue pq;
pq.push(15);
pq.push(5);
pq.push(20);
pq.push(1);
pq.pop();`,
        trie: `Trie trie;
trie.insert("apple");
trie.insert("app");
trie.insert("bear");`,
        dll: `DNode head = new DNode(10);
DNode n2 = new DNode(20);
DNode n3 = new DNode(30);
head.next = n2;
n2.next = n3;`,
        complex: `// Complex: BST + Dictionary + Stack
BST tree;
tree.insert(10);
tree.insert(5);
tree.insert(15);

Dictionary<string, int> cache;
cache["hits"] = 42;
cache["miss"] = 7;

Stack<int> ops;
ops.Push(1);
ops.Push(2);
ops.Push(3);
ops.Pop();`
    }
};
