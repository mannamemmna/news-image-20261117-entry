// One picture, one day: copies entry.png (the 17 November 2026 world-news
// front page this repository stores) to the grader's output directory, and
// refuses to hand over anything but the whole image it was asked for.
// Standard library only. Run: MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const src = new URL('./entry.png', import.meta.url);
const dst = join(out, 'entry.png');

// The gate wants a whole PNG or JPEG of at most 1 MiB and 1024x1024: check the
// bytes we are about to hand over before the grader ever sees them.
const head = readFileSync(src).subarray(0, 33);
const isPng = head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
if (!isPng) throw new Error('entry.png is not a PNG');
const size = statSync(src).size;
if (size > 1048576) throw new Error(`entry.png is ${size} bytes, over the 1 MiB cap`);
const width = head.readUInt32BE(16);
const height = head.readUInt32BE(20);
if (width > 1024 || height > 1024) throw new Error(`entry.png is ${width}x${height}, over the 1024px cap`);

// PNG integrity: the IHDR chunk must declare no interlacing (the gate reads a
// whole image, and a type-3 interlace code has tripped other entries), and the
// final chunk in the file must be IEND so the byte stream is a complete image.
const interlace = head[28];
if (interlace !== 0) throw new Error(`entry.png declares interlace method ${interlace}`);
const tail = readFileSync(src).subarray(size - 12, size);
const iendMagic = Buffer.from([0x49, 0x45, 0x4e, 0x44]); // 'IEND'
if (!tail.subarray(4, 8).equals(iendMagic)) throw new Error('entry.png does not end in an IEND chunk');

copyFileSync(src, dst);
console.log(`wrote ${dst} (${size} bytes, ${width}x${height} PNG, interlace ${interlace})`);
