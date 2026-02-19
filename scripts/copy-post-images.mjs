import { cpSync, mkdirSync, readdirSync } from 'fs';
import { join, relative, dirname, extname } from 'path';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

function copyImages(rootSrc, rootDest, currentDir) {
  let count = 0;
  for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
    const fullPath = join(currentDir, entry.name);
    if (entry.isDirectory()) {
      count += copyImages(rootSrc, rootDest, fullPath);
    } else if (IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      const rel = relative(rootSrc, fullPath);
      const dest = join(rootDest, rel);
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(fullPath, dest);
      count++;
    }
  }
  return count;
}

const cwd = process.cwd();

const postSrc = join(cwd, 'src/posts');
const projectSrc = join(cwd, 'src/projects');

const postCount = copyImages(postSrc, join(cwd, 'public/posts'), postSrc);
const projectCount = copyImages(projectSrc, join(cwd, 'public/projects'), projectSrc);

console.log(`Copied ${postCount} post images, ${projectCount} project images`);
