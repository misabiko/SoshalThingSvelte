import fs from 'fs';
import esbuild from 'esbuild';
import {buildOptions, errorHandler} from './buildscript.js';
import glob from 'resolve-glob';

const outdir = './dist-test';

//make sure the directoy exists before stuff gets put into it
if (!fs.existsSync(outdir))
	fs.mkdirSync(outdir);

esbuild
	.build({
		...buildOptions,
		entryPoints: glob.sync(['./tests/unit/**/spec.ts', './tests/unit/**/*.spec.ts']),
		outdir,
		platform: 'node',
		external: ['@playwright/test'],
		inject: ['src/unit-shims.js']
	})
	.catch(errorHandler);
