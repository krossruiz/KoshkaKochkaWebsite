# KoshkaKochkaWebsite (Project Directory)

**What this is:** a website that catalogs every project folder in `programming projects/` — one card per project, each with a description, usage instructions, tech tags, and (where possible) a way to actually run or download it: a **Launch** button for static web apps, **Run in Browser (Python)** for simple Python scripts (via Pyodide/WebAssembly, no install needed), or a **Download .zip** / **View on GitHub** link for everything else. `admin.json` controls which projects are visible, and `projects.json` holds all the catalog data.

- **Live site:** https://koshkakochka.vercel.app
- **GitHub repo (private):** https://github.com/krossruiz/KoshkaKochkaWebsite

This repo is deployed on Vercel and also meant to be run locally. The two modes behave differently — see below.

## Hosted (Vercel) vs. local

This site is pushed to its own private GitHub repo and deployed to Vercel from that repo (auto-deploys on every push to `main`). Most launchable projects' files are **embedded directly in this repo** under `projects/<id>/`, so their Launch / Run-in-Browser buttons work identically on the hosted site and locally. A couple are excluded for size (see below) and only run when this catalog is served locally.

- **Every card**, hosted or local: description, tech tags, and a **View on GitHub** link if the project's been published (private repo — you'll need GitHub access).
- **Embedded projects** (~13 of them — static HTML/JS apps and the two small Pyodide scripts): **Launch** / **Run in Browser (Python)** work on both the hosted site and locally, since their files ship inside this repo.
- **Two non-embedded exceptions** — `sitoaqui` (1.4GB of media in its `resources/` folder) and `gemma3ninferencetest` (multi-gigabyte `.task` model files) — are too large to bundle into this deployment. Their Launch button only appears/works when this catalog is run **locally** (via the sibling folder one level up); hosted, they just show a note + GitHub link.
- **Zip downloads** and Chrome/VS Code extensions remain **local-only** either way (not worth bundling every project's full source twice — clone from GitHub instead when hosted).

If you add a new launchable project and want it to work hosted too, copy its files into `projects/<id>/` in this repo (see "Updating" below) and set `"embedded": true` on it in `projects.json`.

## Running it locally

Browsers block `fetch()` on `file://` pages, so double-clicking `index.html` won't load the data. Instead:

1. Double-click `serve.bat` (requires Python on PATH), or run manually from the **parent** folder (`programming projects/`, one level up from this one):
   ```
   python -m http.server 8000
   ```
2. Open http://localhost:8000/KoshkaKochkaWebsite/ in your browser.

The server is rooted one level up so the site can also serve the project folders themselves (for "Launch" and "Run in Browser").

## What each project can do on the site

Every card shows a description, usage notes, and one of:

- **Launch** — for plain static HTML/JS apps (and the WebXR/Three.js demos, which run fine in a normal tab but only show real passthrough/mixed-reality on a WebXR headset browser). Opens the project directly in a new tab.
- **Run in Browser (Python)** — for simple, dependency-light Python console scripts. Runs actual Python entirely client-side via [Pyodide](https://pyodide.org) (Python compiled to WebAssembly) — no install, no server. `input()` calls pop a browser prompt; matplotlib output renders as an image.
- **Download .zip** — for everything else. Includes Chrome/VS Code extensions (with load-unpacked / install instructions already in "How to use"), and any project too complex to run in a browser (Unity, Android/Gradle, C++/JUCE, Next.js+DB apps, Ollama-dependent CLIs, large ML models, etc).
- Some projects show neither: truly empty/placeholder folders, or projects flagged `skipDownload` because they contain multi-gigabyte model weights or ROMs that aren't practical to zip (e.g. `vidgen`, `gemma3ninferencetest` — the latter still has a working **Launch** button since its files are just served directly, not zipped).

**Why not everything runs in-browser:** a website can only execute code the browser itself can run — static HTML/JS, or Python via a WebAssembly runtime (Pyodide, which only supports pure-Python and a curated set of scientific packages like numpy/matplotlib). Unity/Godot builds, Android APKs, native C/C++, and anything needing a real backend, GPU, or external service (Ollama, ffmpeg, a database) cannot run inside a browser tab — those get a download link instead.

## Files

- `index.html` — the site (search + category filter + per-project action buttons)
- `python-runner.html` — generic Pyodide-based console/plot runner, opened as `python-runner.html?src=<path-to-.py>&mode=plain|matplotlib&title=<name>`
- `projects/` — embedded copies of the ~13 launchable projects' files (`projects/<id>/...`), committed to this repo so Launch/Run-in-Browser work on the hosted site too. These are copies, not symlinks — re-copy manually if the source folder changes.
- `projects.json` — the data: one entry per project folder (title, description, how to use, tech, category, runtime info — `runtime` is `"launch"`, `"pyodide"`, `"extension"`, or omitted/`"download"` — and `embedded: true/false` for launch/pyodide projects)
- `admin.json` — **visibility control**. Under `"visibility"`, set a folder's id to `true` to show it or `false` to hide it from the site. Any id not listed defaults to visible. Reload the page after editing.
- `build-downloads.ps1` — run this (PowerShell) whenever project folders change, to (re)build `downloads/<id>.zip` for every visible project. Excludes `node_modules`, `.git`, `venv`, build output dirs, etc, and skips anything still over ~150MB after that (writes nothing for it, and marks `skipDownload` projects as too-large in the description above). Writes `downloads-manifest.json` listing what got built, which the site reads to decide whether to show a Download button.
- `serve.bat` — starts a local server (from the parent folder) so `fetch()`, Launch, and Run-in-Browser all work
- `downloads/` — generated zip files (gitignored — not part of the repo or the Vercel deployment; regenerate anytime with `build-downloads.ps1`)
- `.gitignore` — excludes `downloads/` and local build logs from the repo/deployment

## Uploading changes to Vercel

The repo is already linked to Vercel with GitHub auto-deploy turned on, so in the normal case you never need to touch the `vercel` CLI — just push to `main`:

```
git add -A
git commit -m "Update catalog"
git push
```

Vercel picks up the push within a few seconds, builds (this is a static site, so there's nothing to actually compile — it just publishes the files), and updates the live URL above. Check progress at https://vercel.com (or run `vercel ls` / `vercel inspect <deployment-url>` from this folder) if you want to watch it happen.

**If you ever need to deploy manually instead** (e.g. testing something before committing):
```
vercel --prod
```
This requires the Vercel CLI (`npm i -g vercel`) and being logged in (`vercel login`, one-time). It deploys whatever is currently on disk in this folder, independent of git.

**One-time setup**, for reference (already done, only needed again if the project/repo is ever recreated):
1. `git init`, then `gh repo create --private --source=. --push` (or push to an existing empty GitHub repo)
2. `vercel login`
3. From this folder: `vercel link` — this creates the Vercel project and auto-detects+connects the GitHub repo for you
4. `vercel --prod` for the first deploy

## Updating

`projects.json` was generated by scanning each folder's README/package.json/source files, so descriptions may be imprecise for undocumented projects — edit freely. If you add a new project folder:

1. Add a matching entry to `projects.json` (and optionally to `admin.json`).
2. If it's a plain static HTML app, add `"runtime": "launch", "entry": "index.html"` (or whatever the entry file is).
3. If it's a simple pure-Python script (stdlib, or numpy/matplotlib), add `"runtime": "pyodide", "pyFile": "script.py", "pyMode": "plain"` (or `"matplotlib"` if it calls `plt.show()`).
4. If it's a Chrome or VS Code extension, add `"runtime": "extension", "extensionKind": "chrome"` (or `"vscode"`).
5. Otherwise leave `runtime` out — it'll just get a Download button once you rerun `build-downloads.ps1`.
6. For `"launch"`/`"pyodide"` projects, decide whether to embed it (make Launch/Run-in-Browser work on the hosted site, not just locally): if it's reasonably small (no single file over ~90MB, ideally under ~50MB total) and has no secrets, copy its folder into `projects/<id>/` (exclude `.git` and heavy `node_modules/.cache`-type junk) and set `"embedded": true`. Otherwise leave `"embedded": false` (or omit it) and it'll only Launch when this catalog runs locally.
