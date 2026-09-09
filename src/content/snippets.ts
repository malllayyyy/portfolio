export type SnippetEntry = {
  title: string;
  path: string;
  lang: string;
  code: string | null;
  note: string;
};

export const SNIPPETS: Record<string, SnippetEntry> = {
  // deployment-platform nodes (commit c374f4db6076d5f04b3db1b8eb734b5a10c36ab2)
  'git-url': {
    title: 'git URL',
    path: 'apps/api/src/index.js',
    lang: 'javascript',
    code: `const { projectId, deploymentId } = await createPendingDeployment({
  repoUrl,
  projectName,
  ownerId: req.user.id,
  kind: resolvedKind,
  startCommand: resolvedStartCommand,
});
await buildQueue.add("build", {
  projectId, deploymentId, repoUrl, projectName,
  kind: resolvedKind,
  startCommand: resolvedStartCommand,
});`,
    note: 'deployment-platform (commit c374f4d) · Enqueues POST /deploy git URL payload into BullMQ.',
  },

  'platform-api': {
    title: '@platform/api',
    path: 'apps/api/src/index.js',
    lang: 'javascript',
    code: `app.post("/deploy", requireAuth(getUser), async (req, res) => {
  const { repoUrl, projectName, kind, startCommand } = req.body || {};
  const resolvedKind = kind === "service" ? "service" : "static";
  const resolvedStartCommand = resolvedKind === "service" ? startCommand : undefined;

  try {
    const { projectId, deploymentId } = await createPendingDeployment({
      repoUrl,
      projectName,
      ownerId: req.user.id,
      kind: resolvedKind,
      startCommand: resolvedStartCommand,
    });
    await buildQueue.add("build", {
      projectId, deploymentId, repoUrl, projectName,
      kind: resolvedKind,
      startCommand: resolvedStartCommand,
    });

    res.status(202).json({
      deploymentId,
      status: "queued",
      url: \`http://\${projectName}.\${BASE_DOMAIN}:\${PROXY_PORT}\`,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});`,
    note: 'deployment-platform (commit c374f4d) · Express API endpoint handling deployment creation.',
  },

  'bullmq-queue': {
    title: 'Redis · BullMQ queue',
    path: 'packages/shared/src/redis.js',
    lang: 'javascript',
    code: `export const BUILD_QUEUE_NAME = "builds";

export function buildLogChannel(deploymentId) {
  return \`build:\${deploymentId}\`;
}

export function createRedisConnection() {
  return new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
  });
}`,
    note: 'deployment-platform (commit c374f4d) · Shared Redis queue and pub/sub constants.',
  },

  'platform-worker': {
    title: '@platform/worker',
    path: 'apps/worker/src/queue-worker.js',
    lang: 'javascript',
    code: `const worker = new Worker(
  BUILD_QUEUE_NAME,
  async (job) => (job.data.kind === "service" ? runService(job.data) : runBuild(job.data)),
  { connection: createRedisConnection(), concurrency: 1 },
);`,
    note: 'deployment-platform (commit c374f4d) · BullMQ worker processing build jobs.',
  },

  'platform-build-sandbox': {
    title: 'platform-build-sandbox',
    path: 'infra/docker/build.sh',
    lang: 'shell',
    code: `REPO_URL="$1"

git clone --depth 1 -- "$REPO_URL" /work/repo
cd /work/repo`,
    note: 'deployment-platform (commit c374f4d) · Isolated container execution script.',
  },

  'lockfile-cache': {
    title: 'node_modules cache',
    path: 'infra/docker/build.sh',
    lang: 'shell',
    code: `if [ -n "$LOCKFILE" ]; then
  HASH=$(sha256sum "$LOCKFILE" | cut -d' ' -f1)
  CACHE_DIR="/cache/$HASH"
  if [ -d "$CACHE_DIR/node_modules" ]; then
    echo "Build cache hit for $LOCKFILE ($HASH) — restoring node_modules, skipping npm install"
    cp -a "$CACHE_DIR/node_modules" ./node_modules
  else
    echo "Build cache miss for $LOCKFILE ($HASH) — running npm install"
    npm install
    mkdir -p "$CACHE_DIR"
    cp -a node_modules "$CACHE_DIR/node_modules"
  fi
fi`,
    note: 'deployment-platform (commit c374f4d) · Lockfile hash check against host bind mount.',
  },

  minio: {
    title: 'MinIO',
    path: 'apps/worker/src/build.js',
    lang: 'javascript',
    code: `const bucketPath = \`\${projectName}/\${deploymentId}\`;
// …
const client = createMinioClient();
const fileCount = await uploadDirectory(client, bucket, bucketPath, outDir);

if (fileCount === 0) {
  throw new Error("Build produced no output in dist/ — check the repo's build script");
}

await completeDeployment(pool, deploymentId, { bucketPath, fileCount });`,
    note: 'deployment-platform (commit c374f4d) · Uploading build output to MinIO bucket.',
  },

  'postgres-atomic-swap': {
    title: 'Postgres · Atomic Swap',
    path: 'packages/db/src/projects.js',
    lang: 'javascript',
    code: `export async function setCurrentDeployment(pool, projectId, deploymentId) {
  await pool.query(\`UPDATE projects SET current_deployment_id = $2 WHERE id = $1\`, [
    projectId,
    deploymentId,
  ]);
}`,
    note: 'deployment-platform (commit c374f4d) · The atomic zero-downtime swap column update.',
  },

  'socket-io': {
    title: 'Socket.IO',
    path: 'apps/api/src/index.js',
    lang: 'javascript',
    code: `const logSubscriber = createRedisConnection();
await logSubscriber.psubscribe(buildLogChannel("*"));
logSubscriber.on("pmessage", (_pattern, channel, message) => {
  const deploymentId = channel.slice(channel.lastIndexOf(":") + 1);
  io.to(\`deployment:\${deploymentId}\`).emit("build-event", JSON.parse(message));
});`,
    note: 'deployment-platform (commit c374f4d) · Streaming build logs over Socket.IO.',
  },

  'platform-dashboard': {
    title: '@platform/dashboard',
    path: 'apps/dashboard/src/LogViewer.jsx',
    lang: 'javascript',
    code: `socket = io(api.url, { withCredentials: true });
socket.on("connect", () => socket.emit("subscribe", deploymentId));
socket.on("build-event", (event) => {
  if (event.type === "line") {
    setLines((prev) => [...prev, event.text]);
  } else if (event.type === "done") {
    setStatus(event.status);
    onStatusChange?.(event.status);
    if (event.status === "ready") {
      setShowBurst(true);
    }
  }
});`,
    note: 'deployment-platform (commit c374f4d) · Live log viewing in Dashboard.',
  },

  'platform-proxy': {
    title: '@platform/proxy',
    path: 'apps/proxy/src/index.js',
    lang: 'javascript',
    code: `const subdomain = extractSubdomain(req.headers.host);
// …
const bucketPath = await getCurrentDeploymentBucketPath(pool, subdomain);

if (!bucketPath) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end(\`No deployment found for project "\${subdomain}"\`);
  return;
}

const key = resolveKey(bucketPath, req.url);

try {
  const { stream, contentType } = await getObject(client, BUCKET, key);
  res.writeHead(200, { "Content-Type": contentType });
  stream.pipe(res);
} catch (err) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end(\`Not found: \${key}\`);
}`,
    note: 'deployment-platform (commit c374f4d) · Proxy host lookup and MinIO streaming.',
  },

  browser: {
    title: 'browser',
    path: 'apps/proxy/src/index.js',
    lang: 'javascript',
    code: `if (!subdomain) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end(\`No project subdomain in Host header "\${req.headers.host}". Try http://<project>.\${BASE_DOMAIN}:\${PORT}\`);
  return;
}`,
    note: 'deployment-platform (commit c374f4d) · Subdomain routing contract.',
  },
  // GameZone nodes (private repository)
  'node-m1': {
    title: 'Android app',
    path: 'android/app/src/main/AndroidManifest.xml',
    lang: 'text',
    code: null,
    note: 'Described, not quoted — this repository is private. Capacitor 6 Android app wrapper around the Vite React build.',
  },

  'node-m2': {
    title: 'desktop browser',
    path: 'src/index.html',
    lang: 'text',
    code: null,
    note: 'Described, not quoted — this repository is private. Desktop web browser client running the Vite React application.',
  },

  'node-m3': {
    title: 'same Vite bundle',
    path: 'vite.config.js',
    lang: 'text',
    code: null,
    note: 'Described, not quoted — this repository is private. Shared React 18 + Vite client bundle serving both Android and desktop clients.',
  },

  'node-m4': {
    title: 'backend/server.js',
    path: 'backend/server.js',
    lang: 'text',
    code: null,
    note: 'Described, not quoted — this repository is private. Express backend exposing ~15 REST endpoints for station management.',
  },

  'node-m5': {
    title: 'SQLite',
    path: 'backend/database.js',
    lang: 'text',
    code: null,
    note: 'Described, not quoted — this repository is private. Stores 7 tables: stations, sessions, settings, activities, snacks, cafeteria_expenses, revenue_history.',
  },

  'node-m6': {
    title: 'Start-GameZone.bat',
    path: 'Start-GameZone.bat',
    lang: 'text',
    code: null,
    note: 'Described, not quoted — this repository is private. One-click batch script launcher running locally on Windows 7.',
  },

  'pragma-callout-box': {
    title: 'SQLite Pragmas & Transactions',
    path: 'backend/database.js',
    lang: 'sql',
    code: `PRAGMA journal_mode = WAL;
PRAGMA synchronous  = NORMAL;
PRAGMA temp_store   = MEMORY;
PRAGMA cache_size   = -10000;
BEGIN TRANSACTION … COMMIT;`,
    note: 'The pragmas are quoted; the surrounding JavaScript is in a private repository and is not reproduced.',
  },

  'node-r1': {
    title: 'station occupied',
    path: 'backend/server.js',
    lang: 'text',
    code: null,
    note: 'Described, not quoted — this repository is private. Active session currently running on POS station.',
  },

  'node-r2': {
    title: 'POST /api/sessions/add-game',
    path: 'backend/server.js',
    lang: 'text',
    code: null,
    note: 'Described, not quoted — this repository is private. Endpoint called when switching games mid-session.',
  },

  'node-r3': {
    title: 'overage computed',
    path: 'backend/server.js',
    lang: 'text',
    code: null,
    note: 'Described, not quoted — this repository is private. Played overage time computed from initial activity duration.',
  },

  'node-r4': {
    title: 'deducted from new activity',
    path: 'backend/server.js',
    lang: 'text',
    code: null,
    note: 'Described, not quoted — this repository is private. Computed overage deducted from the new activity duration, keeping station occupancy unbroken.',
  },
};

export const DIAGRAM_SNIPPET_IDS: Record<'deployment-platform' | 'gamezone', string[]> = {
  'deployment-platform': [
    'git-url',
    'platform-api',
    'bullmq-queue',
    'platform-worker',
    'platform-build-sandbox',
    'lockfile-cache',
    'minio',
    'postgres-atomic-swap',
    'socket-io',
    'platform-dashboard',
    'platform-proxy',
    'browser',
  ],
  gamezone: [
    'node-m1',
    'node-m2',
    'node-m3',
    'node-m4',
    'node-m5',
    'node-m6',
    'pragma-callout-box',
    'node-r1',
    'node-r2',
    'node-r3',
    'node-r4',
  ],
};
