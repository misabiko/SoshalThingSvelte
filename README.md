# SoshalThingSvelte [![CI@main](https://github.com/misabiko/SoshalThingSvelte/actions/workflows/ci.yml/badge.svg?branch=main "CI@main")](https://github.com/misabiko/SoshalThingSvelte/actions/workflows/ci.yml) <a href="https://bulma.io"> <img src="https://bulma.io/images/made-with-bulma.png" alt="Made with Bulma" width="128" height="24"> </a>

Tweetdeck-style timeline app to display feeds from various services in columns.

Mostly for my personal use, so the code is messy and the UI is all over the place. 😊

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
Serve the app  on `localhost:8081` with `npm run serve`

Build the extension with `npm run build:extension`
Needs a `credentials.json` in the working directory with `twitter.consumer_key` and `twitter.consumer_secret` for a Twitter app.  