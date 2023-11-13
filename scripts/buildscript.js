import fs from 'fs';
import * as svelte from 'svelte/compiler';
import sveltePreprocess from 'svelte-preprocess';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//https://esbuild.github.io/plugins/#svelte-plugin
const SveltePlugin = {
	name: 'svelte',
	setup(build) {
		build.onLoad({ filter: /\.svelte$/ }, async (args) => {
			// This converts a message in Svelte's format to esbuild's format
			const convertMessage = ({ message, start, end, code }) => {
				let location;
				if (start && end) {
					const lineText = source.split(/\r\n|\r|\n/g)[start.line - 1];
					const lineEnd = start.line === end.line ? end.column : lineText.length;
					location = {
						file: filename,
						line: start.line,
						column: start.column,
						length: lineEnd - start.column,
						lineText,
					};
				}
				return { text: `${message} (${code})`, location };
			};

			// Load the file from the file system
			const source = await fs.promises.readFile(args.path, 'utf8');
			const filename = path.relative(process.cwd(), args.path);

			// Convert Svelte syntax to JavaScript
			try {
				const {code: preprocessed} = await svelte.preprocess(source, sveltePreprocess(), { filename });
				let { js, warnings } = svelte.compile(preprocessed, { filename, dev: process.env.NODE_ENV === 'development' });
				const contents = js.code + '//# sourceMappingURL=' + js.map.toUrl();

				warnings = warnings
					.filter(w =>
						//TODO Handle a11y-click-events-have-key-events
						w.code !== 'a11y-click-events-have-key-events' &&
						//TODO Handle a11y-no-noninteractive-element-interactions
						w.code !== 'a11y-no-noninteractive-element-interactions'
					)
					.map(convertMessage);

				return { contents, warnings };
			} catch (e) {
				return { errors: [convertMessage(e)] };
			}
		});
	}
};

const outdir = './dist';


let entryPoint = './src/entry.ts';
const entryIndex = process.argv.findIndex(s => s === '--entry');
if (entryIndex > -1 && process.argv.length >= entryIndex)
	entryPoint = path.join(dirname(fileURLToPath(import.meta.url)), process.argv[entryIndex + 1]);

export const buildOptions = {
	entryPoints: [entryPoint],
	bundle: true,
	outdir,
	mainFields: ['svelte', 'browser', 'module', 'main', 'exports'],
	// logLevel: `debug`,
	minify: false, //so the resulting code is easier to understand
	sourcemap: 'inline',
	splitting: true,
	write: true,
	format: 'esm',
	watch: process.argv.includes('--watch'),
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

/* if (process.argv.includes('--serve'))
	esbuild
		.serve({
			port,
			servedir: outdir,
		}, {
			...buildOptions,
			logLevel: 'debug',
		})
		.then(({ host, port }) => {
			if (host === '0.0.0.0')
				host = 'localhost';
			console.log(`Serving at \`http://${host}:${port}\`...`);
		})
		.catch(errorHandler);
else */
	const result = await Bun.build(buildOptions);

	if (!result.success) {
		console.error("Build failed");
		for (const message of result.logs) {
			// Bun will pretty print the message object
			console.error(message);
		}
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