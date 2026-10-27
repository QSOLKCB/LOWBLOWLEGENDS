import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync('docs/ASSET_MANIFEST.json','utf8'));
for(const entry of manifest.assets){
  assert.equal(entry.license,'Apache-2.0');assert.ok(entry.origin&&entry.author&&entry.reviewDate);
  assert.equal(createHash('sha256').update(readFileSync(entry.path)).digest('hex'),entry.sha256,`Asset source changed; review/update manifest: ${entry.path}`);
}
const paths=['index.html','style.css','sw.js',...readdirSync('src/game').map(f=>'src/game/'+f)];
let bytes=0;
for(const path of paths){
  bytes+=statSync(path).size;
  const text=readFileSync(path,'utf8');
  assert.doesNotMatch(text,/(?:fetch\s*\(\s*['"]https?:|https?:\/\/[^'"\s]*\.(?:png|jpg|woff|mp3)|\beval\s*\(|new Function\s*\()/i,`Unexpected runtime external asset or evaluation: ${path}`);
}
assert.ok(bytes<100_000,`Uncompressed runtime exceeds reviewed 100 kB budget: ${bytes}`);
const fixture='tests/fixtures/arcade-v1.json';
assert.equal(createHash('sha256').update(readFileSync(fixture)).digest('hex'),manifest.replay.sha256,'Preserved replay fixture changed');
console.log(`Original asset source hashes and frozen replay SHA-256 verified; runtime ${bytes} bytes (budget 100,000).`);
