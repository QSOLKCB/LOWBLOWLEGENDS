import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
const dest = '_site';
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
for (const file of ['index.html', 'style.css']) cpSync(file, dest + '/' + file);
mkdirSync(dest + '/src', { recursive: true });
cpSync('src/teaser.js', dest + '/src/teaser.js');
writeFileSync(dest + '/.nojekyll', '');
console.log('Staged static pre-production site in _site/ (no runtime packages).');

