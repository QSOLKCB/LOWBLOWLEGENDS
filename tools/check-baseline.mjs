import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const required = [
  'README.md', 'LICENSE', 'AGENTS.md', 'GETTING_STARTED.md', 'INSTRUCTIONS.md',
  'docs/INVARIANTS.md', 'docs/GAME_DESIGN.md', 'docs/ARCHITECTURE.md',
  'docs/ASSETS_AND_RIGHTS.md', 'docs/ROADMAP.md', 'docs/WORK_HANDOFF.md',
  'src/combat-core.mjs', 'src/teaser.js', 'index.html', 'style.css',
  'tests/combat-core.test.mjs', '.github/workflows/check.yml',
];
for (const path of required) assert.ok(existsSync(path), 'Missing baseline file: ' + path);

const invariants = readFileSync('docs/INVARIANTS.md', 'utf8');
for (let i = 1; i <= 16; i++) {
  const id = 'LBL-' + String(i).padStart(3, '0');
  assert.ok(invariants.includes(id), 'Missing invariant ' + id);
}
const agents = readFileSync('AGENTS.md', 'utf8');
assert.match(agents, /Never commit directly to main/i);
assert.match(agents, /exact final commit/i);
const html = readFileSync('index.html', 'utf8');
assert.match(html, /pre-production/i);
assert.match(html, /src\/teaser\.js/);
assert.doesNotMatch(html, /<script[^>]+https?:\/\//i);
assert.doesNotMatch(html, /<link[^>]+https?:\/\//i);
const core = readFileSync('src/combat-core.mjs', 'utf8');
for (const banned of ['Math.random(', 'Date.now(', 'performance.now(', 'fetch(', 'setTimeout(']) {
  assert.ok(!core.includes(banned), 'Nondeterministic/unwanted core API: ' + banned);
}
console.log('Foundation structure, invariant IDs and local-only site resources: OK');

