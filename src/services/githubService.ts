import type { ProjectFile, ProjectType } from '../types';

export interface GitHubImportResult {
  projectName: string;
  detectedType: ProjectType;
  files: ProjectFile[];
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const cleanUrl = url.trim();
  const match = cleanUrl.match(/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/i, '') };
  }
  const shorthandMatch = cleanUrl.match(/^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/);
  if (shorthandMatch) {
    return { owner: shorthandMatch[1], repo: shorthandMatch[2] };
  }
  return null;
}

export async function fetchGitHubRepo(
  url: string,
  onProgress?: (message: string) => void
): Promise<GitHubImportResult> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL. Format should be: https://github.com/owner/repo');
  }

  const { owner, repo } = parsed;
  onProgress?.(`Contacting GitHub API for ${owner}/${repo}...`);

  // 1. Get repository info to get default branch
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (repoRes.status === 404) {
    throw new Error(`Repository "${owner}/${repo}" was not found or is private. Only public repositories can be imported.`);
  }
  if (repoRes.status === 403) {
    throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes or import via ZIP.');
  }
  if (!repoRes.ok) {
    throw new Error(`Failed to fetch repository metadata: HTTP ${repoRes.status}`);
  }

  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || 'main';

  onProgress?.(`Fetching file tree from branch "${defaultBranch}"...`);

  // 2. Fetch git tree recursively
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
  if (!treeRes.ok) {
    throw new Error(`Failed to fetch tree structure for branch "${defaultBranch}".`);
  }

  const treeData = await treeRes.json();
  const rawTree = treeData.tree as Array<{ path: string; type: string; size?: number; url: string }>;

  // Filter relevant text/code files (exclude binary, images, lockfiles, git)
  const candidateFiles = rawTree.filter(item => {
    if (item.type !== 'blob') return false;
    const p = item.path.toLowerCase();
    if (p.startsWith('.') || p.includes('/.') || p.includes('node_modules/') || p.includes('vendor/')) return false;
    if (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.jpeg') || p.endsWith('.gif') || p.endsWith('.ico') || p.endsWith('.pdf') || p.endsWith('.woff') || p.endsWith('.lock') || p.endsWith('-lock.json')) return false;
    if (item.size && item.size > 200 * 1024) return false; // skip files > 200KB
    return true;
  }).slice(0, 30); // limit to 30 files for responsiveness

  if (candidateFiles.length === 0) {
    throw new Error('No compatible code or text files found in the repository.');
  }

  const projectFiles: ProjectFile[] = [];
  let fileId = 1;

  let hasPackageJson = false;
  let hasIndexHtml = false;
  let hasPython = false;
  let hasReact = false;

  for (let i = 0; i < candidateFiles.length; i++) {
    const item = candidateFiles[i];
    onProgress?.(`Downloading ${item.path} (${i + 1}/${candidateFiles.length})...`);

    try {
      const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${item.path}`);
      if (rawRes.ok) {
        const content = await rawRes.text();
        const filename = item.path.split('/').pop() || item.path;

        if (filename === 'package.json') hasPackageJson = true;
        if (filename === 'index.html') hasIndexHtml = true;
        if (filename.endsWith('.py')) hasPython = true;
        if (filename.endsWith('.jsx') || filename.endsWith('.tsx') || content.includes('react')) hasReact = true;

        projectFiles.push({
          id: `gh-${fileId++}`,
          name: filename,
          path: '/' + item.path,
          content
        });
      }
    } catch (e) {
      console.warn('Failed to fetch file content:', item.path, e);
    }
  }

  let detectedType: ProjectType = 'web';
  if (hasReact) detectedType = 'react';
  else if (hasPython) detectedType = 'python';
  else if (hasPackageJson) detectedType = 'node';
  else if (hasIndexHtml) detectedType = 'web';

  return {
    projectName: repoData.name || repo,
    detectedType,
    files: projectFiles
  };
}
