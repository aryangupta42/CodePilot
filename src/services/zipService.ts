import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, ProjectFile, ProjectType } from '../types';

export async function exportProjectToZip(project: Project): Promise<void> {
  const zip = new JSZip();

  // Add files to zip archive
  for (const file of project.files) {
    if (file.isFolder) continue;
    // Strip leading slash for clean ZIP path
    const zipPath = file.path.replace(/^\//, '');
    zip.file(zipPath, file.content);
  }

  // Add a CodePilot metadata descriptor file
  zip.file('.codepilot.json', JSON.stringify({
    name: project.name,
    type: project.type,
    runtime: project.runtime,
    exportedAt: new Date().toISOString()
  }, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.zip`;
  saveAs(blob, filename);
}

export interface ZipImportSummary {
  name: string;
  detectedType: ProjectType;
  fileCount: number;
  files: Array<{ name: string; path: string; size: number }>;
}

export async function parseProjectZip(file: File): Promise<{
  summary: ZipImportSummary;
  projectFiles: ProjectFile[];
}> {
  // Validate file size (max 25MB)
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('Archive size exceeds the 25MB limit. Please upload a smaller project archive.');
  }

  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const projectFiles: ProjectFile[] = [];
  const summaryFiles: Array<{ name: string; path: string; size: number }> = [];

  let hasPackageJson = false;
  let hasIndexHtml = false;
  let hasPython = false;
  let hasReact = false;

  const entries = Object.keys(loadedZip.files);
  let idCounter = 1;

  for (const relativePath of entries) {
    const zipEntry = loadedZip.files[relativePath];

    // Security check: Prevent ZIP path traversal attacks
    if (relativePath.includes('..') || relativePath.startsWith('/') || relativePath.startsWith('\\')) {
      console.warn('Skipping malicious or unsafe zip path:', relativePath);
      continue;
    }

    // Skip git, mac os x resource forks, and node_modules
    if (
      relativePath.startsWith('__MACOSX') ||
      relativePath.includes('.DS_Store') ||
      relativePath.includes('/node_modules/') ||
      relativePath.startsWith('node_modules/') ||
      relativePath.startsWith('.git/')
    ) {
      continue;
    }

    if (zipEntry.dir) {
      continue;
    }

    const content = await zipEntry.async('string');
    const cleanPath = '/' + relativePath.replace(/^[./\\]+/, '');
    const filename = relativePath.split('/').pop() || relativePath;

    // Type detection heuristics
    if (filename === 'package.json') hasPackageJson = true;
    if (filename === 'index.html') hasIndexHtml = true;
    if (filename.endsWith('.py') || filename === 'requirements.txt') hasPython = true;
    if (filename.endsWith('.jsx') || filename.endsWith('.tsx') || content.includes('react')) hasReact = true;

    projectFiles.push({
      id: `imported-${idCounter++}`,
      name: filename,
      path: cleanPath,
      content
    });

    summaryFiles.push({
      name: filename,
      path: cleanPath,
      size: content.length
    });
  }

  if (projectFiles.length === 0) {
    throw new Error('No valid source files found in the ZIP archive.');
  }

  // Determine detected type
  let detectedType: ProjectType = 'web';
  if (hasReact) {
    detectedType = 'react';
  } else if (hasPython) {
    detectedType = 'python';
  } else if (hasPackageJson) {
    detectedType = 'node';
  } else if (hasIndexHtml) {
    detectedType = 'web';
  }

  const projectName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_\- ]/g, ' ').trim() || 'Imported Project';

  return {
    summary: {
      name: projectName,
      detectedType,
      fileCount: projectFiles.length,
      files: summaryFiles
    },
    projectFiles
  };
}
