# the Syllabary

Interactive web edition of The Syllabary by Peter McCarey. Built with [Vite](https://vite.dev); tests run with [Vitest](https://vitest.dev).

## Requirements

- Node 22.22.0 (see `.nvmrc`; Vite needs 22.12 or newer). With nvm, run `nvm use`.

```sh
npm install
```

## Assets

The app loads its glyphs, poems and audio from folders at the project root. They are too big for git (about 465 MB) and are not part of the build. Put them next to `index.html`:

| Folder | Contents | In git? |
|---|---|---|
| `coallatedSvg/` | Glyphs, one file per x-y pair (`1-1.svg` to `20-10.svg`, 200 files) | No |
| `poems/` | Poem text, XML files named by syllable | No |
| `audio/` | Audio, one MP3 per syllable, plus `silence.mp3` and `test-autoplay.mp3` | No |
| `svg/` | `syllabary_v4_loading_screen.svg` (tracked), plus the numbered source glyphs `1-1-1.svg` to `20-10-18.svg` (not tracked) | Partly |

`question.html` and `exclamation.html` also live at the root and are not part of the build.

`coallatedSvg/` is generated from the numbered files in `svg/`:

```sh
npm run coallateSvg
```

This empties `coallatedSvg/` first, then rewrites all 200 files.

The code requests these folders by absolute URL (`/audio/...`, `/poems/...`, `/coallatedSvg/...`, `/svg/...`), so the site must be served from the root of a domain.

## Develop

```sh
npm run dev
```

Opens a dev server (http://localhost:5173) that serves the app and the asset folders straight from the project root, with hot reload.

To try it on a phone or tablet on the same network:

```sh
npm run dev -- --host
```

Then open the network address it prints.

URL parameters are passed to the app. `debug=true` shows the debug controls. `xPosition`, `yPosition` and `zPosition` set the starting position (random when omitted). Any other option that exists in `src/Config.js` can be set the same way, for example `?navQueueLength=4`.

## Test

```sh
npm test            # run once
npm run test:watch  # re-run on change
```

Tests are in `test/*.test.js`.

## Build

```sh
npm run build
```

Writes the site to `dist/`:

- `index.html`
- `assets/`: the JavaScript bundle, CSS and font, with content hashes in their names

The build targets Chrome and Firefox 100, and Safari and iOS 15 (`vite.config.js`), so older iPads keep working.

`npm run preview` serves `dist/` locally, but it does not have the asset folders, so glyphs and sound will not load. Use `npm run dev` for anything that needs them.

## Deploy

The server directory that is the web root holds the asset folders, `question.html` and `exclamation.html`. Deploying means copying the **contents of `dist/`** into that directory.

1. `npm run build`
2. Upload `dist/assets/` first.
3. Upload `dist/index.html` last, so visitors never get a page that points at files that are not there yet.
4. Open the site and check that the loading screen finishes and sound plays.

Do not delete the asset folders, and do not upload `dist/` as a subfolder.

Each build gives the bundle new file names, so old files accumulate in `assets/`. Once the new version works, delete any files in `assets/` that the new `index.html` does not reference.
