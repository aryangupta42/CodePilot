import type { ProjectFile } from '../../types';

export interface WebRunBundle {
  html: string;
  css: string;
  js: string;
  fullDocument: string;
}

export function buildWebBundle(files: ProjectFile[]): WebRunBundle {
  const htmlFile = files.find(f => f.name.endsWith('.html') || f.path === '/index.html');
  const cssFiles = files.filter(f => f.name.endsWith('.css'));
  const jsFiles = files.filter(f => f.name.endsWith('.js') && !f.name.endsWith('.test.js'));

  const htmlContent = htmlFile ? htmlFile.content : '<div id="app">No index.html found</div>';
  const mergedCss = cssFiles.map(f => `/* ${f.name} */\n${f.content}`).join('\n\n');
  const mergedJs = jsFiles.map(f => `// ${f.name}\n${f.content}`).join('\n\n');

  // Inject console interceptor and error trap script
  const bridgeScript = `
<script>
(function() {
  const _send = function(type, message, file, line, col, stack) {
    try {
      window.parent.postMessage({
        source: 'codepilot-runner',
        type: type,
        message: String(message),
        file: file || 'script.js',
        line: line || null,
        col: col || null,
        stack: stack || null,
        timestamp: Date.now()
      }, '*');
    } catch(e) {}
  };

  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;
  const origInfo = console.info;

  console.log = function(...args) {
    origLog.apply(console, args);
    _send('log', args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
  };

  console.info = function(...args) {
    origInfo.apply(console, args);
    _send('info', args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
  };

  console.warn = function(...args) {
    origWarn.apply(console, args);
    _send('warn', args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
  };

  console.error = function(...args) {
    origError.apply(console, args);
    _send('error', args.map(a => typeof a === 'object' ? (a.stack || JSON.stringify(a)) : String(a)).join(' '));
  };

  window.onerror = function(msg, url, line, col, error) {
    _send('error', msg, url, line, col, error ? error.stack : null);
    return false;
  };

  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    const msg = reason && reason.message ? reason.message : String(reason);
    const stack = reason && reason.stack ? reason.stack : null;
    _send('error', 'Unhandled Promise Rejection: ' + msg, null, null, null, stack);
  });
})();
</script>
`;

  // Build complete document with inline styles and injected script
  let fullDoc = htmlContent;

  if (mergedCss) {
    const styleTag = `<style id="codepilot-injected-css">\n${mergedCss}\n</style>`;
    if (fullDoc.includes('</head>')) {
      fullDoc = fullDoc.replace('</head>', `${styleTag}\n</head>`);
    } else {
      fullDoc = `${styleTag}\n${fullDoc}`;
    }
  }

  // Inject console listener at very top of head or beginning
  if (fullDoc.includes('<head>')) {
    fullDoc = fullDoc.replace('<head>', `<head>\n${bridgeScript}`);
  } else {
    fullDoc = `${bridgeScript}\n${fullDoc}`;
  }

  // Inject JS before closing body tag
  if (mergedJs) {
    const scriptTag = `<script>\ntry {\n${mergedJs}\n} catch (e) {\n  console.error(e);\n}\n</script>`;
    if (fullDoc.includes('</body>')) {
      fullDoc = fullDoc.replace('</body>', `${scriptTag}\n</body>`);
    } else {
      fullDoc = `${fullDoc}\n${scriptTag}`;
    }
  }

  return {
    html: htmlContent,
    css: mergedCss,
    js: mergedJs,
    fullDocument: fullDoc
  };
}
