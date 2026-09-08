#!/usr/bin/env node
/**
 * § 8.1 budget gate — bundler-agnostic.
 *
 * `size-limit` matches files by glob, but a static export's chunk names are
 * content-hashed and shift whenever the code changes, so a pinned-glob config
 * silently stops matching and reports a false green. This script instead reads
 * the built HTML and measures exactly what a browser loads:
 *
 *   initial route  = gzip sum of non-noModule <script src> in out/index.html
 *   deferred 3D    = gzip sum of chunks that contain three but are in NO html
 *   full descent   = initial route + ALL unreferenced chunks (initial + deferred)
 *
 * Exits non-zero on any breach. Run after `next build`.
 *
 * Thresholds are the § 8.1 numbers verbatim (KiB, matching measurements.md).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const OUT = 'out';
const INDEX_HTML_PATH = join(OUT, 'index.html');

if (!existsSync(INDEX_HTML_PATH)) {
  console.error(`\n  FAIL  ${INDEX_HTML_PATH} not found. Please run "npx next build" first.\n`);
  process.exit(1);
}

const CHUNK_DIR = join(OUT, '_next', 'static', 'chunks');
if (!existsSync(CHUNK_DIR)) {
  console.error(`\n  FAIL  ${CHUNK_DIR} not found. Please run "npx next build" first.\n`);
  process.exit(1);
}

const LIMITS = {
  initialRoute: 180 * 1024,
  deferred3D: 250 * 1024,
  fullDescent: 430 * 1024,
  fontEach: 28 * 1024,
};

const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const posix = (p) => p.replaceAll('\\', '/');
const htmlFiles = walk(OUT).filter((p) => p.endsWith('.html'));
const jsFiles = walk(CHUNK_DIR).filter((p) => p.endsWith('.js'));
/** chunk path relative to the chunks dir, posix-normalised -> absolute path */
const jsByRef = new Map(jsFiles.map((p) => [posix(relative(CHUNK_DIR, p)), p]));

// Every chunk referenced by a <script src> in any built HTML page.
const referenced = new Set();
const initialRouteRefs = new Set();
const excludedNoModuleRefs = new Set();
const INDEX_HTML = posix(INDEX_HTML_PATH);

for (const html of htmlFiles) {
  const src = readFileSync(html, 'utf8');
  const scriptTags = [...src.matchAll(/<script\b[^>]*>/gi)];
  for (const match of scriptTags) {
    const tag = match[0];
    const srcMatch = tag.match(/src=["'](\/_next\/static\/chunks\/[^"']+\.js)["']/i);
    if (!srcMatch) continue;
    const ref = srcMatch[1].replace('/_next/static/chunks/', '');
    referenced.add(ref);

    const isNoModule = /\bnomodule\b/i.test(tag);
    if (posix(html) === INDEX_HTML) {
      if (isNoModule) {
        excludedNoModuleRefs.add(ref);
      } else {
        initialRouteRefs.add(ref);
      }
    }
  }
}

const sizeOf = (ref) => {
  const hit = jsByRef.get(ref);
  if (!hit) {
    console.error(`  warn  referenced chunk not found on disk: ${ref}`);
    return 0;
  }
  return gz(readFileSync(hit));
};

const initialBreakdown = [...initialRouteRefs]
  .map((ref) => [ref, sizeOf(ref)])
  .sort((a, b) => b[1] - a[1]);
const initialRoute = initialBreakdown.reduce((n, [, s]) => n + s, 0);

const excludedNoModuleBreakdown = [...excludedNoModuleRefs]
  .map((ref) => [ref, sizeOf(ref)])
  .sort((a, b) => b[1] - a[1]);

// All chunks in CHUNK_DIR that are referenced by NO HTML page
const unreferencedChunks = jsFiles.filter((p) => {
  const ref = posix(relative(CHUNK_DIR, p));
  return !referenced.has(ref);
});

const unreferencedBreakdown = unreferencedChunks
  .map((p) => {
    const ref = posix(relative(CHUNK_DIR, p));
    const size = gz(readFileSync(p));
    const hasWebGL = readFileSync(p).includes(Buffer.from('WebGLRenderer'));
    return { p, ref, size, hasWebGL };
  })
  .sort((a, b) => b.size - a.size);

const unreferencedTotal = unreferencedBreakdown.reduce((n, item) => n + item.size, 0);

// The deferred 3D chunk(s): unreferenced chunks containing WebGLRenderer
const THREE_MARK = Buffer.from('WebGLRenderer');
const deferred3DChunks = unreferencedChunks.filter((p) => readFileSync(p).includes(THREE_MARK));
const deferred3D = deferred3DChunks.reduce((n, p) => n + gz(readFileSync(p)), 0);

// Redefined fullDescent: initial route + all unreferenced chunks
const fullDescent = initialRoute + unreferencedTotal;

const fonts = ['Satoshi-Variable.subset.woff2', 'JetBrainsMono-Variable.subset.woff2'].map((f) => {
  const p = join('public', 'fonts', f);
  return { f, size: statSync(p).size };
});

const rows = [
  ['initial route (out/index.html <script src>)', initialRoute, LIMITS.initialRoute],
  ['deferred 3D chunk', deferred3D, LIMITS.deferred3D],
  ['full-descent visitor (initial + 3D)', fullDescent, LIMITS.fullDescent],
  ...fonts.map(({ f, size }) => [`font ${f}`, size, LIMITS.fontEach]),
];

let failed = false;
console.log('\n§ 8.1 budget gate\n');
for (const [label, actual, limit] of rows) {
  const ok = actual <= limit;
  if (!ok) failed = true;
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'}  ${label.padEnd(44)} ${kb(actual).padStart(10)} / ${kb(limit)}`
  );
}

if (excludedNoModuleBreakdown.length > 0) {
  console.log('\n  Excluded noModule script(s):');
  for (const [ref, size] of excludedNoModuleBreakdown) {
    console.log(`    ${kb(size).padStart(10)}  ${ref}`);
  }
}

if (unreferencedBreakdown.length > 0) {
  console.log('\n  Unreferenced chunk(s) (deferred / dynamic):');
  for (const { ref, size, hasWebGL } of unreferencedBreakdown) {
    const note = hasWebGL ? ' (WebGLRenderer)' : '';
    console.log(`    ${kb(size).padStart(10)}  ${ref}${note}`);
  }
}

if (deferred3DChunks.length) {
  console.log(
    `\n  3D chunk is ${deferred3DChunks.length} file(s), absent from every HTML page (correct).`
  );
} else {
  failed = true;
  console.log('\n  FAIL  no deferred 3D chunk found — three may have leaked into a route bundle.');
}

if (process.env.BUDGET_VERBOSE) {
  console.log('\ninitial route breakdown:');
  for (const [ref, s] of initialBreakdown) console.log(`  ${kb(s).padStart(10)}  ${ref}`);
}

console.log('');
process.exit(failed ? 1 : 0);
