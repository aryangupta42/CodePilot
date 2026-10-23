import type { Project, TestRunResult, TestResultItem } from '../types';
import { runJavaScriptCode } from './runner/jsRunner';
import { runPythonCode } from './runner/pythonRunner';

export async function runProjectTests(project: Project): Promise<TestRunResult> {
  const startTime = performance.now();
  const testItems: TestResultItem[] = [];

  const registeredTests = project.tests || [];

  if (registeredTests.length === 0) {
    // Check if there are test files in project (.test.js or test_*.py)
    const testFiles = project.files.filter(f => 
      f.name.endsWith('.test.js') || 
      f.name.endsWith('.spec.js') || 
      f.name.startsWith('test_') || 
      f.name.endsWith('_test.py')
    );

    if (testFiles.length === 0) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
        durationMs: 0,
        results: []
      };
    }

    for (const testFile of testFiles) {
      const itemStart = performance.now();
      if (project.type === 'python') {
        const res = await runPythonCode(testFile.content);
        testItems.push({
          id: testFile.id,
          name: testFile.name,
          passed: res.success,
          error: res.error?.message || (res.stderr.length > 0 ? res.stderr.join('\n') : undefined),
          durationMs: Math.round(performance.now() - itemStart)
        });
      } else {
        const targetFile = project.files.find(f => f.name.endsWith('.js') && !f.name.includes('test'));
        const fullCode = (targetFile ? targetFile.content + '\n\n' : '') + testFile.content;
        const res = await runJavaScriptCode(fullCode);
        testItems.push({
          id: testFile.id,
          name: testFile.name,
          passed: res.success,
          error: res.error?.message || (res.stderr.length > 0 ? res.stderr.join('\n') : undefined),
          durationMs: Math.round(performance.now() - itemStart)
        });
      }
    }
  } else {
    // Run configured registered tests
    for (const test of registeredTests) {
      const itemStart = performance.now();
      const targetFile = project.files.find(f => f.path === test.targetFile || f.name === test.targetFile);
      const targetCode = targetFile ? targetFile.content : '';

      if (project.type === 'python') {
        const combinedCode = `${targetCode}\n\n# Test Suite: ${test.name}\n${test.code}`;
        const res = await runPythonCode(combinedCode);
        testItems.push({
          id: test.id,
          name: test.name,
          passed: res.success,
          error: res.error?.message || (res.stderr.length > 0 ? res.stderr.join('\n') : undefined),
          durationMs: Math.round(performance.now() - itemStart)
        });
      } else {
        const combinedCode = `${targetCode}\n\n// Test Suite: ${test.name}\n${test.code}`;
        const res = await runJavaScriptCode(combinedCode);
        testItems.push({
          id: test.id,
          name: test.name,
          passed: res.success,
          error: res.error?.message || (res.stderr.length > 0 ? res.stderr.join('\n') : undefined),
          durationMs: Math.round(performance.now() - itemStart)
        });
      }
    }
  }

  const passedCount = testItems.filter(t => t.passed).length;
  const failedCount = testItems.filter(t => !t.passed).length;
  const totalDuration = Math.round(performance.now() - startTime);

  return {
    total: testItems.length,
    passed: passedCount,
    failed: failedCount,
    durationMs: totalDuration,
    results: testItems
  };
}
