import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import postcss from 'rollup-plugin-postcss';
//import {reactivePreprocess} from 'svelte-reactive-preprocessor';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		dev: true
	},
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			sass: {
				prependData: `@import 'src/lib/styles/_core.sass';`,
			}
		}),
		//reactivePreprocess(),
	],

	kit: {
		adapter: adapter({
			fallback: 'index.html',
		}),
		browser: {
			router: false,
		},
		files: {}
	},

	plugins: [postcss()],
};

export default config;
