// src/posts, src/projects 하위의 png/jpg/jpeg 이미지를 항상 WebP로 변환한다.
// - 원본 이미지는 변환 후 삭제하고, 같은 폴더의 .mdx가 참조하는 확장자도 .webp로 바꾼다.
// - 이미 webp만 있으면 아무것도 하지 않는다(멱등). 실패해도 빌드를 멈추지 않는다.
import { readdirSync, statSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join, extname, dirname, basename } from 'path';

const QUALITY = 30; // 화질보다 용량을 우선(글씨는 읽을 수 있는 수준)
const SRC_EXTS = new Set(['.png', '.jpg', '.jpeg']);
const ROOTS = ['src/posts', 'src/projects'];

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.warn('[webp] sharp 를 불러오지 못해 변환을 건너뜁니다:', e.message);
  process.exit(0);
}

const cwd = process.cwd();

// 하위 파일 재귀 수집
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

let converted = 0;
let beforeBytes = 0;
let afterBytes = 0;

for (const root of ROOTS) {
  const abs = join(cwd, root);
  if (!existsSync(abs)) continue;

  for (const file of walk(abs)) {
    const ext = extname(file).toLowerCase();
    if (!SRC_EXTS.has(ext)) continue;

    const out = file.slice(0, -ext.length) + '.webp';
    try {
      const before = statSync(file).size;
      await sharp(file).webp({ quality: QUALITY }).toFile(out);
      const after = statSync(out).size;
      unlinkSync(file);
      beforeBytes += before;
      afterBytes += after;
      converted++;
    } catch (e) {
      console.warn(`[webp] 변환 실패 (건너뜀): ${file} — ${e.message}`);
    }
  }
}

// mdx 안의 .png/.jpg/.jpeg 참조 중, 같은 폴더에 .webp 가 실제로 존재하는 것만 .webp 로 치환
let rewritten = 0;
for (const root of ROOTS) {
  const abs = join(cwd, root);
  if (!existsSync(abs)) continue;

  for (const file of walk(abs)) {
    if (extname(file).toLowerCase() !== '.mdx') continue;
    const original = readFileSync(file, 'utf8');
    const folder = dirname(file);

    const updated = original.replace(/([\w./-]+)\.(png|jpe?g)/gi, (match, stem) => {
      const webpName = basename(stem) + '.webp';
      // 참조 대상이 실제 변환된 webp 로 존재할 때만 치환(오탐 방지)
      return existsSync(join(folder, webpName)) ? stem + '.webp' : match;
    });

    if (updated !== original) {
      writeFileSync(file, updated);
      rewritten++;
    }
  }
}

if (converted > 0) {
  const mb = (n) => (n / 1048576).toFixed(2);
  console.log(
    `[webp] ${converted}개 변환 (${mb(beforeBytes)}MB → ${mb(afterBytes)}MB), mdx ${rewritten}개 참조 갱신`
  );
} else {
  console.log('[webp] 변환할 이미지 없음 (모두 webp)');
}
