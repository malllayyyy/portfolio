import { detectTier, getTierEvidence, type Tier } from './tier';
import { getMotion } from './motion-pref';

export interface MetricRow {
  label: string;
  value: string;
  source: string;
  dark: boolean;
}

const DARK_ROW: MetricRow = {
  label: '',
  value: 'not exposed',
  source: '',
  dark: true,
};

export interface VisitSnapshot {
  tier: MetricRow;
  reducedMotion: MetricRow;
  fcp: MetricRow;
  lcp: MetricRow;
  documentTransfer: MetricRow;
  deferred3D: MetricRow;
  initialRouteBytes: MetricRow;
  frameMean: MetricRow;
  layersCrossed: MetricRow;
  rows: MetricRow[];
  // Retained on snapshot interface for legacy subcomponents (e.g. VisitField 3D mesh)
  cores: MetricRow;
  deviceMemory: MetricRow;
  pixelRatio: MetricRow;
  viewportPointer: MetricRow;
  saveData: MetricRow;
  thisReading: MetricRow;
}

const SERVER_SNAPSHOT: VisitSnapshot = {
  tier: { label: 'tier', value: 'measured on load', source: 'detectTier()', dark: false },
  reducedMotion: { label: 'reduced motion', value: 'measured on load', source: "matchMedia('(prefers-reduced-motion: reduce)')", dark: false },
  fcp: { label: 'first paint', value: 'measured on load', source: "PerformanceObserver 'paint' / first-contentful-paint", dark: false },
  lcp: { label: 'largest paint', value: 'measured on load', source: "PerformanceObserver 'largest-contentful-paint'", dark: false },
  documentTransfer: { label: 'document', value: 'measured on load', source: 'PerformanceNavigationTiming.transferSize', dark: false },
  deferred3D: { label: '3D chunk', value: 'measured on load', source: 'PerformanceResourceTiming.encodedBodySize', dark: false },
  initialRouteBytes: { label: 'total page fetch', value: 'measured on load', source: 'PerformanceResourceTiming sum(encodedBodySize)', dark: false },
  frameMean: { label: 'frame mean', value: 'measured on load', source: 'rolling 120-frame rAF delta', dark: false },
  layersCrossed: { label: 'layers crossed', value: 'measured on load', source: 'camera depth(t) or IntersectionObserver', dark: false },
  cores: DARK_ROW,
  deviceMemory: DARK_ROW,
  pixelRatio: DARK_ROW,
  viewportPointer: DARK_ROW,
  saveData: DARK_ROW,
  thisReading: DARK_ROW,
  rows: [],
};
SERVER_SNAPSHOT.rows = [
  SERVER_SNAPSHOT.tier,
  SERVER_SNAPSHOT.reducedMotion,
  SERVER_SNAPSHOT.fcp,
  SERVER_SNAPSHOT.lcp,
  SERVER_SNAPSHOT.documentTransfer,
  SERVER_SNAPSHOT.deferred3D,
  SERVER_SNAPSHOT.initialRouteBytes,
  SERVER_SNAPSHOT.frameMean,
  SERVER_SNAPSHOT.layersCrossed,
];

let listeners = new Set<() => void>();
let currentSnapshot: VisitSnapshot = SERVER_SNAPSHOT;
let initialized = false;

// Performance timing buffers
let observedFcpMs: number | null = null;
let observedLcpMs: number | null = null;

// Frame time rolling buffer (120 samples)
const FRAME_SAMPLES = 120;
const frameBuffer = new Float32Array(FRAME_SAMPLES);
let frameHead = 0;
let frameCount = 0;
let frameSum = 0;
let lastFrameTime = 0;

// Layer observation state
let maxLayerIndexReached = 1; // 1 to 5
const LAYER_DATUMS = [0, -40, -120, -260, -300];

function notify() {
  for (const fn of listeners) {
    fn();
  }
}

