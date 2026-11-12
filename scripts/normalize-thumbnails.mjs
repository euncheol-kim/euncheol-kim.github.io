// src/posts 하위의 thumbnail 이미지를 카드에 맞는 16:9(1600x900) 규격으로 자동 정리한다.
//
// 동작 규칙
//   - 이미 16:9 비율이면 건드리지 않는다. (직접 디자인한 썸네일, 이미 정리된 썸네일)
//   - 포스트 폴더에 `.keep-thumbnail` 파일이 있으면 건드리지 않는다.
//   - 배경이 단색(흰색, 노란색 등)인 로고 이미지:
//       여백을 잘라낸 뒤 960x480 안에 들어가도록 줄이고, 같은 배경색의 1600x900 캔버스 가운데에 놓는다.
//   - 배경이 단색이 아닌 일러스트/사진:
//       전체를 1280x760 안에 들어가도록 줄이고, 원본을 크게 늘려 흐리게 만든 배경 위 가운데에 놓는다.
//   - 결과는 webp(quality 92)로 원본 자리에 덮어쓴다. 원본은 git 이력으로 복구할 수 있다.
//
// 실행
//   node scripts/normalize-thumbnails.mjs            # 전체 적용
//   node scripts/normalize-thumbnails.mjs --dry-run  # 바뀔 파일만 출력
//   node scripts/normalize-thumbnails.mjs <경로>      # 특정 파일 또는 폴더만
//
// 멱등: 한 번 정리된 파일은 16:9가 되므로 다음 실행에서 건너뛴다. 실패해도 빌드를 멈추지 않는다.
import { readdirSync, existsSync, statSync } from 'fs';
import { join, dirname, extname, resolve } from 'path';

const W = 1600;
const H = 900;
const LOGO_BOX = { width: 960, height: 480 }; // 단색 배경 로고가 차지할 최대 크기
const PHOTO_BOX = { width: 1280, height: 760 }; // 일러스트/사진이 차지할 최대 크기
const RATIO_TOLERANCE = 0.02; // 16:9 판정 허용 오차
const FLAT_STDDEV = 10; // 가장자리 색 편차가 이 값 이하면 단색 배경으로 본다
const EXTS = new Set(['.webp', '.png', '.jpg', '.jpeg']);

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.warn('[thumb] sharp 를 불러오지 못해 건너뜁니다:', e.message);
  process.exit(0);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targets = args.filter((a) => !a.startsWith('--'));
const cwd = process.cwd();

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function isThumbnail(file) {
  const ext = extname(file).toLowerCase();
  return EXTS.has(ext) && /^thumbnail\./i.test(file.split('/').pop());
}

function collect() {
  const roots = targets.length ? targets.map((t) => resolve(cwd, t)) : [join(cwd, 'src/posts')];
  const files = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    if (statSync(root).isDirectory()) files.push(...walk(root).filter(isThumbnail));
    else files.push(root);
  }
  return files;
}

// 가장자리 띠(상하좌우 2%)의 평균색과 표준편차
async function edgeStats(file, width, height) {
  const t = Math.max(2, Math.round(Math.min(width, height) * 0.02));
  const regions = [
    { left: 0, top: 0, width, height: t },
    { left: 0, top: height - t, width, height: t },
    { left: 0, top: 0, width: t, height },
    { left: width - t, top: 0, width: t, height },
  ];
  const sum = [0, 0, 0];
  const sq = [0, 0, 0];
  let n = 0;
  for (const r of regions) {
    const { data } = await sharp(file).removeAlpha().extract(r).raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 3) {
      for (let c = 0; c < 3; c++) {
        sum[c] += data[i + c];
        sq[c] += data[i + c] * data[i + c];
      }
      n++;
    }
  }
  const mean = sum.map((s) => s / n);
  const std = sq.map((s, c) => Math.sqrt(Math.max(0, s / n - mean[c] * mean[c])));
  return {
    bg: { r: Math.round(mean[0]), g: Math.round(mean[1]), b: Math.round(mean[2]) },
    stddev: Math.max(...std),
  };
}

async function normalize(file) {
  const meta = await sharp(file).metadata();
  const { width, height } = meta;
  if (!width || !height) return 'skip: 크기를 읽을 수 없음';
  if (Math.abs(width / height - 16 / 9) < RATIO_TOLERANCE) return null; // 이미 16:9
  if (existsSync(join(dirname(file), '.keep-thumbnail'))) return null;

  const { bg, stddev } = await edgeStats(file, width, height);
  const flat = stddev <= FLAT_STDDEV;
  const mode = flat ? '로고(단색 배경)' : '일러스트(흐린 배경)';
  if (dryRun) return `would: ${mode} bg=rgb(${bg.r},${bg.g},${bg.b}) ${width}x${height}`;

  let out;
  if (flat) {
    // 배경색 기준으로 여백을 잘라 내용물만 남긴다
    const content = await sharp(file)
      .flatten({ background: bg })
      .trim({ background: bg, threshold: 25 })
      .png()
      .toBuffer()
      .catch(() => null);
    const src = content ?? (await sharp(file).flatten({ background: bg }).png().toBuffer());
    const fitted = await sharp(src).resize({ ...LOGO_BOX, fit: 'inside' }).png().toBuffer();
    const m = await sharp(fitted).metadata();
    out = sharp({ create: { width: W, height: H, channels: 3, background: bg } }).composite([
      { input: fitted, left: Math.round((W - m.width) / 2), top: Math.round((H - m.height) / 2) },
    ]);
  } else {
    // 원본을 캔버스를 덮도록 키운 뒤 강하게 흐려서 배경으로 쓰고, 그 위에 원본을 가운데 놓는다
    const backdrop = await sharp(file)
      .removeAlpha()
      .resize({ width: W, height: H, fit: 'cover' })
      .blur(60)
      .modulate({ brightness: 0.92 })
      .png()
      .toBuffer();
    const fitted = await sharp(file).removeAlpha().resize({ ...PHOTO_BOX, fit: 'inside' }).png().toBuffer();
    const m = await sharp(fitted).metadata();
    out = sharp(backdrop).composite([
      { input: fitted, left: Math.round((W - m.width) / 2), top: Math.round((H - m.height) / 2) },
    ]);
  }

  const buf = await out.webp({ quality: 92 }).toBuffer();
  const dest = file.replace(/\.[^.]+$/, '.webp');
  const { writeFileSync, unlinkSync } = await import('fs');
  writeFileSync(dest, buf);
  if (dest !== file) unlinkSync(file);
  return `done: ${mode} ${width}x${height} → ${W}x${H}`;
}

let changed = 0;
for (const file of collect()) {
  try {
    const result = await normalize(file);
    if (result) {
      console.log(`[thumb] ${result}  ${file.replace(cwd + '/', '')}`);
      changed++;
    }
  } catch (e) {
    console.warn(`[thumb] 실패 (건너뜀): ${file} — ${e.message}`);
  }
}
console.log(dryRun ? `[thumb] 바뀔 파일 ${changed}개 (dry-run)` : `[thumb] 정리한 파일 ${changed}개`);
