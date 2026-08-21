'use client';

import { useEffect, useRef } from 'react';
import { site } from '@/lib/site';
import { ResumeButton } from '@/components/resume/ResumeButton';

type Point = {
  tx: number; ty: number; // target (silhouette), normalized 0..1
  ox: number; oy: number; // scattered origin
  delay: number; // stagger
  phase: number; // drift phase
  speed: number;
  b: number; // base brightness
};

const PHASES = [
  { text: 'Raw data.', from: 0.02, to: 0.17 },
  { text: 'Resolved into intelligence.', from: 0.25, to: 0.44 },
  { text: 'Grounded. Evaluated. Guardrailed.', from: 0.5, to: 0.68 },
  { text: 'Two agents, live and measured.', from: 0.77, to: 0.96 },
];

const easeCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Sample ~4200 points inside a drawn bust silhouette via rejection sampling. */
function buildPoints(count: number): Point[] {
  const W = 400, H = 520;
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const g = off.getContext('2d');
  if (!g) return [];
  g.fillStyle = '#fff';
  g.beginPath();
  g.ellipse(W / 2, H * 0.29, W * 0.19, H * 0.2, 0, 0, Math.PI * 2); // head
  g.fill();
  g.fillRect(W / 2 - W * 0.065, H * 0.44, W * 0.13, H * 0.09); // neck
  g.beginPath(); // shoulders
  g.moveTo(W * 0.1, H);
  g.quadraticCurveTo(W * 0.15, H * 0.62, W * 0.5, H * 0.56);
  g.quadraticCurveTo(W * 0.85, H * 0.62, W * 0.9, H);
  g.closePath();
  g.fill();

  const data = g.getImageData(0, 0, W, H).data;
  const pts: Point[] = [];
  let attempts = 0;
  while (pts.length < count && attempts < count * 60) {
    attempts++;
    const x = Math.random() * W;
    const y = Math.random() * H;
    if (data[(Math.floor(y) * W + Math.floor(x)) * 4 + 3]! > 130) {
      const tx = x / W;
      const ty = y / H;
      const ang = Math.random() * Math.PI * 2;
      const rad = 0.5 + Math.random() * 0.9;
      pts.push({
        tx,
        ty,
        ox: 0.5 + Math.cos(ang) * rad,
        oy: 0.5 + Math.sin(ang) * rad,
        delay: Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.9,
        b: 0.55 + Math.random() * 0.45,
      });
    }
  }
  return pts;
}

export function GenerativeHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const points = buildPoints(4200);
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let cssW = 0, cssH = 0;
    let top = 0, height = 0; // cached scroll geometry
    let target = 0, smooth = 0; // scroll progress
    let raf = 0, running = false;

    const measure = () => {
      const r = container.getBoundingClientRect();
      top = r.top + window.scrollY;
      height = container.offsetHeight;
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onScroll = () => {
      const denom = height - window.innerHeight;
      target = denom > 0 ? clamp((window.scrollY - top) / denom) : 0;
    };

    const draw = () => {
      smooth += (target - smooth) * 0.09;
      const p = smooth;
      const t = performance.now() / 1000;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cssW, cssH);

      // Cover-fit the silhouette box, with a slow push-in.
      const pushed = 0.82 + p * 0.32;
      const boxH = Math.min(cssH * 0.92, (cssW * 0.92) / 0.77) * pushed;
      const boxW = boxH * 0.77;
      const boxX = cssW / 2 - boxW / 2;
      const boxY = cssH / 2 - boxH / 2;

      const lightAngle = -Math.PI / 2 + p * Math.PI * 1.1;
      const lx = Math.cos(lightAngle);
      const ly = Math.sin(lightAngle);

      for (let i = 0; i < points.length; i++) {
        const pt = points[i]!;
        const pi = clamp((p - pt.delay) / (1 - pt.delay));
        const e = easeCubic(pi);
        const driftAmt = (1 - e) * 0.03 + 0.003;
        const nx =
          pt.ox + (pt.tx - pt.ox) * e + Math.sin(t * pt.speed + pt.phase) * driftAmt;
        const ny =
          pt.oy + (pt.ty - pt.oy) * e + Math.cos(t * pt.speed * 0.8 + pt.phase) * driftAmt;

        const px = boxX + nx * boxW;
        const py = boxY + ny * boxH;

        const lambert = clamp(0.32 + 0.68 * ((pt.tx - 0.5) * lx + (pt.ty - 0.5) * ly + 0.5));
        const alpha = (0.12 + e * 0.85) * pt.b * lambert;
        const size = 1.1 + e * 0.7;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = e > 0.85 && pt.b > 0.9 ? '#2997ff' : '#f5f5f7';
        ctx.fillRect(px, py, size, size);
      }
      ctx.globalAlpha = 1;

      // Phase copy — direct DOM writes, no per-frame React state.
      for (let i = 0; i < PHASES.length; i++) {
        const el = phaseRefs.current[i];
        if (!el) continue;
        const { from, to } = PHASES[i]!;
        const mid = (from + to) / 2;
        const span = (to - from) / 2;
        const vis = clamp(1 - Math.abs(p - mid) / (span + 0.06));
        el.style.opacity = String(vis);
        el.style.transform = `translateY(${(1 - vis) * 22}px)`;
      }
    };

    const frame = () => {
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    measure();
    onScroll();
    draw(); // paint the initial poster frame immediately, independent of rAF
    const io = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(container);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div ref={containerRef} id="top" style={{ height: '320vh' }} className="relative">
      <div
        className="sticky top-0 flex h-screen flex-col overflow-hidden"
        style={{ overscrollBehavior: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ willChange: 'transform' }}
          role="img"
          aria-label="A cloud of points resolving into a portrait — raw data becoming intelligence."
        />

        <div className="relative z-10 flex h-full flex-col">
          <div className="container-x pt-24">
            <p className="kicker">
              {site.role} · {site.location} · open to {site.targets.join(' / ')}
            </p>
          </div>

          <div className="container-x flex flex-1 items-center">
            <div className="relative h-44 w-full max-w-4xl">
              {PHASES.map((ph, i) => (
                <h1
                  key={ph.text}
                  ref={(el) => {
                    phaseRefs.current[i] = el;
                  }}
                  className="text-gradient absolute inset-x-0 top-0 font-semibold text-balance"
                  style={{
                    fontSize: 'var(--text-hero)',
                    letterSpacing: 'var(--tracking-hero)',
                    lineHeight: 1.03,
                    opacity: i === 0 ? 1 : 0,
                  }}
                >
                  {ph.text}
                </h1>
              ))}
            </div>
          </div>

          <div className="container-x flex flex-wrap items-center gap-4 pb-16">
            <a
              href="#work"
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
            >
              View the work
            </a>
            <a
              href={`mailto:${site.email}`}
              className="rounded-full border border-[color:var(--color-hair)] px-6 py-3 text-sm text-ink transition-colors hover:border-accent"
            >
              Get in touch
            </a>
            {site.hasResume && (
              <ResumeButton className="rounded-full border border-accent/60 px-6 py-3 text-sm text-ink transition-colors hover:bg-accent/10" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