function updateSnapshot() {
  if (typeof window === 'undefined') return;

  const tTier = detectTier();
  const evidence = getTierEvidence();

  // 1. Tier
  const tierRow: MetricRow = {
    label: 'tier',
    value: tTier,
    source: evidence ? evidence.summary : 'detectTier()',
    dark: false,
  };

  // 2. Reduced motion
  const motionMode = getMotion();
  const motionRow: MetricRow = {
    label: 'reduced motion',
    value: motionMode === 'off' ? 'on' : 'off',
    source: "matchMedia('(prefers-reduced-motion: reduce)')",
    dark: false,
  };

  // 3. FCP
  const fcpRow: MetricRow = {
    label: 'first paint',
    value: observedFcpMs !== null ? `${Math.round(observedFcpMs)} ms` : 'not exposed by this browser',
    source: "PerformanceObserver 'paint' / first-contentful-paint",
    dark: observedFcpMs === null,
  };

  // 4. LCP
  const lcpRow: MetricRow = {
    label: 'largest paint',
    value: observedLcpMs !== null ? `${Math.round(observedLcpMs)} ms` : 'not exposed by this browser',
    source: "PerformanceObserver 'largest-contentful-paint'",
    dark: observedLcpMs === null,
  };

  // 5. Document transfer
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  let docVal = 'not exposed by this browser';
  let docDark = true;
  if (navEntry) {
    if (navEntry.transferSize === 0 && navEntry.encodedBodySize > 0) {
      docVal = 'served from cache';
      docDark = false;
    } else if (navEntry.transferSize > 0) {
      docVal = `${(navEntry.transferSize / 1024).toFixed(1)} KB`;
      docDark = false;
    } else if (navEntry.encodedBodySize > 0) {
      docVal = `${(navEntry.encodedBodySize / 1024).toFixed(1)} KB`;
      docDark = false;
    }
  }
  const docRow: MetricRow = {
    label: 'document',
    value: docVal,
    source: 'PerformanceNavigationTiming.transferSize',
    dark: docDark,
  };

  // 6. Deferred 3D chunk
  let chunkVal = 'not exposed by this browser';
  let chunkDark = true;
  let chunkSource = 'PerformanceResourceTiming.encodedBodySize';
  if (tTier === 'low') {
    chunkVal = '3D chunk never fetched — low tier ships zero bytes of Three.js';
    chunkDark = true;
  } else {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const dcl = navEntry?.domContentLoadedEventEnd || 0;
    const chunkEntries = resources.filter(
      (r) => r.initiatorType === 'script' && r.name.includes('/_next/static/chunks/') && r.startTime >= dcl
    );
    if (chunkEntries.length > 0) {
      // Find largest entry
      const largest = chunkEntries.reduce((max, cur) => (cur.encodedBodySize > max.encodedBodySize ? cur : max), chunkEntries[0]);
      if (largest.transferSize === 0 && largest.encodedBodySize > 0) {
        chunkVal = 'served from cache';
        chunkDark = false;
      } else {
        const bytes = largest.transferSize || largest.encodedBodySize;
        if (bytes > 0) {
          chunkVal = `${(bytes / 1024).toFixed(1)} KB`;
          chunkDark = false;
        }
      }
    } else {
      // Check all chunks if DCL not marked yet
      const anyChunk = resources.filter((r) => r.initiatorType === 'script' && r.name.includes('/_next/static/chunks/'));
      if (anyChunk.length > 0) {
        const largest = anyChunk.reduce((max, cur) => (cur.encodedBodySize > max.encodedBodySize ? cur : max), anyChunk[0]);
        if (largest.transferSize === 0 && largest.encodedBodySize > 0) {
          chunkVal = 'served from cache';
          chunkDark = false;
        } else if (largest.encodedBodySize > 0) {
          chunkVal = `${(largest.encodedBodySize / 1024).toFixed(1)} KB`;
          chunkDark = false;
        }
      }
    }
  }
  const chunkRow: MetricRow = {
    label: '3D chunk',
    value: chunkVal,
    source: chunkSource,
    dark: chunkDark,
  };

  // 7. Initial route bytes (total page fetch: JS, CSS, fonts, document, polyfills)
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const dcl = navEntry?.domContentLoadedEventEnd || 10000;
  const initialResources = resources.filter((r) => r.startTime <= dcl);
  const sumBytes = initialResources.reduce((acc, r) => acc + (r.encodedBodySize || r.transferSize || 0), 0);
  const totalInitial = sumBytes + (navEntry?.encodedBodySize || navEntry?.transferSize || 0);

  const initialJsResources = initialResources.filter(
    (r) => r.initiatorType === 'script' && !r.name.includes('nomodule')
  );
  const jsBytes = initialJsResources.reduce((acc, r) => acc + (r.encodedBodySize || r.transferSize || 0), 0);

  let initialVal = 'not exposed by this browser';
  let initialDark = true;
  if (totalInitial > 0) {
    initialDark = false;
    if (jsBytes > 0) {
      initialVal = `${(totalInitial / 1024).toFixed(1)} KB (${(jsBytes / 1024).toFixed(1)} KB JS)`;
    } else {
      initialVal = `${(totalInitial / 1024).toFixed(1)} KB`;
    }
  }

  const initialRow: MetricRow = {
    label: 'total page fetch',
    value: initialVal,
    source: 'PerformanceResourceTiming sum(encodedBodySize)',
    dark: initialDark,
  };

  // 8. Frame mean
  let frameVal = 'not exposed by this browser';
  let frameDark = true;
  if (tTier === 'low') {
    frameVal = 'no render loop at this tier';
    frameDark = true;
  } else if (motionMode === 'off') {
    frameVal = 'paused (reduced motion)';
    frameDark = true;
  } else if (frameCount > 0) {
    const meanMs = frameSum / frameCount;
    frameVal = `${meanMs.toFixed(1)} ms`;
    frameDark = false;
  }
  const frameRow: MetricRow = {
    label: 'frame mean',
    value: frameVal,
    source: 'rolling 120-frame rAF delta',
    dark: frameDark,
  };

  // 9. Layers crossed
  const deepestDatum = LAYER_DATUMS[maxLayerIndexReached - 1] ?? 0;
  const layersRow: MetricRow = {
    label: 'layers crossed',
    value: `${maxLayerIndexReached} of 5`,
    source: `deepest ${deepestDatum} m`,
    dark: false,
  };

  const rows = [
    tierRow,
    motionRow,
    fcpRow,
    lcpRow,
    docRow,
    chunkRow,
    initialRow,
    frameRow,
    layersRow,
  ];

  currentSnapshot = {
    tier: tierRow,
    reducedMotion: motionRow,
    fcp: fcpRow,
    lcp: lcpRow,
    documentTransfer: docRow,
    deferred3D: chunkRow,
    initialRouteBytes: initialRow,
    frameMean: frameRow,
    layersCrossed: layersRow,
    cores: DARK_ROW,
    deviceMemory: DARK_ROW,
    pixelRatio: DARK_ROW,
    viewportPointer: DARK_ROW,
    saveData: DARK_ROW,
    thisReading: DARK_ROW,
    rows,
  };
}

