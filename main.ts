// news-image-20261124 entry (Node 22, standard library only).
// The front page lives beside this file as entry.png: JPEG bytes under
// the entry.png name, which the competition allows (the format is told
// apart by magic bytes, not by extension). This program writes those
// exact bytes to /output/entry.png, so both grader runs produce the
// same file. No network, no dependencies, no randomness.
//
// Local check: MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const outPath = resolve(outDir, 'entry.png');

const image = await readFile(sourcePath);
const size = (await stat(sourcePath)).size;

// The entry must be a JPEG (FF D8 FF magic) inside the 1 MiB limit.
const isJpeg = image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
if (!isJpeg) {
  throw new Error(`entry.png is not a JPEG (first bytes: ${image.subarray(0, 3).toString('hex')})`);
}
if (size > 1048576) {
  throw new Error(`entry.png is ${size} bytes, over the 1048576-byte limit`);
}

await mkdir(outDir, { recursive: true });
await writeFile(outPath, image);

// Read the written file back and compare it byte for byte, so a
// partial or corrupted write fails loudly instead of silently
// reaching the grader.
const written = await readFile(outPath);
if (!Buffer.from(written).equals(image)) {
  throw new Error('written entry.png does not match the source bytes');
}
console.log(`wrote ${outPath} (${written.length} bytes, identical to source)`);
