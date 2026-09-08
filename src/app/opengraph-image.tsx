import { ImageResponse } from 'next/og';
import { SITE } from '@/content/site';

export const dynamic = 'force-static';
export const alt = `${SITE.name} — Substrate`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 72px',
          backgroundColor: '#06080B',
          color: '#F0F4F8',
          fontFamily: 'Satoshi, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#8FD3FF',
              }}
            />
            <span
              style={{
                fontSize: '22px',
                letterSpacing: '0.15em',
                color: '#8FD3FF',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              SUBSTRATE
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '64px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginTop: '12px',
            }}
          >
            {SITE.name}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderLeft: '4px solid #8FD3FF',
            paddingLeft: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '32px',
              fontWeight: 500,
              color: '#D0D8E0',
              lineHeight: 1.35,
              maxWidth: '960px',
            }}
          >
            Web, app, game, agent. I don't switch between them — I stack them.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
