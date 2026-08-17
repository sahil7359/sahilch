import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#000000',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ color: '#86868b', fontSize: 28, letterSpacing: 4, textTransform: 'uppercase' }}>
          AI Engineer · Kolkata
        </div>
        <div
          style={{
            color: '#f5f5f7',
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            marginTop: 24,
            maxWidth: 900,
          }}
        >
          Ships AI agents, not notebooks.
        </div>
        <div style={{ color: '#86868b', fontSize: 30, marginTop: 32, maxWidth: 820 }}>
          Sahil Chakraborty — guardrails, evaluations, and published numbers.
        </div>
        <div style={{ display: 'flex', height: 6, width: 160, background: '#2997ff', marginTop: 40 }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
