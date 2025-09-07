import fs from 'node:fs';
import path from 'node:path';

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function readDirSafe(dir: string): string[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((n) => IMG_EXT.has(path.extname(n).toLowerCase()) && !n.startsWith('.'))
      .sort();
  } catch {
    return [];
  }
}

function publicPathFor(category: string, bucket: 'big' | 'small', file: string): string {
  return `/assets/portfolio/${category}/${bucket}/${file}`;
}

export function listImages(category: string): Array<{ src: string; alt?: string; size?: 'full'|'half'|'quarter' }> {
  const root = path.resolve(process.cwd(), 'public', 'assets', 'portfolio', category);
  const bigDir = path.join(root, 'big');
  const smallDir = path.join(root, 'small');

  const bigFiles = readDirSafe(bigDir);
  const smallFiles = readDirSafe(smallDir);

  // Map to src-only; Gallery component will classify by /big/ vs /small/
  const big = bigFiles.map((f) => ({ src: publicPathFor(category, 'big', f) }));
  const small = smallFiles.map((f) => ({ src: publicPathFor(category, 'small', f) }));

  // Interleave using the same pattern as Gallery (Big, Small, Small then reverse) is handled inside Gallery.
  // Here we can just concatenate; Gallery will handle ordering by buckets.
  return [...big, ...small];
}
