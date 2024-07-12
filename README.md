# SoshalThingSvelte [![CI@main](https://github.com/misabiko/SoshalThingSvelte/actions/workflows/ci.yml/badge.svg?branch=main "CI@main")](https://github.com/misabiko/SoshalThingSvelte/actions/workflows/ci.yml)

Tweetdeck-style timeline app to display feeds from various services in columns.

Mostly for my personal use, so the code is messy and the UI is all over the place. 😊

Hosted on https://soshalthing.com

Rust version: https://github.com/misabiko/SoshalThingYew

---
## Why I use it (vs Tweetdeck)
- Not having every image cropped
- Mark posts as read and hide them as I read
- Having multiple sources per timeline rather than 15 individual timelines
- Multi-column timelines
- Adding timelines to other websites
- Using it for other services than Twitter (not quite there yet)

## Usage

### Dev
Build with `npm run build`
Serve the app  on `localhost:8080` with `npm run serve`
You can pass `--port <port>` to serve over a specific port

Build the extension with `npm run build:extension`

Test with `npm test`, it uses the port 8089 by default

---

TODO Be able to add endpoints from ui
TODO Add "one time endpoints" to timeline options
TODO Fix modals
TODO Add extension popup to inject soshal
TODO Make eslint work for svelte files scripts
TODO Rename favviewer to injected
TODO Print vscode's problems
TODO Go through project's TODOs
TODO "Third-party cookie will be blocked in future Chrome versions as part of Privacy Sandbox."
TODO Filter for "article from X service"
TODO Persist auto refresh
TODO Port to bun