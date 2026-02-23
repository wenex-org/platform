// Suggested path for this file: libs/common/src/utils/mcp

import { readFile } from 'fs/promises';
import { join, basename } from 'path';
import { readdir } from 'fs/promises';

const DOCS_ROOT = join(process.cwd(), 'docs');

const fileCache = new Map<string, string>();
const categoryCache = new Map<string, string[]>();

export async function loadMarkdownFile(
  relativePath: string,
  fallback: string = 'No documentation available for this file.',
): Promise<string> {
  const cacheKey = `file:${relativePath}`;

  if (fileCache.has(cacheKey)) {
    return fileCache.get(cacheKey)!;
  }

  try {
    const fullPath = join(DOCS_ROOT, relativePath);
    let content = await readFile(fullPath, 'utf-8');

    content = content
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ {3,}/g, '  ');

    fileCache.set(cacheKey, content);
    return content;
  } catch (err) {
    console.warn(`Can not read markdown file: ${relativePath}`, err);
    return fallback;
  }
}

export async function loadCategoryDocs(
  category: string = 'all',
  fallback: string = 'No documentation available.',
): Promise<string> {
  const cacheKey = `category:${category}`;

  if (categoryCache.has(cacheKey)) {
    const cachedFiles = categoryCache.get(cacheKey)!;
    return cachedFiles.map((f) => fileCache.get(`file:${f}`) || '').join('\n\n---\n\n');
  }

  try {
    let filesToRead: string[] = [];

    if (category === 'all') {
      const readDirRecursive = async (dir: string): Promise<string[]> => {
        const entries = await readdir(dir, { withFileTypes: true });
        const mdFiles: string[] = [];
        for (const entry of entries) {
          const full = join(dir, entry.name);
          if (entry.isDirectory()) {
            mdFiles.push(...(await readDirRecursive(full)));
          } else if (entry.name.endsWith('.md')) {
            mdFiles.push(full.replace(DOCS_ROOT + '/', ''));
          }
        }
        return mdFiles;
      };
      filesToRead = await readDirRecursive(DOCS_ROOT);
    } else {
      const dirPath = join(DOCS_ROOT, category);
      const entries = await readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          filesToRead.push(join(category, entry.name));
        }
      }
    }

    const contents: string[] = [];
    for (const relPath of filesToRead) {
      const content = await loadMarkdownFile(relPath, '');
      if (content && content !== fallback) {
        const title = basename(relPath, '.md');
        contents.push(`# ${title}\n\n${content}`);
      }
    }

    const combined = contents.join('\n\n---\n\n') || fallback;
    categoryCache.set(cacheKey, filesToRead);
    return combined;
  } catch (err) {
    console.warn(`Error loading category ${category}`, err);
    return fallback;
  }
}
