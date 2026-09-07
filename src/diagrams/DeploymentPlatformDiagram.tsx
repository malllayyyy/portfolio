export function DeploymentPlatformDiagram() {
  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 960 560"
        width="100%"
        height="auto"
        role="img"
        aria-labelledby="dp-title dp-desc"
        className="border border-hairline bg-strata"
      >
        <title id="dp-title">{/* <title> */}deployment-platform: one deploy, end to end</title>
        <desc id="dp-desc">
          A git URL posts to the platform API, which enqueues a build on a BullMQ queue in Redis.
          The worker consumes it and spawns a throwaway platform-build-sandbox Docker container
          inside an isolation boundary. The sandbox hashes the lockfile against a host bind-mounted
          node_modules cache and skips npm install on a hit, then uploads the static output to a
          versioned MinIO path. Build logs stream back over a Redis pub/sub channel through the API
          and Socket.IO to the dashboard. On success the worker updates a single Postgres column,
          projects.current_deployment_id. A browser request reaches the proxy, which looks that
          column up to find the deployment bucket path and streams the object from MinIO.
        </desc>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#8FA0B0" />
          </marker>
          <marker
            id="arrow-focal"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#8FD3FF" />
          </marker>
        </defs>

        {/* Isolation Boundary */}
        <g>
          <rect
            x="440"
            y="135"
            width="390"
            height="115"
            rx="4"
            fill="none"
            stroke="#1B2430"
            strokeDasharray="2 4"
          />
          <text
            x="448"
            y="150"
            fontFamily="var(--font-mono, monospace)"
            fontSize="11"
            fill="#8FA0B0"
          >
            isolation boundary — throwaway container
          </text>
        </g>

        {/* Edges */}
        {/* E1: N1 -> N2 */}
        <g>
          <path d="M 174 62 L 212 62" stroke="#8FA0B0" markerEnd="url(#arrow)" fill="none" />
          <text x="193" y="54" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            POST /deploy
          </text>
        </g>

        {/* E2: N2 -> N3 */}
        <g>
          <path d="M 370 60 L 422 60" stroke="#8FA0B0" strokeDasharray="4 4" markerEnd="url(#arrow)" fill="none" />
          <text x="396" y="52" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            enqueue
          </text>
        </g>

        {/* E3: N3 -> N4 */}
        <g>
          <path d="M 580 60 L 632 60" stroke="#8FA0B0" strokeDasharray="4 4" markerEnd="url(#arrow)" fill="none" />
          <text x="606" y="52" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            consume
          </text>
        </g>

        {/* E4: N4 -> N5 */}
        <g>
          <path d="M 715 84 L 735 162" stroke="#8FA0B0" markerEnd="url(#arrow)" fill="none" />
          <text x="738" y="125" textAnchor="start" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            spawn container
          </text>
        </g>

        {/* E5: N5 <-> N6 */}
        <g>
          <path d="M 618 192 L 652 192" stroke="#8FA0B0" markerStart="url(#arrow)" markerEnd="url(#arrow)" fill="none" />
          <text x="452" y="236" textAnchor="start" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            lockfile hash → cache hit → skip npm install
          </text>
        </g>

        {/* E6: N5 -> N7 */}
        <g>
          <path d="M 735 214 L 735 312" stroke="#8FA0B0" markerEnd="url(#arrow)" fill="none" />
          <text x="743" y="285" textAnchor="start" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            upload static output
          </text>
        </g>

        {/* E7: N5 -> N3 */}
        <g>
          <path d="M 660 178 L 565 96" stroke="#8FA0B0" strokeDasharray="4 4" markerEnd="url(#arrow)" fill="none" />
          <text x="620" y="130" textAnchor="end" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            buildLogChannel
          </text>
        </g>

        {/* E8: N3 -> N2 */}
        <g>
          <path d="M 430 75 L 378 75" stroke="#8FA0B0" strokeDasharray="4 4" markerEnd="url(#arrow)" fill="none" />
          <text x="404" y="87" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            pub/sub
          </text>
        </g>

        {/* E9: N2 -> N9 */}
        <g>
          <path d="M 295 84 L 295 162" stroke="#8FA0B0" strokeDasharray="4 4" markerEnd="url(#arrow)" fill="none" />
        </g>

        {/* E10: N9 -> N10 */}
        <g>
          <path d="M 220 192 L 182 192" stroke="#8FA0B0" strokeDasharray="4 4" markerEnd="url(#arrow)" fill="none" />
          <text x="201" y="184" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            live
          </text>
        </g>

        {/* E11: N4 -> N8 (Focal Edge) */}
        <g>
          <path d="M 760 84 C 760 260, 490 260, 490 392" stroke="#8FD3FF" strokeWidth="2" markerEnd="url(#arrow-focal)" fill="none" />
          <text x="575" y="275" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            UPDATE projects SET current_deployment_id
          </text>
        </g>

        {/* E12: N12 -> N11 */}
        <g>
          <path d="M 99 470 C 99 450, 165 460, 165 448" stroke="#8FA0B0" markerEnd="url(#arrow)" fill="none" />
          <text x="115" y="445" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            Host: &lt;subdomain&gt;
          </text>
        </g>

        {/* E13: N11 -> N8 */}
        <g>
          <path d="M 290 422 L 372 428" stroke="#8FA0B0" markerEnd="url(#arrow)" fill="none" />
          <text x="331" y="415" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            current_deployment_id → bucket_path
          </text>
        </g>

        {/* E14: N11 -> N7 */}
        <g>
          <path d="M 215 400 C 215 360, 500 350, 652 350" stroke="#8FA0B0" markerEnd="url(#arrow)" fill="none" />
          <text x="440" y="345" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            stream object
          </text>
        </g>

        {/* Focal Annotation */}
        <g>
          <text x="560" y="480" fontSize="13" fontFamily="var(--font-display)" fill="#8FD3FF">
            success flips this. rollback flips it back.
          </text>
          <text x="560" y="500" fontSize="13" fontFamily="var(--font-display)" fill="#8FD3FF">
            one UPDATE, zero downtime.
          </text>
        </g>

        {/* Nodes */}
        {/* N1: git URL */}
        <g>
          <title>git URL</title>
          <rect x="24" y="40" width="150" height="44" rx="4" ry="4" fill="#10151C" stroke="#8FA0B0" />
          <text x="99" y="66" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            git URL
          </text>
        </g>

        {/* N2: @platform/api */}
        <g>
          <title>@platform/api</title>
          <rect x="220" y="40" width="150" height="44" rx="4" ry="4" fill="#10151C" stroke="#1B2430" />
          <text x="295" y="57" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            @platform/api
          </text>
          <text x="295" y="71" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            express
          </text>
        </g>

        {/* N3: Redis · BullMQ queue */}
        <g>
          <title>Redis · BullMQ queue</title>
          <ellipse cx="505" cy="42" rx="75" ry="10" fill="#10151C" stroke="#1B2430" />
          <path d="M 430 42 v 36 a 75 10 0 0 0 150 0 v -36" fill="#10151C" stroke="#1B2430" />
          <ellipse cx="505" cy="42" rx="75" ry="10" fill="none" stroke="#1B2430" />
          <text x="505" y="42" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            Redis
          </text>
          <text x="505" y="56" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            BullMQ
          </text>
          <text x="505" y="70" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            BUILD_QUEUE_NAME
          </text>
        </g>

        {/* N4: @platform/worker */}
        <g>
          <title>@platform/worker</title>
          <rect x="640" y="40" width="150" height="44" rx="4" ry="4" fill="#10151C" stroke="#1B2430" />
          <text x="715" y="66" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            @platform/worker
          </text>
        </g>

        {/* N5: platform-build-sandbox */}
        <g>
          <title>platform-build-sandbox</title>
          <rect x="660" y="170" width="150" height="44" rx="4" ry="4" fill="#10151C" stroke="#1B2430" />
          <text x="735" y="187" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            platform-build-sandbox
          </text>
          <text x="735" y="201" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            docker run
          </text>
        </g>

        {/* N6: node_modules cache */}
        <g>
          <title>node_modules cache</title>
          <ellipse cx="535" cy="177" rx="75" ry="10" fill="#10151C" stroke="#1B2430" />
          <path d="M 460 177 v 36 a 75 10 0 0 0 150 0 v -36" fill="#10151C" stroke="#1B2430" />
          <ellipse cx="535" cy="177" rx="75" ry="10" fill="none" stroke="#1B2430" />
          <text x="535" y="184" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            node_modules cache
          </text>
          <text x="535" y="198" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            host bind mount
          </text>
        </g>

        {/* N7: MinIO */}
        <g>
          <title>MinIO</title>
          <ellipse cx="735" cy="332" rx="75" ry="10" fill="#10151C" stroke="#1B2430" />
          <path d="M 660 332 v 36 a 75 10 0 0 0 150 0 v -36" fill="#10151C" stroke="#1B2430" />
          <ellipse cx="735" cy="332" rx="75" ry="10" fill="none" stroke="#1B2430" />
          <text x="735" y="342" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            MinIO
          </text>
          <text x="735" y="356" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            &lt;project&gt;/&lt;deploymentId&gt;
          </text>
        </g>

        {/* N8: Postgres */}
        <g>
          <title>Postgres</title>
          <ellipse cx="455" cy="412" rx="75" ry="10" fill="#10151C" stroke="#1B2430" />
          <path d="M 380 412 v 36 a 75 10 0 0 0 150 0 v -36" fill="#10151C" stroke="#1B2430" />
          <ellipse cx="455" cy="412" rx="75" ry="10" fill="none" stroke="#1B2430" />
          <text x="455" y="418" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            Postgres
          </text>
          <text x="455" y="431" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            users · projects
          </text>
          <text x="455" y="444" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            deployments · build_logs
          </text>
        </g>

        {/* N9: Socket.IO */}
        <g>
          <title>Socket.IO</title>
          <rect x="220" y="170" width="150" height="44" rx="4" ry="4" fill="#10151C" stroke="#1B2430" />
          <text x="295" y="196" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            Socket.IO
          </text>
        </g>

        {/* N10: @platform/dashboard */}
        <g>
          <title>@platform/dashboard</title>
          <rect x="24" y="170" width="150" height="44" rx="4" ry="4" fill="#10151C" stroke="#1B2430" />
          <text x="99" y="196" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            @platform/dashboard
          </text>
        </g>

        {/* N11: @platform/proxy */}
        <g>
          <title>@platform/proxy</title>
          <rect x="140" y="400" width="150" height="44" rx="4" ry="4" fill="#10151C" stroke="#1B2430" />
          <text x="215" y="426" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            @platform/proxy
          </text>
        </g>

        {/* N12: browser */}
        <g>
          <title>browser</title>
          <rect x="24" y="470" width="150" height="44" rx="4" ry="4" fill="#10151C" stroke="#8FA0B0" />
          <text x="99" y="496" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono, monospace)" fill="#8FA0B0">
            browser
          </text>
        </g>
      </svg>
      <figcaption className="mt-3 font-mono text-t-xs text-muted">
        infra/docker/build.sh · apps/worker/src/build.js · apps/proxy/src/index.js
      </figcaption>
    </figure>
  );
}
