import fs from 'fs';
import esbuild from 'esbuild';
import {buildOptions, errorHandler} from "./buildscript.js";

const outdir = './dist-test';

//make sure the directoy exists before stuff gets put into it
if (!fs.existsSync(outdir))
	fs.mkdirSync(outdir);

esbuild
	.build({
		...buildOptions,
		entryPoints: ['tests/unit/spec.ts'],
		outdir,
		platform: 'node',
		external: ['@playwright/test'],
		inject: ['src/unit-shims.js']
	})
	.catch(errorHandler);
