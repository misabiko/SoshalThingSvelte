import {parseArgs} from 'util';
import path from 'path';

const args = parseArgs({
	args: Bun.argv,
	options: {
		port: {
			type: 'string',
			default: '8080',
		},
		dist: {
			type: 'string',
			default: './dist',
		},
	},
	strict: true,
	allowPositionals: true,
});

const server = Bun.serve({
	port: parseInt(args.values.port),
	fetch(req) {
		let pathname = new URL(req.url).pathname;
		if (pathname === '/')
			pathname = '/index.html';

		return new Response(Bun.file(path.join(args.values.dist, pathname)));
	},
});

console.log(`Listening on ${server.url}`);