import { ImageResponse } from 'next/og';
import { PROJECTS } from '@/content/projects';
import { LAYERS } from '@/content/layers';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const LAYER_ACCENTS: Record<string, string> = {
  surface: '#8FD3FF',
  device: '#FFC46B',
  reasoning: '#C8FF6A',
};

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', backgroundColor: '#06080B', display: 'flex' }} />,
      { ...size }
    );
  }

  const layer = LAYERS.find((l) => l.id === project.layer);
  const accent = (layer && LAYER_ACCENTS[layer.id]) || '#8FD3FF';
  const headerText = `SUBSTRATE // ${layer ? layer.name : 'PROJECT'}`;
  const depthText = `Depth ${project.depth} m`;

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: accent,
              }}
            />
            <span
              style={{
                fontSize: '22px',
                letterSpacing: '0.15em',
                color: accent,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {headerText}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '56px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginTop: '8px',
            }}
          >
            {project.title}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '28px',
              fontWeight: 600,
              color: accent,
              fontFamily: 'monospace',
              marginTop: '4px',
            }}
          >
            {depthText}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderLeft: `4px solid ${accent}`,
            paddingLeft: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '28px',
              fontWeight: 400,
              color: '#D0D8E0',
              lineHeight: 1.4,
              maxWidth: '960px',
            }}
          >
            {project.thesis}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
