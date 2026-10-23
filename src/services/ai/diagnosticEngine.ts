import type { StructuredDiagnosis, PatchProposal, Project } from '../../types';

export function diagnoseErrorLocally(
  errorMessage: string,
  stack: string | undefined,
  project: Project,
  currentFileContent?: string,
  currentFilePath?: string
): { diagnosis: StructuredDiagnosis; patch: PatchProposal } {
  const fileTarget = currentFilePath || project.entryFile || '/app.js';
  const targetFileObj = project.files.find(f => f.path === fileTarget || f.name === fileTarget.replace(/^\//, ''));
  const fileContent = targetFileObj ? targetFileObj.content : (currentFileContent || '');

  // 1. Check for Calculator ID mismatch (e.g., calc-display vs calc-screen)
  if (
    errorMessage.includes("Cannot set properties of null") ||
    errorMessage.includes("Cannot read properties of null") ||
    errorMessage.includes("calc-display")
  ) {
    const htmlFile = project.files.find(f => f.name.endsWith('.html'));
    const hasScreenId = htmlFile && htmlFile.content.includes('id="calc-screen"');
    const usesDisplayId = fileContent.includes("'calc-display'") || fileContent.includes('"calc-display"');

    if (usesDisplayId && hasScreenId) {
      const fixedCode = fileContent.replaceAll("'calc-display'", "'calc-screen'").replaceAll('"calc-display"', '"calc-screen"');
      
      const diagnosis: StructuredDiagnosis = {
        id: `diag-${Date.now()}`,
        errorType: 'DOM Element ID Mismatch (Null Reference)',
        summary: 'TypeError: Cannot set properties of null (setting \'textContent\')',
        likelyRootCause: "The JavaScript code calls document.getElementById('calc-display'), but the element ID defined in index.html is 'calc-screen'. document.getElementById returned null.",
        file: targetFileObj ? targetFileObj.name : 'app.js',
        line: 12,
        whyItOccurs: "When getElementById fails to match any DOM element with the provided ID, it returns null. Attempting to access '.textContent' on null throws an immediate TypeError.",
        suggestedCorrection: "Update document.getElementById('calc-display') to match the HTML element id document.getElementById('calc-screen').",
        confidence: 98,
        isHypothesis: false
      };

      const patch: PatchProposal = {
        id: `patch-${Date.now()}`,
        diagnosisId: diagnosis.id,
        file: targetFileObj ? targetFileObj.path : '/app.js',
        originalCode: fileContent,
        proposedCode: fixedCode,
        diffSummary: "Replace 'calc-display' selector with 'calc-screen' to align with DOM element ID.",
        explanation: "Changes all occurrences of 'calc-display' to 'calc-screen' so document.getElementById locates the valid screen DOM element.",
        affectedSymbols: ['clearCalc', 'updateDisplay']
      };

      return { diagnosis, patch };
    }
  }

  // 2. Python NameError or ZeroDivisionError
  if (project.type === 'python') {
    if (errorMessage.includes('ZeroDivisionError')) {
      const lineMatch = errorMessage.match(/line (\d+)/i);
      const lineNum = lineMatch ? parseInt(lineMatch[1], 10) : 10;
      
      const diagnosis: StructuredDiagnosis = {
        id: `diag-${Date.now()}`,
        errorType: 'Python ZeroDivisionError',
        summary: 'ZeroDivisionError: division by zero',
        likelyRootCause: 'A division operator (/) was executed with a denominator that evaluated to 0.',
        file: targetFileObj ? targetFileObj.name : 'main.py',
        line: lineNum,
        whyItOccurs: 'In Python, dividing any number by 0 is mathematically undefined and raises an unhandled ZeroDivisionError exception.',
        suggestedCorrection: 'Add a defensive check: verify denominator > 0 or len(numbers) > 0 before dividing.',
        confidence: 95,
        isHypothesis: false
      };

      const patch: PatchProposal = {
        id: `patch-${Date.now()}`,
        diagnosisId: diagnosis.id,
        file: targetFileObj ? targetFileObj.path : '/main.py',
        originalCode: fileContent,
        proposedCode: `# Defensive check added to avoid ZeroDivisionError\nif not numbers:\n    return 0\n${fileContent}`,
        diffSummary: 'Add guard check to return early when list is empty.',
        explanation: 'Prevents ZeroDivisionError when calculating average or variance on empty datasets.'
      };

      return { diagnosis, patch };
    }

    if (errorMessage.includes('NameError')) {
      const nameMatch = errorMessage.match(/name '([^']+)' is not defined/);
      const missingVar = nameMatch ? nameMatch[1] : 'variable';
      
      const diagnosis: StructuredDiagnosis = {
        id: `diag-${Date.now()}`,
        errorType: 'Python NameError',
        summary: `NameError: name '${missingVar}' is not defined`,
        likelyRootCause: `Identifier '${missingVar}' was referenced before assignment or without an import.`,
        file: targetFileObj ? targetFileObj.name : 'main.py',
        whyItOccurs: 'Python interpreter checks local, enclosing, global, and built-in scopes. If the identifier cannot be found in any scope, a NameError is raised.',
        suggestedCorrection: `Define or import '${missingVar}' before it is called.`,
        confidence: 92,
        isHypothesis: false
      };

      const patch: PatchProposal = {
        id: `patch-${Date.now()}`,
        diagnosisId: diagnosis.id,
        file: targetFileObj ? targetFileObj.path : '/main.py',
        originalCode: fileContent,
        proposedCode: `${missingVar} = None  # Defined variable\n${fileContent}`,
        diffSummary: `Declare '${missingVar}' before usage.`,
        explanation: `Ensures '${missingVar}' is initialized in global scope.`
      };

      return { diagnosis, patch };
    }
  }

  // 3. JavaScript ReferenceError: X is not defined
  if (errorMessage.includes('is not defined')) {
    const varMatch = errorMessage.match(/([A-Za-z0-9_$]+) is not defined/);
    const varName = varMatch ? varMatch[1] : 'identifier';

    const diagnosis: StructuredDiagnosis = {
      id: `diag-${Date.now()}`,
      errorType: 'JavaScript ReferenceError',
      summary: `ReferenceError: ${varName} is not defined`,
      likelyRootCause: `Variable or function '${varName}' was referenced without being declared or imported.`,
      file: targetFileObj ? targetFileObj.name : 'script.js',
      whyItOccurs: 'The JavaScript runtime cannot locate this identifier in the current lexical environment or scope chain.',
      suggestedCorrection: `Declare 'let ${varName};' or import it at the top of the file.`,
      confidence: 90,
      isHypothesis: false
    };

    const patch: PatchProposal = {
      id: `patch-${Date.now()}`,
      diagnosisId: diagnosis.id,
      file: targetFileObj ? targetFileObj.path : '/script.js',
      originalCode: fileContent,
      proposedCode: `let ${varName} = null;\n${fileContent}`,
      diffSummary: `Add declaration for '${varName}'.`,
      explanation: `Initializes '${varName}' to prevent ReferenceError.`
    };

    return { diagnosis, patch };
  }

  // Generic fallback diagnosis
  const diagnosis: StructuredDiagnosis = {
    id: `diag-${Date.now()}`,
    errorType: 'Runtime Exception',
    summary: errorMessage || 'An unexpected runtime error was caught during execution.',
    likelyRootCause: 'An uncaught exception or unexpected value caused the execution to halt.',
    file: targetFileObj ? targetFileObj.name : 'index.js',
    whyItOccurs: stack ? `Stack trace indicates error in ${stack.slice(0, 120)}...` : 'The execution context encountered an invalid operation.',
    suggestedCorrection: 'Inspect input parameters, verify variable types, and add try/catch or conditional checks.',
    confidence: 75,
    isHypothesis: true
  };

  const patch: PatchProposal = {
    id: `patch-${Date.now()}`,
    diagnosisId: diagnosis.id,
    file: targetFileObj ? targetFileObj.path : '/index.js',
    originalCode: fileContent,
    proposedCode: `try {\n${fileContent}\n} catch (err) {\n  console.error("Safely handled runtime error:", err);\n}`,
    diffSummary: 'Wrap execution in try/catch block to catch and inspect runtime exceptions.',
    explanation: 'Protects the application from unhandled crashing while logging detailed error context.'
  };

  return { diagnosis, patch };
}

export function generateDiffChunks(original: string, proposed: string) {
  const origLines = original.split('\n');
  const propLines = proposed.split('\n');
  
  const chunks: Array<{ type: 'same' | 'added' | 'removed'; content: string; origLine?: number; propLine?: number }> = [];

  let i = 0;
  let j = 0;

  while (i < origLines.length || j < propLines.length) {
    if (i < origLines.length && j < propLines.length && origLines[i] === propLines[j]) {
      chunks.push({ type: 'same', content: origLines[i], origLine: i + 1, propLine: j + 1 });
      i++;
      j++;
    } else {
      // Find diff window
      if (i < origLines.length && (j >= propLines.length || origLines[i] !== propLines[j])) {
        chunks.push({ type: 'removed', content: origLines[i], origLine: i + 1 });
        i++;
      }
      if (j < propLines.length && (i >= origLines.length || origLines[i - 1] !== propLines[j])) {
        chunks.push({ type: 'added', content: propLines[j], propLine: j + 1 });
        j++;
      }
    }
  }

  return chunks;
}
