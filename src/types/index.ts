export type ProjectType = 'web' | 'react' | 'python' | 'node';

export const CODING_RUNTIMES = ['browser-native', 'react-compiler', 'pyodide-wasm', 'js-sandbox'] as const;

export interface ProjectFile {
  id: string;
  name: string;
  path: string; // e.g. "/src/App.tsx" or "/index.html"
  content: string;
  isFolder?: boolean;
  parentId?: string; // parent folder id or null for root
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  runtime: 'browser-native' | 'react-compiler' | 'pyodide-wasm' | 'js-sandbox';
  runtimeSupport: 'full' | 'partial' | 'experimental';
  files: ProjectFile[];
  createdAt: number;
  updatedAt: number;
  entryFile: string;
  tests?: ProjectTest[];
}

export interface ProjectTest {
  id: string;
  name: string;
  code: string;
  targetFile: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  icon: string;
  runtime: 'browser-native' | 'react-compiler' | 'pyodide-wasm' | 'js-sandbox';
  runtimeSupport: 'full' | 'partial' | 'experimental';
  runtimeNote: string;
  entryFile: string;
  files: Omit<ProjectFile, 'id'>[];
  sampleTests?: Omit<ProjectTest, 'id'>[];
}

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'system';
  message: string;
  timestamp: number;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
}

export interface ExecutionResult {
  success: boolean;
  exitCode: number;
  durationMs: number;
  stdout: string[];
  stderr: string[];
  error?: {
    message: string;
    file?: string;
    line?: number;
    column?: number;
    stack?: string;
  };
}

export interface TestResultItem {
  id: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export interface TestRunResult {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestResultItem[];
}

export interface StructuredDiagnosis {
  id: string;
  errorType: string;
  summary: string;
  likelyRootCause: string;
  file: string;
  line?: number;
  column?: number;
  whyItOccurs: string;
  suggestedCorrection: string;
  confidence: number; // 0 to 100
  isHypothesis: boolean;
}

export interface PatchProposal {
  id: string;
  diagnosisId: string;
  file: string;
  originalCode: string;
  proposedCode: string;
  diffSummary: string;
  explanation: string;
  affectedSymbols?: string[];
}

export type VerificationStatus = 
  | 'idle' 
  | 'pending_run' 
  | 'verified_passed' 
  | 'verification_failed' 
  | 'verification_unavailable';

export interface DebugSession {
  id: string;
  projectId: string;
  timestamp: number;
  errorSummary: string;
  diagnosis: StructuredDiagnosis;
  patch: PatchProposal;
  status: 'proposed' | 'applied' | 'rejected' | 'rolled_back';
  verificationStatus: VerificationStatus;
  verificationMessage?: string;
}

export type AiMode = 'ask' | 'explain' | 'debug' | 'fix' | 'test' | 'learn';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mode?: AiMode;
  codeSnippet?: string;
  diagnosis?: StructuredDiagnosis;
  patch?: PatchProposal;
  status?: string;
}

export interface AiSettings {
  provider: 'gemini' | 'openai' | 'custom' | 'demo';
  apiKey?: string;
  model?: string;
  useDemoMode: boolean;
  serverUrl?: string;
}

export type ActivityEventType =
  | 'project_created'
  | 'file_edited'
  | 'project_executed'
  | 'patch_applied'
  | 'test_run'
  | 'project_imported'
  | 'rollback_applied';

export interface ActivityEvent {
  id: string;
  projectId?: string;
  projectName?: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: number;
  status: 'success' | 'failure' | 'info' | 'warning';
}

export interface RuntimeSystemStatus {
  browserNative: 'ready' | 'loading' | 'unavailable';
  reactCompiler: 'ready' | 'loading' | 'unavailable';
  pythonWasm: 'ready' | 'loading' | 'unavailable';
  jsSandbox: 'ready' | 'loading' | 'unavailable';
  aiProvider: string;
  aiProviderMode: 'live-server' | 'built-in-offline';
  serverConnected: boolean;
}

export type WorkspaceTab =
  | 'overview'
  | 'projects'
  | 'debug_center'
  | 'tests'
  | 'history'
  | 'templates'
  | 'settings';

