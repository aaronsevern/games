# Game Arcade

Landing page + 5 Phaser games (sibling repos in `../`) deployed to GitHub Pages.

## Commands
- `npm run build` – build all games, assemble `site/`
- `npm run build:fast` – reuse existing game `dist/` folders, only rebuild landing
- `npm run titles` – screenshot title screens into `landing/img/` (needs `site/` built)
- `npm run preview` – serve `site/` at http://localhost:4173
- `npm run deploy` – build + push `site/` to the `gh-pages` branch

## First deploy
1. Create empty repo `games` on github.com (no README).
2. `git remote add origin https://github.com/aaronsevern/games.git`, commit, `git push -u origin main`
3. `npm run deploy`
4. Repo Settings → Pages → Source: "Deploy from a branch", branch `gh-pages` / root.
5. Site: https://aaronsevern.github.io/games/

## Adding a game
Add entry to `games.json` (slug = sibling repo folder; repo must build to `dist/` with `base: './'`), run `npm run build && npm run titles && npm run build:fast`.
