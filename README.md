# CodePilot AI

> **Code Anywhere. Debug Intelligently. Build Without Setup.**

CodePilot AI is an AI-powered, browser-based development environment that helps students and developers create, import, edit, run, debug, test, and understand code without local setup difficulties.

It bridges modern web-based code editing with an intelligent debugging pipeline:
$$\text{Write or Import Code} \longrightarrow \text{Run} \longrightarrow \text{Detect Error} \longrightarrow \text{Diagnose Root Cause} \longrightarrow \text{Review Safe Patch} \longrightarrow \text{Approve} \longrightarrow \text{Rerun Tests} \longrightarrow \text{Verify Results}$$

---

## 🚀 Key Features

### 1. Zero-Setup Multi-Runtime Execution
- **Web Applications (HTML/CSS/JS)**: 100% client-side execution in a sandboxed iframe with intercepted `console.log`, `window.onerror`, and live DOM inspection.
- **React 18 + TypeScript**: In-browser JSX/TSX compilation with reactive component state and ErrorBoundary rendering.
- **Python 3 (Pyodide WASM)**: Client-side Python 3.12 running inside WebAssembly. Captures real stdout, stderr, and exception tracebacks (ZeroDivisionError, NameError, SyntaxError) with zero backend dependency.
- **JavaScript Sandbox**: Isolated worker execution for algorithms and unit test runners.

### 2. Signature Feature: AI Debug → Safe Fix → Verify
1. **Detect**: Automatically captures runtime errors, uncaught exceptions, and exact stack traces.
2. **Diagnose**: Produces structured diagnosis including error summary, file & line number, root cause, and confidence score (e.g. 98% Confirmed Cause).
3. **Propose Safe Patch**: Generates a unified, colored code diff highlighting additions (`+`) and deletions (`-`).
4. **User Approval**: Review changes, inspect affected symbols, approve or reject. Never silently overwrites user code.
5. **Apply & Backup**: Applies the patch directly to IndexedDB with 1-click rollback history.
6. **Automated Verification**: Re-runs the live runtime or test assertions. Turns green only when tests actually pass.

### 3. Project Import & Export
- **ZIP Import**: Drag-and-drop or file picker with path traversal protection (`..` attack mitigation) and project type detection.
- **Public GitHub Import**: Fetch files recursively via GitHub REST API without exposing tokens.
- **ZIP Export**: Download clean project archives preserved with directory hierarchy.
- **IndexedDB Persistence**: Automatic local persistence across browser refreshes and sessions.

### 4. Educational & Advanced Capabilities
- **Learn-by-Debugging**: Explains core computer science concepts behind bugs and includes interactive mini-quizzes.
- **Change Impact Radar**: Visual assessment of affected functions and scope risk before applying multi-line patches.
- **Prompt-to-Project**: Generate multi-file starter templates from natural language prompts.
- **Automated Test Runner**: Executes project unit test suites and displays per-test pass/fail status and execution times.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide Icons, React Router v7.
- **Runtimes**: Browser Sandbox, React Babel Standalone, Pyodide WASM (Python 3.12).
- **Storage**: IndexedDB (`idb`) for persistent projects, files, and debug session timelines.
- **Backend API**: Node.js, Express, CORS, `dotenv`, `tsx` proxying external LLM requests safely without leaking secrets to the browser.

---

## 📦 Installation & Running Locally

### Prerequisites
- Node.js >= 18 (Tested on Node.js v24.11.0)
- npm >= 9

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Frontend & Backend Concurrently
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:3001](http://localhost:3001)

### (Optional) Configure Live AI Provider
By default, CodePilot AI includes a high-precision **Built-in Intelligent Diagnostic Engine** that works offline with zero API keys. To connect external models, create a `.env` file in the root:

```env
# Optional: Set either Gemini or OpenAI API key
GEMINI_API_KEY=your_gemini_api_key_here
# or
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

---

## 🧪 Testing the 6-Step Bug Fix Workflow

1. Navigate to `http://localhost:5173/dashboard`.
2. Click **Open IDE** on the pre-seeded **"Interactive Calculator (Bug Demo)"** project.
3. In the IDE, observe `app.js` and click the **Run** button.
4. The terminal catches the runtime error: `TypeError: Cannot set properties of null (setting 'textContent')`.
5. Click **Debug with AI** or **Run AI Fix Workflow**.
6. Inspect the Root Cause: `document.getElementById('calc-display')` vs HTML `calc-screen`.
7. Review the colored diff.
8. Click **Approve & Auto-Verify**.
9. The patch is applied, the preview reloads, and the verification status displays: **Fix Verified & Confirmed Working!**
