import fs from 'fs-extra';
import path from 'path';

export async function isDirEmpty(dirPath: string): Promise<boolean> {
  if (!(await fs.pathExists(dirPath))) return true;
  const files = await fs.readdir(dirPath);
  return files.length === 0;
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.outputFile(filePath, content);
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export function replaceTokens(content: string, tokens: Record<string, string>): string {
  let result = content;
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replaceAll(token, value);
  }
  return result;
}

export async function copyDirRecursive(src: string, dest: string, tokens?: Record<string, string>): Promise<void> {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath, tokens);
    } else {
      let content = await readFile(srcPath);
      if (tokens) {
        content = replaceTokens(content, tokens);
      }
      await writeFile(destPath, content);
    }
  }
}
