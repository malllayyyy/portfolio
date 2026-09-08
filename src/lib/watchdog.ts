import { setTier } from './store';

declare global {
  interface Window {
    __simulateLag?: boolean;
    __watchdogDemote?: () => void;
  }
}

/**
 * Task 6.2 / § 14 Risk 3 — Frame-time watchdog.
 * Monitors rolling 120-frame mean frame time. If mean > 28 ms (~35 fps) for 3
 * consecutive seconds, demotes tier to 'low' in-place (disposes renderer,
 * unmounts canvas, swaps static path, no reload, no flash).
 */
export class FrameWatchdog {
  private buffer = new Float32Array(120);
  private head = 0;
  private count = 0;
  private sum = 0;
  private highDurationMs = 0;
  private isDemoted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.__watchdogDemote = () => this.demote();
    }
  }

  public update(dtSeconds: number): void {
    if (this.isDemoted) return;

    let dtMs = dtSeconds * 1000;
    if (dtMs > 500) {
      dtMs = 200;
      this.highDurationMs = 0;
    }

    if (typeof window !== 'undefined' && window.__simulateLag) {
      dtMs = 35;
    }

    if (this.count === 120) {
      this.sum -= this.buffer[this.head];
    } else {
      this.count++;
    }

    this.buffer[this.head] = dtMs;
    this.sum += dtMs;
    this.head = (this.head + 1) % 120;

    const meanMs = this.sum / this.count;

    if (this.count >= 30 && meanMs > 28) {
      this.highDurationMs += dtMs;
      if (this.highDurationMs >= 3000) {
        this.demote();
      }
    } else {
      this.highDurationMs = 0;
    }
  }

  public demote(): void {
    if (this.isDemoted) return;
    this.isDemoted = true;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('substrate-tier', 'low');
      } catch {
        // ignore storage errors
      }
      document.documentElement.dataset.tier = 'low';
    }

    setTier('low');
  }
}
