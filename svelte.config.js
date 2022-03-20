import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import postcss from 'rollup-plugin-postcss';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		sass: {
			prependData: `@import 'src/lib/styles/_core.sass';`,
		}
	}),

	kit: {
		adapter: adapter({
			fallback: 'index.html',
		}),
		browser: {
			router: false,
		},
		files: {}
	},

	plugins: [postcss()]
};

export default config;
