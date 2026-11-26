// news-image-20261125 entrypoint (Node 22, standard library only).
// The front page was rendered beforehand and sits next to this file as
// entry.png. This program hands those exact bytes to the grader: it
// checks the file is a JPEG inside the size cap, drops it into the
// output directory, then reads it back and proves the copy matches.
// Nothing is fetched, generated, or random here.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const MAX_BYTES = 1024 * 1024;
const JPEG_PREFIX = Buffer.from([0xff, 0xd8, 0xff]);

const base = dirname(fileURLToPath(import.meta.url));
const source = join(base, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outDir, "entry.png");

function fail(message: string): never {
  console.error(`news-image-20261125: ${message}`);
  process.exit(1);
}

if (!existsSync(source)) fail(`missing input image: ${source}`);

const picture = readFileSync(source);
if (picture.length === 0 || picture.length > MAX_BYTES) {
  fail(`input image is ${picture.length} bytes; limit is ${MAX_BYTES}`);
}
if (!picture.subarray(0, 3).equals(JPEG_PREFIX)) {
  fail("input image does not start with the JPEG magic bytes");
}

mkdirSync(outDir, { recursive: true });
writeFileSync(target, picture);

const written = readFileSync(target);
if (!written.equals(picture)) fail("read-back check failed: output differs from input");
const digest = createHash("sha256").update(written).digest("hex");
console.log(`wrote ${target} (${written.length} bytes, sha256 ${digest})`);
