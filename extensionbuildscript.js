import esbuild from "esbuild";
import {buildOptions, errorHandler} from "./buildscript.js";
import fs from "fs";

const outdir = './chrome extension/dist';

const extensionBuildOptions = {
	...buildOptions,
	entryPoints: [
		'./src/extension/background.js',
		'./src/extension/pixiv/userPage/entry.ts',
	],
	outdir,
	splitting: false,
	format: `iife`,
};

if (!fs.existsSync(outdir))
	fs.mkdirSync(outdir);

esbuild
	.build(extensionBuildOptions)
	.catch(errorHandler);