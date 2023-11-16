import fs from 'fs';
import { BuildConfig, BunPlugin } from 'bun';
import * as svelte from 'svelte/compiler';
import sveltePreprocess from 'svelte-preprocess';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//https://esbuild.github.io/plugins/#svelte-plugin
const SveltePlugin: BunPlugin = {
	name: 'svelte',
	setup(build) {
		build.onLoad({ filter: /\.svelte$/ }, async (args) => {
			// Load the file from the file system
			const source = await Bun.file(args.path).text();
			const filename = path.relative(process.cwd(), args.path);

			// Convert Svelte syntax to JavaScript
			const {code: preprocessed} = await svelte.preprocess(source, sveltePreprocess(), { filename });
			let { js, warnings } = svelte.compile(preprocessed, { filename, dev: process.env.NODE_ENV === 'development' });
			const contents = js.code + '//# sourceMappingURL=' + js.map.toUrl();

			warnings = warnings
				.filter(w =>
					//TODO Handle a11y-click-events-have-key-events
					w.code !== 'a11y-click-events-have-key-events' &&
					//TODO Handle a11y-no-noninteractive-element-interactions
					w.code !== 'a11y-no-noninteractive-element-interactions'
				);

			for (const warning of warnings)
				console.warn(warning.message);

			return { contents, loader: 'js' };
		});
	}
};

const outdir = './dist';


let entryPoint = './src/entry.ts';
const entryIndex = process.argv.findIndex(s => s === '--entry');
if (entryIndex > -1 && process.argv.length >= entryIndex)
	entryPoint = path.join(dirname(fileURLToPath(import.meta.url)), process.argv[entryIndex + 1]);

export const buildOptions: BuildConfig = {
	entrypoints: [entryPoint],
	outdir,
	// logLevel: `debug`,
	minify: false, //so the resulting code is easier to understand
	sourcemap: 'inline',
	splitting: true,
	format: 'esm',
	// watch: process.argv.includes('--watch'),
	plugins: [SveltePlugin],
	naming: {
		entry: '[dir]/[name].[ext]',
		//because we import partialGlobal.css in index.html
		asset: '[dir]/[name].[ext]',
	},
};

//make sure the directoy exists before stuff gets put into it
if (!fs.existsSync(outdir))
	fs.mkdirSync(outdir);

let port = 8080;
const portIndex = process.argv.findIndex(s => s === '--port');
if (portIndex > -1 && process.argv.length >= portIndex)
	port = parseInt(process.argv[portIndex + 1]);

const result = await Bun.build(buildOptions);

if (!result.success) {
	console.error("Build failed");
	for (const message of result.logs)
		console.error(message);
	process.exit(1);
}

//TODO Dynamically copy all files from static folder
for (const file of [
	'android-chrome-192x192.png',
	'android-chrome-512x512.png',
	'apple-touch-icon.png',
	'favicon.ico',
	'favicon-16x16.png',
	'favicon-32x32.png',
	'site.webmanifest',
	'CNAME',
	'index.html',
	'global.css',
])
	fs.copyFileSync('./static/' + file, './dist/' + file);