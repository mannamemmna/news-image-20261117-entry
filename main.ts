#!/usr/bin/env node
// One picture, one day: copies entry.png (the 17 November 2026 world-news
// front page this repository stores) to the grader's output directory.
// Standard library only. Run: MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const src = new URL('./entry.png', import.meta.url);
const dst = join(out, 'entry.png');
copyFileSync(src, dst);
console.log('wrote', dst);
