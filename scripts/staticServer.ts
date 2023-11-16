import path from 'path';

let port = 8080;
const portIndex = process.argv.findIndex(s => s === '--port');
if (portIndex > -1 && process.argv.length >= portIndex)
	port = parseInt(process.argv[portIndex + 1]);

Bun.serve({
	port,
	async fetch(req) {
		const url = new URL(req.url + (new URL(req.url).pathname === '/' ? 'index.html' : ''))
		const filePath = path.join('dist', url.pathname);
		const file = Bun.file('./' + filePath);

		return new Response(file);
	},
});

console.log(`Listening on http://localhost:${port}`);