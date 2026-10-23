import type { ExecutionResult } from '../../types';

export async function runJavaScriptCode(
  code: string,
  onStdout?: (line: string) => void,
  onStderr?: (line: string) => void
): Promise<ExecutionResult> {
  const startTime = performance.now();
  const stdoutArr: string[] = [];
  const stderrArr: string[] = [];

  try {
    const sandboxConsole = {
      log: (...args: any[]) => {
        const line = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        stdoutArr.push(line);
        onStdout?.(line);
      },
      info: (...args: any[]) => {
        const line = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        stdoutArr.push(line);
        onStdout?.(line);
      },
      warn: (...args: any[]) => {
        const line = '[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        stdoutArr.push(line);
        onStdout?.(line);
      },
      error: (...args: any[]) => {
        const line = args.map(a => typeof a === 'object' ? (a.stack || JSON.stringify(a)) : String(a)).join(' ');
        stderrArr.push(line);
        onStderr?.(line);
      }
    };

    // Execute wrapped code with custom sandbox console
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const runner = new AsyncFunction('console', code);
    await runner(sandboxConsole);

    const duration = Math.round(performance.now() - startTime);
    return {
      success: stderrArr.length === 0,
      exitCode: stderrArr.length === 0 ? 0 : 1,
      durationMs: duration,
      stdout: stdoutArr,
      stderr: stderrArr
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    const errMessage = err.message || String(err);
    stderrArr.push(errMessage);
    onStderr?.(errMessage);

    let lineNumber: number | undefined;
    if (err.stack) {
      const match = err.stack.match(/<anonymous>:(\d+):(\d+)/) || err.stack.match(/:(\d+):(\d+)/);
      if (match) {
        lineNumber = parseInt(match[1], 10);
      }
    }

    return {
      success: false,
      exitCode: 1,
      durationMs: duration,
      stdout: stdoutArr,
      stderr: stderrArr,
      error: {
        message: errMessage,
        file: 'index.js',
        line: lineNumber,
        stack: err.stack
      }
    };
  }
}
