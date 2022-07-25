import fs from 'fs';
import esbuild from 'esbuild';
import esbuildSvelte from 'esbuild-svelte';
import sveltePreprocess from 'svelte-preprocess';
import {sassPlugin} from 'esbuild-sass-plugin';
import postcss from 'esbuild-postcss';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

//From https://github.com/evanw/esbuild/issues/2093#issuecomment-1062461380
//To make sure Soshal library uses the same svelte runtime as this one
const DedupSvelteInternalPlugin = {
	name: 'dedup-svelte',
	async setup({ onResolve }) {
		const svelteInternal = path.join(process.cwd(), '/node_modules/svelte/internal/index.mjs');
		const svelte = path.join(process.cwd(), '/node_modules/svelte/index.mjs');

		onResolve({ filter: /^svelte\/internal$/ }, () => ({ path: svelteInternal }));
		onResolve({ filter: /^svelte$/ }, () => ({ path: svelte }));
	},
};

const outdir = './dist';


let entryPoint = './src/entry.ts'
const entryIndex = process.argv.findIndex(s => s === '--entry')
if (entryIndex > -1 && process.argv.length >= entryIndex)
	entryPoint = path.join(dirname(fileURLToPath(import.meta.url)), process.argv[entryIndex + 1])

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
	format: `esm`,
	watch: process.argv.includes(`--watch`),
	plugins: [
		esbuildSvelte({
			compilerOptions: {dev: true},
			preprocess: sveltePreprocess(),
		}),
		DedupSvelteInternalPlugin,
		sassPlugin(),
		postcss(),
	],
};

export const errorHandler = (error, location) => {
	console.warn(`Errors: `, error, location);
	process.exit(1);
};

//make sure the directoy exists before stuff gets put into it
if (!fs.existsSync(outdir))
	fs.mkdirSync(outdir);

let port = 8080
const portIndex = process.argv.findIndex(s => s === '--port')
if (portIndex > -1 && process.argv.length >= portIndex)
	port = parseInt(process.argv[portIndex + 1])

if (process.argv.includes('--serve'))
	esbuild
		.serve({
			port,
			servedir: outdir,
		}, {
			...buildOptions,
			logLevel: `debug`,
		})
		.then(({host, port}) => {
			console.log(`Serving at ${host}:${port}...`)
		})
		.catch(errorHandler);
else
	esbuild
		.build(buildOptions)
		.catch(errorHandler);

fs.copyFileSync('./src/index.html', './dist/index.html');
for (const file of [
	'android-chrome-192x192.png',
	'android-chrome-512x512.png',
	'apple-touch-icon.png',
	'favicon.ico',
	'favicon-16x16.png',
	'favicon-32x32.png',
	'site.webmanifest',
	'CNAME'
])
	fs.copyFileSync('./static/' + file, './dist/' + file)

// maybe incorporate svelte-check or tsc too?
// https://github.com/EMH333/esbuild-svelte/blob/main/build.js
