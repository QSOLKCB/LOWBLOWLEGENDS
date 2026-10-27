import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
const dest = '_site';
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
for (const file of ['index.html', 'style.css', 'sw.js']) cpSync(file, dest + '/' + file);
cpSync('src/game', dest + '/src/game', { recursive: true });
writeFileSync(dest + '/.nojekyll', '');
console.log('Staged playable static site in _site/ (zero runtime dependencies).');
