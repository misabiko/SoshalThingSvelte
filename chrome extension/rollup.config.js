import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';

export default {
	input: 'background.js',
	output: {
		dir: 'dist'
	},
	plugins: [
		resolve(),
		json(),
		copy({
			targets: [
				{src: 'manifest.json', dest: 'dist'},
				{src: 'rule.json', dest: 'dist'},
			]
		})
	]
};