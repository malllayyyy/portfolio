import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const DEPTH_TABLE = [
  [0.000,   +6.0], [0.030,    0.0], [0.075,   -2.0], [0.135,   -8.0],
  [0.170,  -12.0], [0.235,  -30.0], [0.270,  -36.0], [0.300,  -40.0],
  [0.330,  -44.0], [0.400,  -52.0], [0.470,  -70.0], [0.560, -112.0],
  [0.600, -120.0], [0.640, -124.0], [0.690, -134.0], [0.730, -150.0],
  [0.830, -248.0], [0.870, -260.0], [0.930, -278.0], [0.965, -290.0],
  [1.000, -300.0],
];

function tOfDepth(y) {
  const LEN = DEPTH_TABLE.length;
  if (y >= DEPTH_TABLE[0][1]) return DEPTH_TABLE[0][0];
  if (y <= DEPTH_TABLE[LEN - 1][1]) return DEPTH_TABLE[LEN - 1][0];

  let low = 0;
  let high = LEN - 1;

  while (low <= high - 2) {
    const mid = Math.floor((low + high) / 2);
    if (DEPTH_TABLE[mid][1] >= y && y >= DEPTH_TABLE[mid + 1][1]) {
      low = mid;
      break;
    } else if (DEPTH_TABLE[mid][1] < y) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  const i = low;
  const y0 = DEPTH_TABLE[i][1];
  const y1 = DEPTH_TABLE[i + 1][1];
  const t0 = DEPTH_TABLE[i][0];
  const t1 = DEPTH_TABLE[i + 1][0];

  const ratio = (y - y0) / (y1 - y0);
  return t0 + ratio * (t1 - t0);
}

const CHROME_PATH =
  process.env.CHROME_PATH ||
  'C:/Users/Malay/.cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe';
const SITE_URL = process.env.SITE_URL || 'http://127.0.0.1:4321/';
const MAX_STILL_BYTES = 71680; // 70 KB
const MAX_TOTAL_BYTES = 389120; // 380 KB

const STILL_TARGETS = [
  { name: 'surface', depth: 0 },
  { name: 'device-approach', depth: -38 },
  { name: 'device', depth: -40 },
  { name: 'engine', depth: -120 },
  { name: 'reasoning', depth: -260 },
];

async function main() {
  console.log(`[bake-stills] Launching Chrome at: ${CHROME_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1600, height: 1000, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();

    // Force tier=high in localStorage before page load
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('substrate-tier', 'high');
    });

    console.log(`[bake-stills] Navigating to ${SITE_URL}...`);
    await page.goto(SITE_URL, { waitUntil: 'networkidle0' });

    // Trigger scroll intent so 3D chunk mounts
    await page.evaluate(() => {
      window.scrollTo(0, 1);
      window.dispatchEvent(new Event('scroll'));
    });

    console.log('[bake-stills] Waiting for 3D canvas element...');
    await page.waitForSelector('canvas', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Exhaustive hide strategy:
    // Every visible DOM element on the page lives inside <body>. By setting opacity: 0,
    // visibility: hidden, pointer-events: none on every direct child of <body> except the
    // top-level wrapper containing <canvas> (`body > *:not(:has(canvas))`), we guarantee
    // that all current and future DOM chrome, overlays, cards, panels, HUD elements,
    // and route announcers are completely hidden without maintaining fragile selector lists.
    await page.addStyleTag({
      content: `
        body > *:not(:has(canvas)) {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        canvas {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `,
    });

    // Verify canvas is still rendering after CSS injection
    const isCanvasRendering = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return false;
      const s = window.getComputedStyle(c);
      return s.visibility === 'visible' && parseFloat(s.opacity) > 0 && c.clientWidth > 0 && c.clientHeight > 0;
    });
    if (!isCanvasRendering) {
      throw new Error('Canvas element is hidden or collapsed after hide CSS injection');
    }

    const publicStillsDir = path.join(process.cwd(), 'public', 'stills');
    if (!fs.existsSync(publicStillsDir)) {
      fs.mkdirSync(publicStillsDir, { recursive: true });
    }

    let totalBytes = 0;
    const results = [];

    for (const still of STILL_TARGETS) {
      const targetT = tOfDepth(still.depth);

      // Scroll to target progress
      await page.evaluate((t) => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, t * maxScroll);
        window.dispatchEvent(new Event('scroll'));
      }, targetT);

      // Wait >= 950 ms and poll for camera convergence (GSAP scrub lag ~600 ms)
      const startTime = Date.now();
      let actualY = 0;
      let rig = null;

      while (Date.now() - startTime < 3000) {
        await new Promise((r) => setTimeout(r, 100));
        rig = await page.evaluate(() => window.__rig);
        actualY = rig?.cameraY ?? 0;
        if (Date.now() - startTime >= 950 && Math.abs(actualY - still.depth) <= 0.5) {
          break;
        }
      }

      // Wait for rAF so WebGL renders the converged frame
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

      // Element-scoped screenshot of canvas element
      const canvasHandle = await page.waitForSelector('canvas', { timeout: 10000 });
      if (!canvasHandle) {
        throw new Error(`Canvas element handle not found for ${still.name}`);
      }
      const pngBuf = await canvasHandle.screenshot({ type: 'png' });
      let quality = 78;
      let avifBuf = await sharp(pngBuf)
        .avif({ quality, effort: 7, chromaSubsampling: '4:2:0' })
        .toBuffer();

      while (avifBuf.length > MAX_STILL_BYTES && quality > 8) {
        quality -= 3;
        avifBuf = await sharp(pngBuf)
          .avif({ quality, effort: 7, chromaSubsampling: '4:2:0' })
          .toBuffer();
      }

      if (avifBuf.length > MAX_STILL_BYTES) {
        throw new Error(
          `Still ${still.name} exceeded ${MAX_STILL_BYTES} B budget even at low quality (got ${avifBuf.length} B)`
        );
      }

      // Verify magic bytes (ftypavif)
      const magicAscii = avifBuf.toString('ascii', 4, 12);
      if (magicAscii !== 'ftypavif') {
        throw new Error(`Invalid AVIF magic bytes for ${still.name}: ${magicAscii}`);
      }

      const outPath = path.join(publicStillsDir, `${still.name}.avif`);
      fs.writeFileSync(outPath, avifBuf);

      totalBytes += avifBuf.length;
      results.push({
        name: still.name,
        requestedDepth: still.depth,
        verifiedCameraY: actualY,
        byteSize: avifBuf.length,
        magic: magicAscii,
        quality,
      });

      console.log(
        `[bake-stills] ${still.name}.avif | Requested: ${still.depth} m | Verified: ${actualY.toFixed(
          2
        )} m | Size: ${avifBuf.length} B (${(avifBuf.length / 1024).toFixed(
          1
        )} KB) | Q: ${quality} | Magic: ${magicAscii}`
      );
    }

    console.log('\n--- BAKE SUMMARY ---');
    for (const r of results) {
      console.log(
        `- ${r.name}.avif: depth ${r.requestedDepth} m (verified ${r.verifiedCameraY.toFixed(
          2
        )} m), ${r.byteSize} B, magic '${r.magic}'`
      );
    }
    console.log(
      `Total: ${totalBytes} B (${(totalBytes / 1024).toFixed(1)} KB) / Limit ${MAX_TOTAL_BYTES} B (380 KB)`
    );

    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new Error(`Total stills size ${totalBytes} B exceeds budget ${MAX_TOTAL_BYTES} B`);
    }

    console.log('[bake-stills] All stills baked successfully.');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('[bake-stills] Error:', err);
  process.exit(1);
});
