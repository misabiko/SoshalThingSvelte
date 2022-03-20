import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import svelte from "rollup-plugin-svelte";
import preprocess from 'svelte-preprocess';
import postcss from "rollup-plugin-postcss";
import typescript from '@rollup/plugin-typescript';

export default [
	{
		input: 'src/extension/background.js',
		output: {
			dir: 'chrome extension/dist/'
		},
		plugins: [
			resolve(),
			json()
		]
	},
	{
		input: 'src/extension/favviewer.ts',
		output: {
			sourcemap: true,
			format: 'iife',
			name: 'app',
			file: 'chrome extension/dist/favviewer.js'
		},
		plugins: [
			typescript(),
			svelte({
				preprocess: preprocess({
					sass: {
						prependData: `@import 'src/styles/_core.sass';`,
					}
				})
			}),
			//css({ output: 'favviewer.css' }),

			resolve({
				browser: true,
				dedupe: ['svelte']
			}),
			postcss(),
		]
	}
];