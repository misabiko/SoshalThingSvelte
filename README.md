# SoshalThingSvelte [![CI@main](https://github.com/misabiko/SoshalThingSvelte/actions/workflows/ci.yml/badge.svg?branch=main "CI@main")](https://github.com/misabiko/SoshalThingSvelte/actions/workflows/ci.yml)

Tweetdeck-style timeline app to display feeds from various services in columns.

Mostly for my personal use, so the code is messy and the UI is all over the place. 😊

Hosted on https://soshalthing.com

---
## Why I use it (vs Tweetdeck)
- Not having every image cropped
- Mark posts as read and hide them as I read
- Having multiple sources per timeline rather than 15 individual timelines
- Multi-column timelines
- Adding timelines to other websites
- Using it for multiple services

## Usage

### Dev
Build with `bun build`
Serve the app  on `localhost:8080` with `bun serve`
You can pass `--port <port>` to serve over a specific port

Build the extension with `bun build:extension`

Test with `bun test`, it uses the port 8089 by default

[//]: # (TODO Fix opening multiple user modal user timelines)
[//]: # (TODO Finish fixing linting)
[//]: # (TODO Try removing eslint-disable no-unnecessary-condition)
[//]: # (TODO +2 Fix svelte-fa)
[//]: # (TODO +1 Add extension popup to inject soshal)
[//]: # (TODO +1 Make eslint work for svelte files scripts)
[//]: # (TODO +1 Persist auto refresh)
[//]: # (TODO Activate rune mode)
[//]: # (TODO Rename favviewer to injected)
[//]: # (TODO Add "one time endpoints" to timeline options)
[//]: # (TODO Print vscode's problems)
[//]: # (TODO "Third-party cookie will be blocked in future Chrome versions as part of Privacy Sandbox.")
[//]: # (TODO Filter for "article from X service")
[//]: # (TODO Lint github workflows)
[//]: # (TODO Cleanup packages)
[//]: # (TODO Go through project's TODOs)