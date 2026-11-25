// Builds each sibling game repo and assembles the deployable site/ folder.
// Usage: node scripts/build-all.mjs [--skip-games]   (--skip-games reuses existing dist/ folders)
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Uppercase the Windows drive letter: Vite's HTML proxy breaks when cwd is "c:\" vs "C:\".
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..').replace(/^[a-z]:/, (d) => d.toUpperCase());
const reposDir = resolve(root, '..');
const site = join(root, 'site');
const games = JSON.parse(readFileSync(join(root, 'games.json'), 'utf8'));
const skipGames = process.argv.includes('--skip-games');

rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });

for (const g of games) {
  const repo = join(reposDir, g.slug);
  if (!existsSync(join(repo, 'package.json'))) throw new Error(`Missing repo: ${repo}`);
  if (!skipGames) {
    console.log(`\n=== Building ${g.slug}`);
    const run = (cmd) => execSync(cmd, { cwd: repo, stdio: 'inherit' });
    if (!existsSync(join(repo, 'node_modules'))) run('npm ci');
    run('npm run build');
  }
  const dist = join(repo, 'dist');
  if (!existsSync(join(dist, 'index.html'))) throw new Error(`No build output: ${dist}`);
  cpSync(dist, join(site, g.slug), { recursive: true });
  console.log(`  -> site/${g.slug}/`);
}

// Landing page: copy static files, inject game cards from games.json.
cpSync(join(root, 'landing'), site, { recursive: true });
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const cards = games
  .map(
    (g) => `
      <a class="card" href="./${g.slug}/">
        <img src="./img/${g.slug}.webp" alt="${esc(g.name)} title screen" width="800" height="450" loading="lazy">
        <div class="info">
          <h2>${esc(g.name)}</h2>
          ${g.credits ? `<p class="credits">${esc(g.credits)}</p>` : ''}
          <p class="blurb">${esc(g.blurb)}</p>
          <p class="meta"><span>${esc(g.players)}</span><span class="play">Play &rarr;</span></p>
        </div>
      </a>`,
  )
  .join('');
const indexPath = join(site, 'index.html');
writeFileSync(indexPath, readFileSync(indexPath, 'utf8').replace('<!--CARDS-->', cards));
console.log('\nsite/ ready.');
