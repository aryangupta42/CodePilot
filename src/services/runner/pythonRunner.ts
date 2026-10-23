import type { ExecutionResult } from '../../types';

declare global {
  interface Window {
    loadPyodide?: any;
    __pyodideInstance?: any;
  }
}

let pyodideLoadingPromise: Promise<any> | null = null;

async function getPyodideInstance(onStatusUpdate?: (msg: string) => void): Promise<any> {
  if (window.__pyodideInstance) {
    return window.__pyodideInstance;
  }

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = (async () => {
    onStatusUpdate?.('Loading Pyodide WebAssembly runtime (Python 3.12)...');
    
    // Inject Pyodide script if not present
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Pyodide WebAssembly script from CDN. Ensure you have an active network connection.'));
        document.head.appendChild(script);
      });
    }

    onStatusUpdate?.('Initializing Python standard library...');
    const pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
    });

    window.__pyodideInstance = pyodide;
    return pyodide;
  })();

  return pyodideLoadingPromise;
}

export async function runPythonCode(
  code: string,
  onStdout?: (line: string) => void,
  onStderr?: (line: string) => void,
  onStatus?: (status: string) => void
): Promise<ExecutionResult> {
  const startTime = performance.now();
  const stdoutArr: string[] = [];
  const stderrArr: string[] = [];

  try {
    const pyodide = await getPyodideInstance(onStatus);
    onStatus?.('Running Python script...');

    // Intercept stdout & stderr via Pyodide hooks
    pyodide.setStdout({
      batched: (text: string) => {
        stdoutArr.push(text);
        onStdout?.(text);
      }
    });

    pyodide.setStderr({
      batched: (text: string) => {
        stderrArr.push(text);
        onStderr?.(text);
      }
    });

    // Execute python code
    await pyodide.runPythonAsync(code);

    const duration = Math.round(performance.now() - startTime);
    return {
      success: true,
      exitCode: 0,
      durationMs: duration,
      stdout: stdoutArr,
      stderr: stderrArr
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    const errMessage = err.message || String(err);
    stderrArr.push(errMessage);
    onStderr?.(errMessage);

    // Extract line number from traceback (e.g., File "<exec>", line 14, in ...)
    let lineNumber: number | undefined;
    const lineMatch = errMessage.match(/line (\d+)/i);
    if (lineMatch) {
      lineNumber = parseInt(lineMatch[1], 10);
    }

    return {
      success: false,
      exitCode: 1,
      durationMs: duration,
      stdout: stdoutArr,
      stderr: stderrArr,
      error: {
        message: errMessage,
        file: 'main.py',
        line: lineNumber,
        stack: err.stack || errMessage
      }
    };
  }
}
