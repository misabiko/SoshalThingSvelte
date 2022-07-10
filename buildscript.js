import fs from 'fs';
import esbuild from 'esbuild';
import esbuildSvelte from 'esbuild-svelte';
import sveltePreprocess from 'svelte-preprocess';
import {sassPlugin} from 'esbuild-sass-plugin';
import postcss from 'esbuild-postcss';
import path from "path";

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

export const buildOptions = {
	entryPoints: [`./src/entry.ts`],
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

if (process.argv.includes('--serve'))
	esbuild
		.serve({
			port: 8081,
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

//use a basic html file to test with
fs.copyFileSync('./src/index.html', './dist/index.html');

// maybe incorporate svelte-check or tsc too?
// https://github.com/EMH333/esbuild-svelte/blob/main/build.js