function initObservers() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // 1. Performance Observer for FCP and LCP
  if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes) {
    try {
      if (PerformanceObserver.supportedEntryTypes.includes('paint')) {
        const poPaint = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              observedFcpMs = entry.startTime;
              updateSnapshot();
              notify();
            }
          }
        });
        poPaint.observe({ type: 'paint', buffered: true });
      }
    } catch {
      // ignore observer failure
    }

    try {
      if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
        const poLcp = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            observedLcpMs = entries[entries.length - 1].startTime;
            updateSnapshot();
            notify();
          }
        });
        poLcp.observe({ type: 'largest-contentful-paint', buffered: true });
      }
    } catch {
      // ignore observer failure
    }
  }

  // 2. IntersectionObserver for [data-layer] elements
  if ('IntersectionObserver' in window) {
    const layerElements = Array.from(document.querySelectorAll('[data-layer]'));
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const layerAttr = entry.target.getAttribute('data-layer');
            let idx = 1;
            if (layerAttr === 'surface') idx = 1;
            else if (layerAttr === 'device') idx = 2;
            else if (layerAttr === 'engine') idx = 3;
            else if (layerAttr === 'reasoning') idx = 4;
            else if (layerAttr === 'bedrock') idx = 5;

            if (idx > maxLayerIndexReached) {
              maxLayerIndexReached = idx;
              changed = true;
            }
          }
        }
        if (changed) {
          updateSnapshot();
          notify();
        }
      },
      { threshold: 0.1 }
    );

    for (const el of layerElements) {
      observer.observe(el);
    }
  }

  // 3. Frame rate measuring loop (if motion is on and tier !== 'low')
  const isLowTier = detectTier() === 'low';
  const stepFrame = (now: number) => {
    if (lastFrameTime > 0) {
      const dtMs = now - lastFrameTime;
      if (dtMs < 500) {
        if (frameCount === FRAME_SAMPLES) {
          frameSum -= frameBuffer[frameHead];
        } else {
          frameCount++;
        }
        frameBuffer[frameHead] = dtMs;
        frameSum += dtMs;
        frameHead = (frameHead + 1) % FRAME_SAMPLES;
      }
    }
    lastFrameTime = now;

    if (listeners.size > 0 && getMotion() !== 'off' && !isLowTier) {
      requestAnimationFrame(stepFrame);
    }
  };

  if (getMotion() !== 'off' && !isLowTier) {
    requestAnimationFrame(stepFrame);
  }

  // Initial update
  updateSnapshot();
}

export function subscribeVisit(callback: () => void): () => void {
  listeners.add(callback);
  initObservers();
  return () => {
    listeners.delete(callback);
  };
}

export function getVisitSnapshot(): VisitSnapshot {
  if (typeof window !== 'undefined' && currentSnapshot === SERVER_SNAPSHOT) {
    updateSnapshot();
  }
  return currentSnapshot;
}

export function getVisitServerSnapshot(): VisitSnapshot {
  return SERVER_SNAPSHOT;
}

export function refreshVisitSnapshot(): void {
  updateSnapshot();
  notify();
}
