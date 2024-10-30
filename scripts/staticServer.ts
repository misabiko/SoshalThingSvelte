import {parseArgs} from 'util';

const args = parseArgs({
	args: Bun.argv,
	options: {
		port: {
			type: 'string',
			short: 'p',
			default: '8080',
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

		return new Response(Bun.file('dist' + pathname));
	},
});

console.log(`Listening on ${server.url}`);