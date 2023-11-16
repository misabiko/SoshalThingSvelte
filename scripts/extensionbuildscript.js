import esbuild from 'esbuild';
import {buildOptions, errorHandler} from './buildscript.js';
import fs from 'fs';
import path from 'path';

//From https://github.com/evanw/esbuild/issues/2093#issuecomment-1062461380
//To make sure Soshal library uses the same svelte runtime as this one
const DedupSvelteInternalPlugin = {
	name: 'dedup-svelte',
	async setup({ onResolve }) {
		const svelteInternal = path.join(process.cwd(), '/node_modules/svelte/src/runtime/internal/index.js');
		const svelte = path.join(process.cwd(), '/node_modules/svelte/src/runtime/index.js');

		onResolve({ filter: /^svelte\/internal$/ }, () => ({ path: svelteInternal }));
		onResolve({ filter: /^svelte$/ }, () => ({ path: svelte }));
	},
};

const outdir = './chrome extension/dist';

const extensionBuildOptions = {
	...buildOptions,
	entryPoints: [
		'./src/extension/background.js',
		'./src/extension/pixiv/userPage/entry.ts',
		'./src/extension/pixiv/followIllusts/entry.ts',
	],
	outdir,
	splitting: false,
	format: 'iife',
	plugins: [...buildOptions.plugins, DedupSvelteInternalPlugin],
};

if (!fs.existsSync(outdir))
	fs.mkdirSync(outdir);

esbuild
	.build(extensionBuildOptions)
	.catch(errorHandler);