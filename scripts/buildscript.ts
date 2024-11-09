import fs from 'fs/promises';
import esbuild, { type BuildOptions } from 'esbuild';
import * as svelte from 'svelte/compiler';
import { sveltePreprocess } from 'svelte-preprocess';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import EsbuildPluginImportGlob from 'esbuild-plugin-import-glob';
import type { Warning } from 'svelte/compiler';
import { parseArgs } from 'util';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';

//https://esbuild.github.io/plugins/#svelte-plugin
const SveltePlugin: esbuild.Plugin = {
	name: 'svelte',
	setup(build) {
		build.onLoad({ filter: /\.svelte$/ }, async args => {
			//Load the file from the file system
			const source = await fs.readFile(args.path, 'utf8');
			const filename = path.relative(process.cwd(), args.path);

			const { code: preprocessed } = await svelte.preprocess(source, sveltePreprocess(), { filename });

			const convertMessage = ({ message, start, end, code }: Warning) => {
				let location;
				if (start && end) {
					const lineText = preprocessed.split(/\r\n|\r|\n/g)[start.line - 1];
					if (!lineText)
						throw new Error('Line text not found');
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

			//Convert Svelte syntax to JavaScript
			try {
				const { js, warnings } = svelte.compile(preprocessed, {
					filename,
					dev: process.env.NODE_ENV === 'development',
					css: 'injected',
				});
				const contents = js.code + '//# sourceMappingURL=' + js.map.toUrl();

				const partialMessageWarnings = warnings
					.filter(w =>
						//TODO Handle a11y-click-events-have-key-events
						w.code !== 'a11y-click-events-have-key-events' &&
						//TODO Handle a11y-no-noninteractive-element-interactions
						w.code !== 'a11y-no-noninteractive-element-interactions',
					)
					.map(convertMessage);

				return { contents, warnings: partialMessageWarnings };
			}catch (e) {
				return { errors: [convertMessage(e as Warning)] };
			}
		});
	},
};

const args = parseArgs({
	args: Bun.argv,
	options: {
		entry: {
			type: 'string',
			default: '../src/entry.ts',
		},
		outdir: {
			type: 'string',
			default: './dist',
		},
	},
	strict: true,
	allowPositionals: true,
});

export const buildOptions: BuildOptions = {
	entryPoints: [path.join(dirname(fileURLToPath(import.meta.url)), args.values.entry)],
	bundle: true,
	outdir: args.values.outdir,
	mainFields: ['svelte', 'browser', 'module', 'main', 'exports'],
	minify: false, //so the resulting code is easier to understand
	sourcemap: 'inline',
	splitting: true,
	write: true,
	format: 'esm',
	plugins: [
		//TODO Use esbuild-svelte
		SveltePlugin,
		//To glob service imports
		EsbuildPluginImportGlob(),
	],
	conditions: [
		//TODO I feel like I should get a better global dev flag, maybe when we switch to bun
		process.env.NODE_ENV === 'development' ? 'development' : 'production',
		'svelte',
	],
};

export const errorHandler = (error: any, location: string | undefined = undefined) => {
	console.warn('Errors: ', error, location);
	process.exit(1);
};

//make sure the directory exists before stuff gets put into it
if (!(await fs.exists(args.values.outdir)))
	await fs.mkdir(args.values.outdir);

esbuild
	.build(buildOptions)
	.catch((e: unknown) => errorHandler(e));

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
	await fs.copyFile(path.join('./static/', file), path.join(args.values.outdir, file));