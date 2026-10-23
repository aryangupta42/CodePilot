import type { ProjectTemplate } from '../types';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'html-css-js',
    name: 'Web Application (HTML/CSS/JS)',
    type: 'web',
    description: 'Modern responsive web application with vanilla JavaScript, modern styling, and live browser preview.',
    icon: 'Globe',
    runtime: 'browser-native',
    runtimeSupport: 'full',
    runtimeNote: '100% Client-Side Native Execution with Live Sandboxed Preview & Console Interceptor.',
    entryFile: '/index.html',
    files: [
      {
        name: 'index.html',
        path: '/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Counter App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <div class="badge">CodePilot AI Preview</div>
    <h1>Interactive Counter</h1>
    <p class="subtitle">Edit HTML, CSS, or JS and click Run to test.</p>
    
    <div class="counter-display" id="display">0</div>
    
    <div class="button-group">
      <button id="decrement-btn" class="btn btn-secondary">- Dec</button>
      <button id="reset-btn" class="btn btn-ghost">Reset</button>
      <button id="increment-btn" class="btn btn-primary">+ Inc</button>
    </div>
    
    <div class="history-section">
      <h3>Action History</h3>
      <ul id="history-list"></ul>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        name: 'style.css',
        path: '/style.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #0B0D13;
  color: #F8FAFC;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.card {
  background: #151B26;
  border: 1px solid #283347;
  border-radius: 16px;
  padding: 32px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.badge {
  display: inline-block;
  background: rgba(99, 102, 241, 0.15);
  color: #818CF8;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 12px;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

h1 {
  font-size: 24px;
  margin-bottom: 6px;
  color: #FFFFFF;
}

.subtitle {
  color: #94A3B8;
  font-size: 13px;
  margin-bottom: 24px;
}

.counter-display {
  font-size: 64px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #6366F1;
  margin: 16px 0 24px;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 24px;
}

.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #6366F1;
  color: white;
}

.btn-primary:hover {
  background: #4F46E5;
}

.btn-secondary {
  background: #1E293B;
  color: #E2E8F0;
  border: 1px solid #334155;
}

.btn-secondary:hover {
  background: #334155;
}

.btn-ghost {
  background: transparent;
  color: #94A3B8;
  border: 1px solid #334155;
}

.btn-ghost:hover {
  background: #1E293B;
  color: #FFFFFF;
}

.history-section {
  border-top: 1px solid #283347;
  padding-top: 16px;
  text-align: left;
}

.history-section h3 {
  font-size: 12px;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

#history-list {
  list-style: none;
  max-height: 100px;
  overflow-y: auto;
  font-size: 12px;
  color: #94A3B8;
}

#history-list li {
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}`
      },
      {
        name: 'script.js',
        path: '/script.js',
        content: `// CodePilot AI - Smart Counter Logic
let count = 0;
const display = document.getElementById('display');
const historyList = document.getElementById('history-list');

function logAction(action) {
  const item = document.createElement('li');
  const time = new Date().toLocaleTimeString();
  item.textContent = \`[\${time}] \${action} -> Current count: \${count}\`;
  historyList.prepend(item);
  console.log(\`[Action] \${action}, Count: \${count}\`);
}

document.getElementById('increment-btn').addEventListener('click', () => {
  count += 1;
  display.textContent = count;
  logAction('Increment (+1)');
});

document.getElementById('decrement-btn').addEventListener('click', () => {
  count -= 1;
  display.textContent = count;
  logAction('Decrement (-1)');
});

document.getElementById('reset-btn').addEventListener('click', () => {
  count = 0;
  display.textContent = count;
  logAction('Reset to 0');
});

console.log("App initialized successfully! Ready for interaction.");`
      }
    ],
    sampleTests: [
      {
        name: 'Initial Display State',
        targetFile: '/script.js',
        code: `// Verify initial count is zero
if (count !== 0) throw new Error("Expected initial count to be 0, got " + count);
console.log("Test Passed: Initial count is 0");`
      }
    ]
  },
  {
    id: 'react-ts',
    name: 'React + TypeScript App',
    type: 'react',
    description: 'Modern component-based React 18 application with live JSX compilation and reactive state.',
    icon: 'Atom',
    runtime: 'react-compiler',
    runtimeSupport: 'full',
    runtimeNote: 'In-Browser JSX/TSX compilation with reactive live preview and render error capture.',
    entryFile: '/src/App.tsx',
    files: [
      {
        name: 'App.tsx',
        path: '/src/App.tsx',
        content: `import React, { useState } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Inspect project structure', done: true },
    { id: 2, text: 'Run live preview', done: true },
    { id: 3, text: 'Trigger AI debugger workflow', done: false }
  ]);
  const [newText, setNewText] = useState('');

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newText.trim(), done: false }]);
    setNewText('');
  };

  return (
    <div style={{
      background: '#0D1117',
      minHeight: '100vh',
      color: '#F1F5F9',
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        background: '#151B26',
        borderRadius: '16px',
        border: '1px solid #283347',
        padding: '28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>CodePilot Tasks</h2>
          <span style={{ fontSize: '12px', background: 'rgba(99,102,241,0.2)', color: '#818CF8', padding: '4px 10px', borderRadius: '12px' }}>
            {tasks.filter(t => t.done).length}/{tasks.length} Completed
          </span>
        </div>

        <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add new task..."
            style={{
              flex: 1,
              background: '#0D1117',
              border: '1px solid #283347',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#FFF',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#6366F1',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Add
          </button>
        </form>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tasks.map(task => (
            <li
              key={task.id}
              onClick={() => toggleTask(task.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#0D1117',
                borderRadius: '8px',
                marginBottom: '8px',
                cursor: 'pointer',
                border: '1px solid #1E293B',
                transition: 'border-color 0.2s'
              }}
            >
              <input
                type="checkbox"
                checked={task.done}
                readOnly
                style={{ accentColor: '#6366F1', cursor: 'pointer' }}
              />
              <span style={{
                textDecoration: task.done ? 'line-through' : 'none',
                color: task.done ? '#64748B' : '#E2E8F0',
                fontSize: '14px'
              }}>
                {task.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}`
      },
      {
        name: 'index.html',
        path: '/index.html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>React App</title>
</head>
<body style="margin: 0;">
  <div id="root"></div>
</body>
</html>`
      }
    ]
  },
  {
    id: 'python-calc',
    name: 'Python Data & Algorithm (Pyodide WASM)',
    type: 'python',
    description: 'Genuine client-side Python 3 runtime powered by WebAssembly. Execute Python, inspect standard library output, and diagnose tracebacks.',
    icon: 'Terminal',
    runtime: 'pyodide-wasm',
    runtimeSupport: 'full',
    runtimeNote: 'Full Python 3 execution in-browser via Pyodide WebAssembly with real stdout/stderr/stack traces.',
    entryFile: '/main.py',
    files: [
      {
        name: 'main.py',
        path: '/main.py',
        content: `# CodePilot AI - Python 3 Data Analyzer
import math
import sys

def calculate_statistics(numbers):
    if not numbers:
        return None
    
    n = len(numbers)
    mean = sum(numbers) / n
    variance = sum((x - mean) ** 2 for x in numbers) / n
    std_dev = math.sqrt(variance)
    
    sorted_nums = sorted(numbers)
    mid = n // 2
    if n % 2 == 0:
        median = (sorted_nums[mid - 1] + sorted_nums[mid]) / 2
    else:
        median = sorted_nums[mid]
        
    return {
        "count": n,
        "mean": round(mean, 2),
        "median": round(median, 2),
        "std_dev": round(std_dev, 2),
        "min": min(numbers),
        "max": max(numbers)
    }

# Sample telemetry data
dataset = [23.5, 25.1, 22.8, 26.4, 29.0, 24.2, 28.5, 23.9, 27.1, 24.8]

print("=" * 45)
print("  CodePilot AI Python Runtime (Pyodide WASM)")
print("=" * 45)
print(f"Dataset: {dataset}")

stats = calculate_statistics(dataset)
for key, value in stats.items():
    print(f"  • {key.capitalize():<10}: {value}")

print("\\n[SUCCESS] Computation completed without errors.")`
      },
      {
        name: 'test_stats.py',
        path: '/test_stats.py',
        content: `from main import calculate_statistics

def test_stats():
    data = [10, 20, 30]
    res = calculate_statistics(data)
    assert res['mean'] == 20.0, f"Expected 20.0, got {res['mean']}"
    assert res['min'] == 10, f"Expected 10, got {res['min']}"
    assert res['max'] == 30, f"Expected 30, got {res['max']}"
    print("[TEST PASSED] calculate_statistics passed all test assertions!")

test_stats()`
      }
    ],
    sampleTests: [
      {
        name: 'Statistics Output Validation',
        targetFile: '/main.py',
        code: `test_stats()`
      }
    ]
  },
  {
    id: 'node-algorithms',
    name: 'JavaScript / Node Algorithms & Tests',
    type: 'node',
    description: 'Data structures, algorithm implementations, and unit testing runner with instant feedback.',
    icon: 'Cpu',
    runtime: 'js-sandbox',
    runtimeSupport: 'full',
    runtimeNote: 'Secure isolated JavaScript engine with console capture, execution timeout, and assertion tests.',
    entryFile: '/index.js',
    files: [
      {
        name: 'index.js',
        path: '/index.js',
        content: `// CodePilot AI - Binary Search & Sorting Module

function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid;
    }
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

// Demo Run
const sampleData = [64, 34, 25, 12, 22, 11, 90];
console.log("Original array:", sampleData);

const sorted = quickSort(sampleData);
console.log("Sorted array:  ", sorted);

const target = 25;
const foundIndex = binarySearch(sorted, target);
console.log(\`Searching for \${target} in sorted array: index \${foundIndex}\`);

if (foundIndex !== -1 && sorted[foundIndex] === target) {
  console.log("✓ Verification: Target matched element at found index!");
} else {
  console.error("✗ Target verification failed!");
}`
      },
      {
        name: 'test.js',
        path: '/test.js',
        content: `// Unit tests for binarySearch and quickSort
function runTests() {
  const nums = [1, 3, 5, 7, 9, 11];
  if (binarySearch(nums, 7) !== 3) throw new Error("binarySearch failed to find 7 at index 3");
  if (binarySearch(nums, 2) !== -1) throw new Error("binarySearch should return -1 for non-existent 2");
  console.log("All unit tests passed!");
}
runTests();`
      }
    ],
    sampleTests: [
      {
        name: 'Binary Search Accuracy',
        targetFile: '/index.js',
        code: `if (binarySearch([2, 4, 6, 8, 10], 6) !== 2) throw new Error("Search failed for target 6");`
      }
    ]
  },
  {
    id: 'buggy-calc-demo',
    name: 'Featured Demo: Web Calculator (With Intentional Bug)',
    type: 'web',
    description: 'Pre-seeded project with an intentional runtime error ready to test the 6-step AI Debug → Safe Fix → Verify workflow instantly!',
    icon: 'Bug',
    runtime: 'browser-native',
    runtimeSupport: 'full',
    runtimeNote: 'Ready for instant demo of AI detection, root-cause diagnosis, diff proposal, patch application, and verification.',
    entryFile: '/index.html',
    files: [
      {
        name: 'index.html',
        path: '/index.html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Buggy Calculator Demo</title>
  <style>
    body { background: #0D1117; color: #FFF; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .calc { background: #151B26; padding: 24px; border-radius: 12px; border: 1px solid #283347; width: 300px; }
    #calc-screen { width: 100%; height: 48px; background: #080A0F; border: 1px solid #283347; color: #22D3EE; font-size: 24px; text-align: right; padding: 8px; border-radius: 6px; margin-bottom: 16px; box-sizing: border-box; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    button { padding: 14px; background: #1E293B; border: 1px solid #334155; color: #FFF; font-size: 16px; border-radius: 6px; cursor: pointer; }
    button:hover { background: #334155; }
    button.op { background: #4F46E5; }
  </style>
</head>
<body>
  <div class="calc">
    <div id="calc-screen">0</div>
    <div class="grid">
      <button onclick="press('7')">7</button>
      <button onclick="press('8')">8</button>
      <button onclick="press('9')">9</button>
      <button class="op" onclick="press('/')">/</button>
      <button onclick="press('4')">4</button>
      <button onclick="press('5')">5</button>
      <button onclick="press('6')">6</button>
      <button class="op" onclick="press('*')">*</button>
      <button onclick="press('1')">1</button>
      <button onclick="press('2')">2</button>
      <button onclick="press('3')">3</button>
      <button class="op" onclick="press('-')">-</button>
      <button onclick="clearCalc()">C</button>
      <button onclick="press('0')">0</button>
      <button class="op" onclick="calculate()">=</button>
      <button class="op" onclick="press('+')">+</button>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`
      },
      {
        name: 'app.js',
        path: '/app.js',
        content: `// Intentional bug demo: notice the element ID mismatch!
let currentExpression = '';

function press(val) {
  currentExpression += val;
  updateDisplay();
}

function clearCalc() {
  currentExpression = '';
  // Buggy code: ID in HTML is 'calc-screen', but here it tries to access 'calc-display'
  const displayElement = document.getElementById('calc-display');
  displayElement.textContent = '0';
}

function updateDisplay() {
  // BUG: Calling method on null because 'calc-display' does not exist in the DOM
  const displayElement = document.getElementById('calc-display');
  displayElement.textContent = currentExpression || '0';
}

function calculate() {
  try {
    const result = Function('"use strict";return (' + currentExpression + ')')();
    currentExpression = String(result);
    updateDisplay();
    console.log("Calculated:", result);
  } catch (err) {
    console.error("Evaluation error:", err);
  }
}

// Auto-run update display on startup which triggers the runtime TypeError: Cannot set properties of null (setting 'textContent')
console.log("Initializing calculator app...");
updateDisplay();`
      }
    ],
    sampleTests: [
      {
        name: 'DOM Display Initialization',
        targetFile: '/app.js',
        code: `const screen = document.getElementById('calc-screen');
if (!screen) throw new Error("Expected element with id 'calc-screen' to exist in DOM");
if (screen.textContent === '') throw new Error("Display should not be empty");`
      }
    ]
  }
];
