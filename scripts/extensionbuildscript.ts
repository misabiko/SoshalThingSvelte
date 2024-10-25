import esbuild, {type BuildOptions} from 'esbuild';
import {buildOptions, errorHandler} from './buildscript.js';
import fs from 'fs';
import fastGlob from 'fast-glob';

const outdir = './extension/dist';

const entryPoints = [
	...fastGlob.globSync('./src/extension/**/entry.ts', {onlyFiles: true}),
	...fastGlob.globSync('./src/services/**/entry.ts', {onlyFiles: true}),
];

const extensionBuildOptions: BuildOptions = {
	...buildOptions,
	entryPoints,
	outdir,
	splitting: false,
	format: 'esm',
};

if (!fs.existsSync(outdir))
	fs.mkdirSync(outdir);

esbuild
	.build(extensionBuildOptions)
	.catch(errorHandler)
	.then(() => {
		const manifest = JSON.parse(fs.readFileSync('./extension/manifest.json', 'utf8'));

		const entryPointNames = entryPoints
			.map(e => e.split('/'))
			.map(e => [e.slice(0, -2).join('/'), e.at(-2)]);
		const manifestPaths = [...new Set(entryPointNames.map(e => e[0] + '/manifest.json'))];

		const contentScripts = [];
		for (const service of manifestPaths) {
			const serviceManifest: ServiceManifest = JSON.parse(fs.readFileSync(service, 'utf8'));
			const serviceSplit = service.split('/');
			serviceSplit.splice(1, 2);
			const servicePath = serviceSplit.slice(0, -1).join('/');

			contentScripts.push(Object.entries(serviceManifest).map(([entry, contentScript]) => {
				const entryPath = servicePath + '/' + entry + '/entry';
				return {
					matches: contentScript.matches,
					exclude_matches: contentScript.exclude_matches,
					js: [entryPath + '.js'],
					css: [entryPath + '.css'],
				};
			}));
		}

		manifest.content_scripts = contentScripts.flat();
		fs.writeFileSync(outdir + '/manifest.json', JSON.stringify(manifest, null, '\t'));
	});

type ServiceManifest = {
	[entry: string]: {
		matches: string[]
		exclude_matches?: string[]
	}
};