import { DEPTH_TABLE } from '@/content/depth-table';
import { LAYERS } from '@/content/layers';

/**
 * Bedrock draws the descent (§ Proposal 2 in creative-pass-2.md).
 * Static server component rendering an inline SVG graph of DEPTH_TABLE's
 * 20 control points with layer datums from LAYERS.
 * Zero JS cost on budget rows. Zero tab stops.
 */
export function DescentProfile() {
  const pointsCount = DEPTH_TABLE.length;

  const viewBoxWidth = 640;
  const viewBoxHeight = 220;
  const marginTop = 36;
  const marginBottom = 36;
  const marginLeft = 56;
  const marginRight = 56;

  const innerWidth = viewBoxWidth - marginLeft - marginRight;
  const innerHeight = viewBoxHeight - marginTop - marginBottom;

  const yMax = 6.0;
  const yMin = -300.0;
  const yRange = yMax - yMin;

  const polylinePoints = DEPTH_TABLE.map(([t, y]) => {
    const px = (marginLeft + t * innerWidth).toFixed(2);
    const py = (marginTop + ((yMax - y) / yRange) * innerHeight).toFixed(2);
    return `${px},${py}`;
  }).join(' ');

  const layerDatums = LAYERS.filter((l) => l.id !== 'bedrock').map((layer) => {
    const x = marginLeft + layer.t * innerWidth;
    const y = marginTop + ((yMax - layer.datum) / yRange) * innerHeight;
    return { ...layer, x, y };
  });

  const gridDepths = [0, -100, -200, -300];

  return (
    <figure className="mt-16 w-full max-w-2xl border border-hairline bg-field p-6">
      <figcaption className="mb-4 font-mono text-t-xs text-muted tracking-widest uppercase flex items-center justify-between">
        <span>Descent Profile</span>
        <span>{pointsCount} Control Points · 0 m → -300 m</span>
      </figcaption>
      <div className="w-full overflow-hidden">
        <svg
          role="img"
          aria-labelledby="descent-profile-title descent-profile-desc"
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto block text-t-xs font-mono"
        >
          <title id="descent-profile-title">The descent profile</title>
          <desc id="descent-profile-desc">
            A chart plotting vertical camera depth against scroll progress across {pointsCount} control points.
            It marks four layer datums: Surface at 0 metres, Device at -40 metres, Engine at -120 metres,
            and Reasoning at -260 metres, terminating at Bedrock at -300 metres.
          </desc>

          {/* Grid lines & Y-axis labels */}
          {gridDepths.map((depth) => {
            const gy = marginTop + ((yMax - depth) / yRange) * innerHeight;
            return (
              <g key={depth}>
                <line
                  x1={marginLeft}
                  y1={gy}
                  x2={viewBoxWidth - marginRight}
                  y2={gy}
                  stroke="var(--color-hairline)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={marginLeft - 8}
                  y={gy + 4}
                  textAnchor="end"
                  fill="var(--color-muted)"
                  className="text-[10px] font-mono"
                >
                  {depth}m
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          <text
            x={marginLeft}
            y={viewBoxHeight - 12}
            textAnchor="start"
            fill="var(--color-muted)"
            className="text-[10px] font-mono"
          >
            t=0.0 (Surface)
          </text>
          <text
            x={viewBoxWidth - marginRight}
            y={viewBoxHeight - 12}
            textAnchor="end"
            fill="var(--color-muted)"
            className="text-[10px] font-mono"
          >
            t=1.0 (Bedrock)
          </text>

          {/* Chart Bounding Box */}
          <rect
            x={marginLeft}
            y={marginTop}
            width={innerWidth}
            height={innerHeight}
            fill="none"
            stroke="var(--color-hairline)"
            strokeWidth="1"
          />

          {/* Control point dots for all 20 points */}
          {DEPTH_TABLE.map(([t, y], idx) => {
            const cx = marginLeft + t * innerWidth;
            const cy = marginTop + ((yMax - y) / yRange) * innerHeight;
            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="2"
                fill="var(--color-muted)"
                opacity="0.6"
              />
            );
          })}

          {/* Plotted Depth Curve Polyline */}
          <polyline
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* Four Layer Datum Notches and Labels */}
          {layerDatums.map((layer) => {
            const isRightSide = layer.x > viewBoxWidth / 2 + 100;
            const labelX = isRightSide ? layer.x - 10 : layer.x + 10;
            const textAnchor = isRightSide ? 'end' : 'start';
            const labelY = layer.y - 10 > marginTop ? layer.y - 10 : layer.y + 16;

            return (
              <g key={layer.id}>
                {/* Vertical datum marker line */}
                <line
                  x1={layer.x}
                  y1={layer.y - 8}
                  x2={layer.x}
                  y2={layer.y + 8}
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                />
                {/* Datum point marker */}
                <circle
                  cx={layer.x}
                  cy={layer.y}
                  r="3.5"
                  fill="var(--color-void)"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                />
                {/* Datum Label */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={textAnchor}
                  fill="var(--accent)"
                  className="text-[11px] font-mono font-semibold"
                >
                  {layer.name} ({layer.datum}m)
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
