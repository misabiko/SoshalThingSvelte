import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import svelte from "rollup-plugin-svelte";
import preprocess from 'svelte-preprocess';
import postcss from "rollup-plugin-postcss";
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import fs from "fs";

export default [
	{
		input: 'src/extension/background.js',
		output: {
			dir: 'chrome extension/dist/'
		},
		plugins: [
			resolve(),
			json(),
			commonjs({
				include: [
					'node_modules/oauth-1.0a/oauth-1.0a.js',
					'node_modules/crypto-js/*.js',
				],
			})
		]
	},
	...fs.readdirSync('./src/extension/favviewer').map(file => {
		return {
			input: `src/extension/favviewer/${file}`,
			output: {
				sourcemap: true,
				format: 'iife',
				name: 'app',
				file: `chrome extension/dist/${file.replace('.ts', '')}.js`
			},
			plugins: [
				typescript(),
				svelte({
					preprocess: preprocess()
				}),
				//css({ output: 'favviewer.css' }),

				resolve({
					browser: true,
					dedupe: ['svelte']
				}),
				postcss(),
			],
			vite: {
				server: {
					hmr: false,
				}
			}
		}
	})
];