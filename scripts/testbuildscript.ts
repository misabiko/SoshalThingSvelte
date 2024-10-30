import fs from 'fs';
import esbuild from 'esbuild';
import {buildOptions, errorHandler} from './buildscript.js';
import {Glob} from 'bun';

const entryPoints = [
	'./tests/unit/**/spec.ts',
	'./tests/unit/**/*.spec.ts',
].flatMap(glob => Array.from(new Glob(glob).scanSync()));

const outdir = './dist-test';
//make sure the directory exists before stuff gets put into it
if (!fs.existsSync(outdir))
	fs.mkdirSync(outdir);

esbuild
	.build({
		...buildOptions,
		entryPoints,
		outdir,
		platform: 'node',
		external: ['@playwright/test'],
		inject: ['src/unit-shims.js'],
	})
	.catch((e: unknown) => errorHandler(e));