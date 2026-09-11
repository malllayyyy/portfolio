import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_PROJECTS = [
  'deployment-platform',
  'ProAcademys',
  'GameZone',
  'Switchboard'
];

const REQUIRED_PHRASES = [
  'Malay Chaudhary',
  'SURFACE',
  'DEVICE',
  'REASONING',
  'BEDROCK'
];

const ROUTES = [
  'out/index.html',
  'out/about.html',
  'out/resume.html',
  'out/layer/surface.html',
  'out/layer/device.html',
  'out/layer/reasoning.html',
  'out/project/deployment-platform.html',
  'out/project/proacademys.html',
  'out/project/gamezone.html',
  'out/project/switchboard.html'
];

function extractCleanText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function assertParity() {
  if (!fs.existsSync('out/index.html')) {
    console.error('Error: out/index.html does not exist. Run "npm run build" first.');
    process.exit(1);
  }

  const indexHtml = fs.readFileSync('out/index.html', 'utf8');
  const indexText = extractCleanText(indexHtml);

  for (const project of REQUIRED_PROJECTS) {
    if (!indexText.includes(project)) {
      console.error(`Parity error: project "${project}" missing from static DOM text in out/index.html`);
      process.exit(1);
    }
  }

  for (const phrase of REQUIRED_PHRASES) {
    if (!indexText.includes(phrase)) {
      console.error(`Parity error: phrase "${phrase}" missing from static DOM text in out/index.html`);
      process.exit(1);
    }
  }

  let verifiedCount = 0;
  for (const routePath of ROUTES) {
    if (!fs.existsSync(routePath)) {
      console.error(`Parity error: route file "${routePath}" does not exist`);
      process.exit(1);
    }
    const html = fs.readFileSync(routePath, 'utf8');
    const text = extractCleanText(html);
    if (text.length < 100) {
      console.error(`Parity error: route "${routePath}" text content is suspiciously small (${text.length} chars)`);
      process.exit(1);
    }
    verifiedCount++;
  }

  console.log(`parity OK, ${verifiedCount} routes`);
}

assertParity();
