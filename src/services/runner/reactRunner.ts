import type { ProjectFile } from '../../types';

export function buildReactBundle(files: ProjectFile[]): string {
  const appFile = files.find(f => f.name.endsWith('.tsx') || f.name.endsWith('.jsx'));
  const cssFiles = files.filter(f => f.name.endsWith('.css'));

  const appCode = appFile ? appFile.content : `export default function App() { return <div>No App.tsx found</div>; }`;
  const mergedCss = cssFiles.map(f => f.content).join('\n\n');

  // Clean imports from appCode for standalone Babel execution
  // Remove import React, { useState } from 'react'; etc.
  const cleanedAppCode = appCode
    .replace(/import\s+React\s*,\s*\{([^}]+)\}\s+from\s+['"]react['"];?/g, 'const {$1} = React;')
    .replace(/import\s+\{([^}]+)\}\s+from\s+['"]react['"];?/g, 'const {$1} = React;')
    .replace(/import\s+React\s+from\s+['"]react['"];?/g, '// React global used')
    .replace(/import\s+['"][^'"]+\.css['"];?/g, '')
    .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1')
    .replace(/export\s+default\s+([A-Za-z0-9_]+);?/g, 'window.__MainApp = $1;')
    + '\nwindow.__MainApp = typeof App !== "undefined" ? App : (typeof __MainApp !== "undefined" ? __MainApp : null);';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      margin: 0;
      background-color: #080A0F;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    ${mergedCss}
  </style>
  <script>
    (function() {
      const _send = function(type, message, file, line, col, stack) {
        try {
          window.parent.postMessage({
            source: 'codepilot-runner',
            type: type,
            message: String(message),
            file: file || 'App.tsx',
            line: line || null,
            col: col || null,
            stack: stack || null,
            timestamp: Date.now()
          }, '*');
        } catch(e) {}
      };

      const origLog = console.log;
      const origError = console.error;
      const origWarn = console.warn;

      console.log = function(...args) {
        origLog.apply(console, args);
        _send('log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };

      console.warn = function(...args) {
        origWarn.apply(console, args);
        _send('warn', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };

      console.error = function(...args) {
        origError.apply(console, args);
        _send('error', args.map(a => typeof a === 'object' ? (a.stack || JSON.stringify(a)) : String(a)).join(' '));
      };

      window.onerror = function(msg, url, line, col, error) {
        _send('error', msg, 'App.tsx', line, col, error ? error.stack : null);
        return false;
      };
    })();
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react,typescript">
    try {
      ${cleanedAppCode}
      
      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }
        static getDerivedStateFromError(error) {
          return { hasError: true, error };
        }
        componentDidCatch(error, errorInfo) {
          console.error("React Component Crash:", error.message, errorInfo.componentStack);
        }
        render() {
          if (this.state.hasError) {
            return (
              <div style={{ padding: 24, background: '#1A0B0E', border: '1px solid #F43F5E', borderRadius: 8, margin: 20, color: '#FECDD3' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#FB7185' }}>React Render Error</h3>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13 }}>{this.state.error?.message}</pre>
              </div>
            );
          }
          return this.props.children;
        }
      }

      const rootElement = document.getElementById('root');
      if (window.__MainApp && ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
          <ErrorBoundary>
            <window.__MainApp />
          </ErrorBoundary>
        );
      } else {
        console.error("Could not find default exported React component in App.tsx");
      }
    } catch (err) {
      console.error("Compilation / Execution Error:", err);
    }
  </script>
</body>
</html>`;
}
